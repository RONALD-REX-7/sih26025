/**
 * SIH26025 Comprehensive Domain Entities & Type Definitions
 * Complete typed representation of the underground mine subsidence digital intelligence layer.
 */

import { RiskState } from './risk-states';
import { DataProvenance } from './provenance';
import { SensorType, UserRole } from './constants';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type NodeStatus = 'online' | 'offline' | 'degraded' | 'maintenance';
export type AlertStatus = 'active' | 'acknowledged' | 'escalated' | 'resolved';

export interface Mine {
  id: string;
  code: string;
  name: string;
  location_name: string;
  state: string;
  latitude: number;
  longitude: number;
  boundary_geojson?: GeoJSON.FeatureCollection | GeoJSON.Geometry | null;
  is_demo: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Panel {
  id: string;
  mine_id: string;
  code: string;
  name: string;
  depth_m: number;
  extraction_method: string;
  extraction_status: string;
  coordinates_geojson?: GeoJSON.Geometry | null;
  created_at: string;
  updated_at: string;
}

export interface DeploymentZone {
  id: string;
  mine_id: string;
  name: string;
  zone_type: string;
  geometry_geojson: GeoJSON.Geometry;
  risk_level: RiskState;
  description?: string | null;
  created_at: string;
}

export interface SensorNode {
  id: string;
  node_code: string;
  mine_id: string;
  panel_id?: string | null;
  latitude: number;
  longitude: number;
  elevation_m: number;
  status: NodeStatus;
  battery_level: number;
  hardware_version: string;
  firmware_version: string;
  provenance: DataProvenance;
  last_heartbeat?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  panel?: Panel;
  sensors?: Sensor[];
  current_health?: SensorHealth;
}

export interface Sensor {
  id: string;
  sensor_code: string;
  node_id: string;
  sensor_type: SensorType;
  unit: string;
  min_threshold?: number | null;
  max_threshold?: number | null;
  rate_threshold?: number | null;
  calibration_factor: number;
  is_active: boolean;
  created_at: string;
}

export interface TelemetrySample {
  id: string;
  sensor_id: string;
  node_id: string;
  timestamp: string;
  value: number;
  raw_value?: number | null;
  quality_score: number;
  provenance: DataProvenance;
}

export interface SensorHealth {
  id: string;
  node_id: string;
  timestamp: string;
  battery_pct: number;
  signal_rssi: number;
  packet_loss_pct: number;
  drift_detected: boolean;
  status: NodeStatus;
}

export interface AnomalyEvent {
  id: string;
  node_id: string;
  sensor_id?: string | null;
  detected_at: string;
  anomaly_type: string;
  severity: AlertSeverity;
  z_score?: number | null;
  rate_of_change?: number | null;
  persistence_sec: number;
  confidence: number;
  status: string;
  details?: Record<string, unknown>;
  // Virtual / Joined
  node?: SensorNode;
  sensor?: Sensor;
}

export interface ContributingFactor {
  factor: string;
  weight: number;
  state: 'nominal' | 'elevated' | 'critical' | 'aligned' | 'deviated';
  metricValue?: string;
}

export interface RiskAssessment {
  id: string;
  mine_id: string;
  panel_id?: string | null;
  assessed_at: string;
  risk_state: RiskState;
  confidence: number;
  score: number; // 0.0 to 1.0 normalized risk score
  contributing_factors: ContributingFactor[];
  evidence_summary: string;
  model_version: string;
  provenance: DataProvenance;
}

export interface Alert {
  id: string;
  risk_assessment_id?: string | null;
  mine_id: string;
  panel_id?: string | null;
  severity: AlertSeverity;
  risk_state: RiskState;
  title: string;
  message: string;
  status: AlertStatus;
  triggered_at: string;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  // Joined
  risk_assessment?: RiskAssessment;
  panel?: Panel;
}

export interface AlertAcknowledgement {
  id: string;
  alert_id: string;
  user_id: string;
  user_role: UserRole;
  action_taken: string;
  comment?: string | null;
  acknowledged_at: string;
}

export interface SimulationSession {
  id: string;
  session_code: string;
  name: string;
  scenario: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'reset';
  seed: number;
  speed: number;
  affected_node_codes: string[];
  started_at?: string | null;
  stopped_at?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ExternalObservation {
  id: string;
  mine_id: string;
  observation_date: string;
  sensor_source: string;
  observation_type: string;
  mean_velocity_mm_yr?: number | null;
  cumulative_disp_mm?: number | null;
  data_quality?: string | null;
  provenance: DataProvenance;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  mine_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  user_id?: string | null;
  user_role?: UserRole | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  payload_before?: Record<string, unknown> | null;
  payload_after?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}
