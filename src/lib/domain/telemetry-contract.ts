/**
 * SIH26025 Unified Telemetry Ingestion Contract
 * 
 * Safety & Architectural Mandate:
 * The future ESP32 physical edge hardware and the software simulation engine
 * MUST use this exact identical normalized contract. There is no separate
 * "simulator-only" telemetry pipeline.
 */

import { SensorType } from './constants';
import { DataProvenance, isValidProvenance } from './provenance';

export interface NormalizedTelemetrySample {
  nodeId: string;
  sensorCode: string;
  sensorType: SensorType;
  timestamp: string; // ISO-8601 UTC timestamp
  value: number; // Calibrated engineering value (e.g. mm, arcsec, mm/s)
  rawAdc?: number; // Raw ADC reading (0-4095 for ESP32 12-bit ADC)
  unit: string;
  qualityScore: number; // 0.0 (unreliable) to 1.0 (verified)
  batteryPct: number; // 0 to 100%
  signalRssiDbm?: number; // dBm for wireless link
  provenance: DataProvenance;
}

export interface TelemetryBatch {
  batchId: string;
  sourceType: 'ESP32_GATEWAY' | 'SIMULATOR_ENGINE' | 'HISTORICAL_REPLAY';
  gatewayId?: string;
  receivedAt: string;
  sampleCount: number;
  samples: NormalizedTelemetrySample[];
  provenance: DataProvenance;
}

export interface ITelemetrySource {
  readonly sourceName: string;
  readonly provenance: DataProvenance;
  start(): Promise<void>;
  stop(): Promise<void>;
  onSample(callback: (sample: NormalizedTelemetrySample) => void): void;
  onBatch(callback: (batch: TelemetryBatch) => void): void;
}

export function validateTelemetrySample(data: unknown): data is NormalizedTelemetrySample {
  if (typeof data !== 'object' || data === null) return false;
  const s = data as Partial<NormalizedTelemetrySample>;

  return (
    typeof s.nodeId === 'string' &&
    typeof s.sensorCode === 'string' &&
    typeof s.sensorType === 'string' &&
    typeof s.timestamp === 'string' &&
    typeof s.value === 'number' &&
    !Number.isNaN(s.value) &&
    typeof s.unit === 'string' &&
    typeof s.qualityScore === 'number' &&
    s.qualityScore >= 0 &&
    s.qualityScore <= 1.0 &&
    typeof s.batteryPct === 'number' &&
    isValidProvenance(s.provenance)
  );
}
