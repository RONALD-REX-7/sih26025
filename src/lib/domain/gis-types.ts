/**
 * SIH26025 GIS & Spatial Surveillance Layer Type Definitions
 * 
 * Safety-Critical Guidelines:
 * 1. Geographic context strictly rooted in authentic WGS84 coordinates.
 * 2. Visual and metadata provenance strictly distinguishes:
 *    - Real/Public Geographic Context (Leasehold, Railway Siding, Shafts)
 *    - Prototype Overlays (Panels P-101 to P-104)
 *    - Simulated Sensor Telemetry (16 ESP32 nodes)
 *    - External Observations (Sentinel-1 InSAR synthetic grid)
 *    - Documented Empirical Benchmarks (CMPDI/DGMS Subsidence Trough)
 */

import { RiskState } from './risk-states';
import { DataProvenance } from './provenance';
import { SensorNode, Panel, Alert } from './types';
import { AnomalyRecord } from '@/lib/ai/types';

export type GisLayerId =
  | 'panels'
  | 'nodes'
  | 'infrastructure'
  | 'goaf'
  | 'insar'
  | 'geomechanical'
  | 'events';

export interface GisLayerConfig {
  id: GisLayerId;
  name: string;
  category: 'GEOGRAPHY' | 'PROTOTYPE' | 'TELEMETRY' | 'EXTERNAL' | 'REFERENCE';
  provenance: DataProvenance;
  visible: boolean;
  count?: number;
  description: string;
  badgeClass: string;
}

export interface GisInSarPoint {
  id: string;
  latitude: number;
  longitude: number;
  displacementMm: number; // LOS displacement in mm (-35mm to +5mm)
  velocityMmYr: number;
  coherence: number; // 0.0 to 1.0 interferometric quality
  satelliteTrack: 'Sentinel-1A Descending Track 107' | 'Sentinel-1B Ascending Track 42';
  acquisitionDate: string;
  provenance: DataProvenance;
}

export interface GeomechanicalProfilePoint {
  distanceMeters: number; // distance from panel center / rib line
  predictedSubsidenceMm: number; // Empirical profile S(x)
  measuredSubsidenceMm?: number; // Real-time sensor measurement
  criticalSlopeMmPerM: number;
  criticalStrainMmPerM: number;
}

export interface GeomechanicalReferenceProfile {
  id: string;
  title: string;
  methodology: string; // e.g. "CMPDI Indian Coalfield Empirical Model (Subsidence Factor a=0.65, Draw Angle=32°)"
  angleDrawDegrees: number; // 30° to 35° in Jharia Coalfield
  limitAngleDegrees: number;
  inflectionPointDistanceM: number;
  maxPredictedSubsidenceMm: number;
  seamThicknessM: number;
  extractionDepthM: number;
  provenance: DataProvenance;
  profilePoints: GeomechanicalProfilePoint[];
  caveatNotice: string;
}

export interface SubsidenceEventRecord {
  id: string;
  title: string;
  type: 'DEFORMATION_ACCELERATION' | 'CORRELATED_BASIN' | 'TRANSIENT_VIBRATION' | 'CRACK_PROGRESSION' | 'SENSOR_DRIFT';
  detectedAt: string;
  riskState: RiskState;
  epicenterNodeCode: string;
  affectedNodeCodes: string[];
  panelCode: string;
  maxDisplacementMm: number;
  maxTiltArcsec: number;
  maxVibrationMmPerS: number;
  maxStrainMicrostrain: number;
  timelineSteps: Array<{
    timestampSec: number;
    timeLabel: string;
    description: string;
    riskState: RiskState;
  }>;
  associatedAlertIds: string[];
  provenance: DataProvenance;
}

export interface NodeInvestigationData {
  node: SensorNode;
  panel?: Panel;
  riskState: RiskState;
  activeAnomalies: AnomalyRecord[];
  latestTelemetry: Record<string, { value: number; unit: string; quality: number; timestamp: string }>;
  localTiltVector: { x: number; y: number; magnitudeMmPerM: number };
  recentEvents: SubsidenceEventRecord[];
}

export interface EventInvestigationData {
  event: SubsidenceEventRecord;
  affectedNodes: SensorNode[];
  associatedAlerts: Alert[];
}
