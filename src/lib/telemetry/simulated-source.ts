/**
 * SIH26025 Simulated Telemetry Source
 * Implements ITelemetrySource using the deterministic simulation engine.
 */

import { ITelemetrySource, NormalizedTelemetrySample, TelemetryBatch } from '@/lib/domain/telemetry-contract';
import { DataProvenance } from '@/lib/domain/provenance';

export class SimulatedTelemetrySource implements ITelemetrySource {
  public readonly sourceName = 'SIMULATOR_ENGINE';
  public readonly provenance: DataProvenance = 'SIMULATED';

  private sampleListeners: ((sample: NormalizedTelemetrySample) => void)[] = [];
  private batchListeners: ((batch: TelemetryBatch) => void)[] = [];
  private isRunning = false;

  public async start(): Promise<void> {
    this.isRunning = true;
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
  }

  public onSample(callback: (sample: NormalizedTelemetrySample) => void): void {
    this.sampleListeners.push(callback);
  }

  public onBatch(callback: (batch: TelemetryBatch) => void): void {
    this.batchListeners.push(callback);
  }

  /**
   * Called by the simulator engine to dispatch a sample
   */
  public emitSample(sample: NormalizedTelemetrySample): void {
    if (!this.isRunning) return;
    for (const listener of this.sampleListeners) {
      listener(sample);
    }
  }

  /**
   * Called by the simulator engine to dispatch a batch
   */
  public emitBatch(batch: TelemetryBatch): void {
    if (!this.isRunning) return;
    for (const listener of this.batchListeners) {
      listener(batch);
    }
  }
}
