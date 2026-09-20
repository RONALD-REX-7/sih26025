/**
 * SIH26025 AI Anomaly Detection, Sensor Fusion & Risk Engine Contracts
 * 
 * Safety-Critical Mandate:
 * 1. Distinguish between ANOMALY and RISK (Anomaly ≠ Risk).
 * 2. Risk states must strictly be: Normal, Advisory, Watch, Warning, Critical.
 * 3. All risk transitions must provide clear, evidence-based explainability.
 * 4. Transparent mathematical models (rolling Z-scores, EWMA, rate-of-change,
 *    multi-modal fusion, and spatial correlation) rather than opaque black-boxes.
 */

import { RiskState } from '@/lib/domain/risk-states';
import { DataProvenance } from '@/lib/domain/provenance';
import { SensorType } from '@/lib/domain/constants';

export type AnomalyType =
  | 'SPIKE'
  | 'RATE_OF_CHANGE'
  | 'PERSISTENT_BIAS'
  | 'DGMS_THRESHOLD_EXCEEDED'
  | 'SENSOR_DRIFT'
  | 'COMMUNICATION_LOSS';

export type AnomalySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface AnomalyRecord {
  id: string;
  nodeCode: string;
  sensorCode: string;
  sensorType: SensorType;
  detectedAt: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  zScore: number;
  rateOfChange: number;
  persistenceSec: number;
  confidence: number;
  value: number;
  baselineMean: number;
  unit: string;
  details: Record<string, unknown>;
  provenance: DataProvenance;
}

export interface ContributingFactor {
  factor: string;
  state: 'nominal' | 'elevated' | 'critical' | 'transient' | 'drift' | 'offline';
  weight: number; // 0.0 to 1.0
  evidence: string;
}

export interface RiskEvidence {
  primaryReason: string;
  summary: string;
  what: string;
  where: {
    panelCode: string;
    affectedNodes: string[];
    epicenterNode?: string;
  };
  when: {
    detectedAt: string;
    persistenceSec: number;
    lastEvaluatedAt: string;
  };
  which: {
    channels: string[];
    sensorTypes: SensorType[];
  };
  howPersistent: string;
  whyRiskChanged: string;
  whatActionRecommended: string;
  spatialCorrelationScore: number; // 0.0 (isolated) to 1.0 (strongly correlated across adjacent nodes)
  modalityAgreementScore: number; // 0.0 (single sensor noise) to 1.0 (cross-modal agreement)
  dgmsComplianceStatus:
    | 'COMPLIANT'
    | 'ADVISORY_THRESHOLD'
    | 'WATCH_THRESHOLD'
    | 'WARNING_THRESHOLD'
    | 'CRITICAL_THRESHOLD';
  contributingFactors: ContributingFactor[];
}

export interface RiskAssessmentEvent {
  id: string;
  mineId: string;
  panelId: string;
  assessedAt: string;
  riskState: RiskState;
  confidence: number;
  score: number; // 0.0 (Normal) to 1.0 (Critical)
  evidence: RiskEvidence;
  modelVersion: string;
  provenance: DataProvenance;
}

export interface ChannelStats {
  nodeCode: string;
  sensorCode: string;
  sensorType: SensorType;
  baselineMean: number;
  baselineStdDev: number;
  ewma: number;
  lastValue: number;
  previousValue: number;
  lastTimestamp: number;
  rateOfChange: number; // units per second
  zScore: number;
  consecutiveAnomalousCount: number;
  persistenceStartTime: number | null;
  historyWindow: Array<{ timestamp: number; value: number }>;
}

export type RiskAssessmentCallback = (assessment: RiskAssessmentEvent) => void;
export type AnomalyEventCallback = (anomaly: AnomalyRecord) => void;
