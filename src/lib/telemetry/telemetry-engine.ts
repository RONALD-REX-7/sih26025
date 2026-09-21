/**
 * SIH26025 Central Telemetry Ingestion Engine
 * 
 * Ingestion Pipeline & Event Bus:
 * Receives samples from ITelemetrySource (Simulated or Live ESP32 Gateway),
 * validates against schema, dispatches to active UI subscribers, and
 * asynchronously batches persistence to Supabase with offline resilience.
 */

import {
  NormalizedTelemetrySample,
  TelemetryBatch,
  ITelemetrySource,
  NodeHealthSample,
  TelemetrySampleCallback,
  TelemetryBatchCallback,
  NodeHealthCallback,
  IngestionStats,
} from './types';
import { validateTelemetrySample } from '@/lib/domain/telemetry-contract';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export class TelemetryEngine {
  private static instance: TelemetryEngine | null = null;

  private sampleSubscribers: Set<TelemetrySampleCallback> = new Set();
  private batchSubscribers: Set<TelemetryBatchCallback> = new Set();
  private healthSubscribers: Set<NodeHealthCallback> = new Set();

  private activeSource: ITelemetrySource | null = null;
  private pendingPersistenceBuffer: NormalizedTelemetrySample[] = [];
  private persistenceTimer: NodeJS.Timeout | null = null;
  private isPersisting = false;

  private stats: IngestionStats = {
    totalSamplesIngested: 0,
    totalBatchesIngested: 0,
    lastReceivedAt: null,
    activeSourceType: 'OFFLINE',
    droppedSamplesCount: 0,
    persistenceErrorsCount: 0,
  };

  private nodeUuidByCode = new Map<string, string>();
  private sensorUuidByNodeAndCode = new Map<string, string>();
  private mappingsLoaded = false;

  private constructor() {
    // Start periodic persistence worker (flushes every 5 seconds if buffer has samples)
    if (typeof window !== 'undefined') {
      this.persistenceTimer = setInterval(() => {
        this.flushPersistenceBuffer();
      }, 5000);
    }
  }

  public static getInstance(): TelemetryEngine {
    if (!TelemetryEngine.instance) {
      TelemetryEngine.instance = new TelemetryEngine();
    }
    return TelemetryEngine.instance;
  }

  /**
   * Register active telemetry source (Simulated or Physical Gateway)
   */
  public setSource(source: ITelemetrySource): void {
    if (this.activeSource) {
      this.activeSource.stop();
    }
    this.activeSource = source;
    this.stats.activeSourceType = source.provenance === 'SIMULATED' ? 'SIMULATED' : 'LIVE_GATEWAY';

    // Hook listeners
    this.activeSource.onSample((sample) => this.ingestSample(sample));
    this.activeSource.onBatch((batch) => this.ingestBatch(batch));
  }

  /**
   * Ingest a single normalized telemetry sample
   */
  public ingestSample(sample: NormalizedTelemetrySample): boolean {
    if (!validateTelemetrySample(sample)) {
      this.stats.droppedSamplesCount++;
      return false;
    }

    this.stats.totalSamplesIngested++;
    this.stats.lastReceivedAt = sample.timestamp;

    // Buffer for database persistence (max 100 in queue to prevent memory leaks)
    if (this.pendingPersistenceBuffer.length < 100) {
      this.pendingPersistenceBuffer.push(sample);
    }

    // Broadcast to live subscribers
    for (const callback of this.sampleSubscribers) {
      try {
        callback(sample);
      } catch (err) {
        console.error('Telemetry subscriber error:', err);
      }
    }

    return true;
  }

  /**
   * Ingest an external live hardware sample from API route or gateway
   */
  public ingestExternalSample(sample: NormalizedTelemetrySample): boolean {
    return this.ingestSample(sample);
  }

  /**
   * Ingest a batch of telemetry samples
   */
  public ingestBatch(batch: TelemetryBatch): void {
    this.stats.totalBatchesIngested++;
    this.stats.lastReceivedAt = batch.receivedAt;

    for (const sample of batch.samples) {
      this.ingestSample(sample);
    }

    for (const callback of this.batchSubscribers) {
      try {
        callback(batch);
      } catch (err) {
        console.error('Batch subscriber error:', err);
      }
    }
  }

  /**
   * Ingest node health update
   */
  public ingestNodeHealth(health: NodeHealthSample): void {
    for (const callback of this.healthSubscribers) {
      try {
        callback(health);
      } catch (err) {
        console.error('Health subscriber error:', err);
      }
    }
  }

  /**
   * Asynchronously flush buffered samples to Supabase
   */
  private async flushPersistenceBuffer(): Promise<void> {
    if (this.isPersisting || this.pendingPersistenceBuffer.length === 0) {
      return;
    }

    if (!isSupabaseConfigured()) {
      return;
    }

    this.isPersisting = true;
    const batchToPersist = [...this.pendingPersistenceBuffer];
    this.pendingPersistenceBuffer = [];

    try {
      const supabase = createClient();

      if (!this.mappingsLoaded) {
        const { data: nodes } = await supabase.from('sensor_nodes').select('id, node_code');
        if (nodes && nodes.length > 0) {
          for (const n of nodes) {
            this.nodeUuidByCode.set(n.node_code, n.id);
          }
          const { data: sensors } = await supabase.from('sensors').select('id, sensor_code, node_id');
          if (sensors) {
            const nodeCodeById = new Map<string, string>();
            for (const n of nodes) nodeCodeById.set(n.id, n.node_code);

            for (const s of sensors) {
              const code = nodeCodeById.get(s.node_id);
              if (code) {
                this.sensorUuidByNodeAndCode.set(`${code}-${s.sensor_code}`, s.id);
              }
            }
            this.mappingsLoaded = true;
          }
        }
      }

      if (!this.mappingsLoaded) {
        // If mappings could not be fetched (offline or unauthenticated), skip DB insertion gracefully
        return;
      }

      // Map to DB structure with valid UUIDs
      const records = batchToPersist
        .map((s) => {
          const nodeUuid = this.nodeUuidByCode.get(s.nodeId);
          const sensorUuid = this.sensorUuidByNodeAndCode.get(s.sensorCode);
          if (!nodeUuid || !sensorUuid) return null;

          return {
            node_id: nodeUuid,
            sensor_id: sensorUuid,
            timestamp: s.timestamp,
            value: s.value,
            raw_value: s.rawAdc ?? null,
            quality_score: s.qualityScore,
            provenance: s.provenance,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (records.length > 0) {
        const { error } = await supabase.from('telemetry_samples').insert(records);
        if (error) {
          this.stats.persistenceErrorsCount++;
        }
      }
    } catch {
      this.stats.persistenceErrorsCount++;
    } finally {
      this.isPersisting = false;
    }
  }

  // Subscription methods
  public subscribeToSamples(callback: TelemetrySampleCallback): () => void {
    this.sampleSubscribers.add(callback);
    return () => this.sampleSubscribers.delete(callback);
  }

  public subscribeToBatches(callback: TelemetryBatchCallback): () => void {
    this.batchSubscribers.add(callback);
    return () => this.batchSubscribers.delete(callback);
  }

  public subscribeToNodeHealth(callback: NodeHealthCallback): () => void {
    this.healthSubscribers.add(callback);
    return () => this.healthSubscribers.delete(callback);
  }

  public getStats(): IngestionStats {
    return { ...this.stats };
  }

  public destroy(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }
    this.sampleSubscribers.clear();
    this.batchSubscribers.clear();
    this.healthSubscribers.clear();
  }
}
