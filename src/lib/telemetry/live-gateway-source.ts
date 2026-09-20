/**
 * SIH26025 Live ESP32 Gateway Telemetry Source
 * 
 * Hardware Architecture Path:
 * Physical ESP32 edge nodes -> LoRaWAN Gateway -> Telemetry Ingestion HTTP/MQTT Endpoint.
 * Normalizes physical payloads into NormalizedTelemetrySample.
 */

import { ITelemetrySource, NormalizedTelemetrySample, TelemetryBatch } from '@/lib/domain/telemetry-contract';
import { DataProvenance } from '@/lib/domain/provenance';
import { SensorType } from '@/lib/domain/constants';

export interface RawESP32Payload {
  gatewayId: string;
  nodeCode: string;
  timestamp: string;
  batteryMv: number;
  rssiDbm: number;
  snrDb: number;
  channels: {
    sensorCode: string;
    sensorType: SensorType;
    rawAdc: number;
    calibratedValue: number;
    unit: string;
  }[];
}

export class LiveGatewayTelemetrySource implements ITelemetrySource {
  public readonly sourceName = 'ESP32_LORA_GATEWAY';
  public readonly provenance: DataProvenance = 'LIVE';

  private sampleListeners: ((sample: NormalizedTelemetrySample) => void)[] = [];
  private batchListeners: ((batch: TelemetryBatch) => void)[] = [];
  private isConnected = false;

  public async start(): Promise<void> {
    this.isConnected = true;
  }

  public async stop(): Promise<void> {
    this.isConnected = false;
  }

  public onSample(callback: (sample: NormalizedTelemetrySample) => void): void {
    this.sampleListeners.push(callback);
  }

  public onBatch(callback: (batch: TelemetryBatch) => void): void {
    this.batchListeners.push(callback);
  }

  /**
   * Ingest raw payload transmitted by physical ESP32 gateway
   */
  public ingestRawGatewayPayload(raw: RawESP32Payload): NormalizedTelemetrySample[] {
    if (!this.isConnected) return [];

    const normalizedSamples: NormalizedTelemetrySample[] = raw.channels.map((ch) => {
      // Calculate battery percentage from LiFePO4 / Li-Ion voltage (3.0V - 4.2V)
      const batteryPct = Math.min(Math.max(((raw.batteryMv - 3000) / 1200) * 100, 0), 100);

      return {
        nodeId: raw.nodeCode,
        sensorCode: ch.sensorCode,
        sensorType: ch.sensorType,
        timestamp: raw.timestamp || new Date().toISOString(),
        value: ch.calibratedValue,
        rawAdc: ch.rawAdc,
        unit: ch.unit,
        qualityScore: raw.snrDb > 0 ? 0.98 : 0.85,
        batteryPct,
        signalRssiDbm: raw.rssiDbm,
        provenance: 'LIVE',
      };
    });

    for (const sample of normalizedSamples) {
      for (const listener of this.sampleListeners) {
        listener(sample);
      }
    }

    const batch: TelemetryBatch = {
      batchId: `batch-${Date.now()}`,
      sourceType: 'ESP32_GATEWAY',
      gatewayId: raw.gatewayId,
      receivedAt: new Date().toISOString(),
      sampleCount: normalizedSamples.length,
      samples: normalizedSamples,
      provenance: 'LIVE',
    };

    for (const listener of this.batchListeners) {
      listener(batch);
    }

    return normalizedSamples;
  }
}
