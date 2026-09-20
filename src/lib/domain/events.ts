/**
 * SIH26025 Geotechnical Event Domain Models
 */

import { RiskState } from './risk-states';
import { DataProvenance } from './provenance';

export type EventProgression =
  | 'INITIAL_DEVIATION'
  | 'MULTI_NODE_CORRELATION'
  | 'ACCELERATION'
  | 'STABILIZATION'
  | 'RESOLVED';

export interface SubsidenceEvent {
  id: string;
  eventCode: string;
  mineId: string;
  panelId?: string;
  title: string;
  detectedAt: string;
  updatedAt: string;
  riskState: RiskState;
  progression: EventProgression;
  primaryMetric: string;
  maxDisplacementMm: number;
  maxTiltArcsec: number;
  affectedNodeCodes: string[];
  evidenceSummary: string;
  isAcknowledged: boolean;
  provenance: DataProvenance;
}

export interface MicroseismicCluster {
  id: string;
  detectedAt: string;
  panelId: string;
  eventCount: number;
  energyJoules: number;
  centerCoordinates: {
    latitude: number;
    longitude: number;
    depthM: number;
  };
  roofFailureProbability: number; // 0.0 to 1.0
  provenance: DataProvenance;
}
