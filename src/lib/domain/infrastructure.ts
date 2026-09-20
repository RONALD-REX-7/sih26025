/**
 * SIH26025 Mining & Surface Infrastructure Domain Models
 */

import { RiskState } from './risk-states';

export type InfrastructureCategory =
  | 'SURFACE_RAILWAY'
  | 'VENTILATION_SHAFT'
  | 'MAIN_HAULAGE_ROADWAY'
  | 'WATER_BODY_PROTECTION'
  | 'SURFACE_VILLAGE_BOUNDARY'
  | 'SUBSTATION';

export interface InfrastructureAsset {
  id: string;
  code: string;
  name: string;
  category: InfrastructureCategory;
  location: string;
  undergroundOverlayPanelId?: string;
  regulatoryBufferDistanceMeters: number;
  criticalStrainLimitMmPerM: number;
  currentRiskState: RiskState;
  monitoringNodeCodes: string[];
  status: 'SAFE' | 'MONITORING_INTENSIFIED' | 'CRITICAL_BUFFER_BREACHED';
}
