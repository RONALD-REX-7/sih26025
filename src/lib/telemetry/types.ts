/**
 * SIH26025 Telemetry Ingestion Architecture & Type Definitions
 * 
 * Safety-Critical Rule:
 * Standardized contracts shared between physical ESP32 edge telemetry and
 * software simulation engine.
 */

import { DataProvenance } from '@/lib/domain/provenance';
import { NodeStatus } from '@/lib/domain/types';
import { NormalizedTelemetrySample, TelemetryBatch, ITelemetrySource } from '@/lib/domain/telemetry-contract';

export type { NormalizedTelemetrySample, TelemetryBatch, ITelemetrySource };

export interface NodeHealthSample {
  nodeId: string;
  nodeCode: string;
  timestamp: string;
  batteryPct: number;
  batteryVoltage?: number;
  signalRssiDbm: number;
  snrDb?: number;
  packetLossPct: number;
  driftDetected: boolean;
  status: NodeStatus;
  provenance: DataProvenance;
}

export type TelemetrySampleCallback = (sample: NormalizedTelemetrySample) => void;
export type TelemetryBatchCallback = (batch: TelemetryBatch) => void;
export type NodeHealthCallback = (health: NodeHealthSample) => void;

export interface IngestionStats {
  totalSamplesIngested: number;
  totalBatchesIngested: number;
  lastReceivedAt: string | null;
  activeSourceType: 'SIMULATED' | 'LIVE_GATEWAY' | 'OFFLINE';
  droppedSamplesCount: number;
  persistenceErrorsCount: number;
}
