/**
 * SIH26025 Deterministic Scenario Definitions
 * 
 * 9 Coherent Geotechnical & Operational Scenarios
 * Calibrated against Jharia Coalfield (Bhowra-West Colliery) extraction conditions.
 */

import { RiskState } from '@/lib/domain/risk-states';

export type SimulationScenarioId =
  | 'NORMAL_BASELINE'
  | 'MACHINERY_TRANSIENT'
  | 'SENSOR_DRIFT'
  | 'COMMUNICATION_FAILURE'
  | 'GRADUAL_DEFORMATION'
  | 'CRACK_PROGRESS'
  | 'MULTI_NODE_CORRELATED_DEFORMATION'
  | 'ESCALATING_MULTIMODAL_ANOMALY'
  | 'RECOVERY';

export interface ScenarioDefinition {
  id: SimulationScenarioId;
  name: string;
  category: 'baseline' | 'transient' | 'hardware' | 'geotechnical' | 'emergency';
  description: string;
  geotechnicalContext: string;
  affectedNodeCodes: string[];
  durationSeconds: number;
  expectedMaxRisk: RiskState;
  expectedAnomalies: string[];
  dgmsReference?: string;
}

export const SCENARIO_DEFINITIONS: Record<SimulationScenarioId, ScenarioDefinition> = {
  NORMAL_BASELINE: {
    id: 'NORMAL_BASELINE',
    name: 'Normal Operating Baseline',
    category: 'baseline',
    description: 'Background strata stability across Panels P-101 to P-104 with nominal diurnal ambient thermal variations.',
    geotechnicalContext: 'Seam VII/VIII strata at 185m–265m depth exhibits negligible flexing. Extensometer displacement steady at 18.5mm, tilt slope < 0.8 mm/m, background vibration PPV < 1.5 mm/s.',
    affectedNodeCodes: [],
    durationSeconds: 120,
    expectedMaxRisk: 'Normal',
    expectedAnomalies: [],
    dgmsReference: 'DGMS Circular (Coal) No. 04 of 2017 baseline',
  },
  MACHINERY_TRANSIENT: {
    id: 'MACHINERY_TRANSIENT',
    name: 'Machinery & Surface Haulage Transient',
    category: 'transient',
    description: 'High-frequency surface vibration pulse from heavy diesel dumpers near Indian Railways siding above Panel P-101.',
    geotechnicalContext: 'At t=15s, PPV vibration spikes up to 7.8 mm/s on nodes SN-101 & SN-102. Tilt and borehole displacement remain unchanged (r < 0.05). Decays exponentially back to baseline within 25 seconds.',
    affectedNodeCodes: ['SN-101', 'SN-102'],
    durationSeconds: 90,
    expectedMaxRisk: 'Normal',
    expectedAnomalies: ['Transient PPV Spike (Filtered by Persistence Window)'],
    dgmsReference: 'CMR 2017 Reg 112: Transient vs Structural distinction',
  },
  SENSOR_DRIFT: {
    id: 'SENSOR_DRIFT',
    name: 'Transducer Zero-Drift (Single Node)',
    category: 'hardware',
    description: 'Isolated linear bias shift on Node SN-104 Biaxial Tilt X without physical strata motion or neighboring correlation.',
    geotechnicalContext: 'Clinometer drift on SN-104 (+0.08 mm/m/min) while SN-103 and SN-105 remain flat (cross-node r = 0.02). Engine diagnoses isolated sensor malfunction rather than geological failure.',
    affectedNodeCodes: ['SN-104'],
    durationSeconds: 120,
    expectedMaxRisk: 'Advisory',
    expectedAnomalies: ['Uncorrelated Single-Transducer Drift'],
  },
  COMMUNICATION_FAILURE: {
    id: 'COMMUNICATION_FAILURE',
    name: 'Sub-Band LoRaWAN Link Disruption',
    category: 'hardware',
    description: 'RF attenuation / gateway dropout on Panel P-102 nodes, driving packet loss to 100% and triggering watchdog alerts.',
    geotechnicalContext: 'Nodes SN-105 through SN-108 suffer severe link degradation at t=20s. RSSI drops to -128 dBm, status transitions to degraded then offline, proving fail-soft telemetry timeout alerts.',
    affectedNodeCodes: ['SN-105', 'SN-106', 'SN-107', 'SN-108'],
    durationSeconds: 90,
    expectedMaxRisk: 'Advisory',
    expectedAnomalies: ['Telemetry Watchdog Timeout', 'High Packet Loss (100%)'],
  },
  GRADUAL_DEFORMATION: {
    id: 'GRADUAL_DEFORMATION',
    name: 'Continuous Miner Depillaring Flexure',
    category: 'geotechnical',
    description: 'Monotonic progressive roof sagging and surface depression following active extraction in Panel P-101.',
    geotechnicalContext: 'Sigmoidal increase in borehole extensometer displacement (+0.25 mm/min) and tilt slope (+0.12 mm/m/min) across nodes SN-101, SN-102, SN-103 over 2 minutes, elevating risk to Advisory and Watch.',
    affectedNodeCodes: ['SN-101', 'SN-102', 'SN-103'],
    durationSeconds: 180,
    expectedMaxRisk: 'Watch',
    expectedAnomalies: ['Persistent Multi-Station Tilt Elevation', 'Continuous Extensometer Sag'],
    dgmsReference: 'DGMS Tech Circular 4/2017: Strata Sag Limits',
  },
  CRACK_PROGRESS: {
    id: 'CRACK_PROGRESS',
    name: 'Stepped Roof Micro-Shear Fracturing',
    category: 'geotechnical',
    description: 'Discrete step-wise displacement jumps corresponding to micro-shearing and delamination of sandstone roof strata.',
    geotechnicalContext: 'Step displacement jump (+4.2mm in 2s) at t=35s accompanied by synchronized acoustic emission / microseismic burst (PPV 6.4 mm/s) and rockbolt tension increase (+190 microstrain).',
    affectedNodeCodes: ['SN-102', 'SN-103'],
    durationSeconds: 120,
    expectedMaxRisk: 'Watch',
    expectedAnomalies: ['Discontinuous Displacement Step', 'Acoustic Microseismic Burst'],
  },
  MULTI_NODE_CORRELATED_DEFORMATION: {
    id: 'MULTI_NODE_CORRELATED_DEFORMATION',
    name: 'Coherent Goaf Subsidence Trough',
    category: 'geotechnical',
    description: 'Spatial subsidence basin development centered at Node SN-102 with strong cross-node spatial concordance.',
    geotechnicalContext: 'Gaussian spatial attenuation profile over Panel P-101 depillaring sector. Strong inter-station Pearson correlation (r > 0.85) between SN-101, SN-102, and SN-103 confirming large-scale strata flexing.',
    affectedNodeCodes: ['SN-101', 'SN-102', 'SN-103', 'SN-104'],
    durationSeconds: 240,
    expectedMaxRisk: 'Warning',
    expectedAnomalies: ['Spatial Subsidence Trough', 'High Inter-Station Correlation (r=0.88)'],
    dgmsReference: 'CMR 2017 Reg 111 & 112: Goaf Boundary Control',
  },
  ESCALATING_MULTIMODAL_ANOMALY: {
    id: 'ESCALATING_MULTIMODAL_ANOMALY',
    name: 'Escalating Multi-Modal Strata Instability',
    category: 'emergency',
    description: 'Complete 5-phase progressive hazard escalation from Normal [L0] to Critical [L4] evacuation threshold.',
    geotechnicalContext: 'T=0-30s: Normal. T=30-60s: Advisory (persistent tilt). T=60-100s: Watch (extensometer > 28mm). T=100-140s: Warning (multi-modal convergence, PPV > 6 mm/s). T>140s: Critical (> 50mm displacement, siren trigger).',
    affectedNodeCodes: ['SN-101', 'SN-102', 'SN-103'],
    durationSeconds: 200,
    expectedMaxRisk: 'Critical',
    expectedAnomalies: [
      'Multi-Station Tilt Gradient Advisory',
      'Extensometer Watch Limit Exceeded',
      'Microseismic Acoustic Energy Warning',
      'DGMS Critical Evacuation Perimeter Trigger',
    ],
    dgmsReference: 'DGMS Emergency Evacuation Protocol Rule 112',
  },
  RECOVERY: {
    id: 'RECOVERY',
    name: 'Post-Support Stabilization & Recovery',
    category: 'baseline',
    description: 'Strata stabilization following hydraulic sand stowing and supplementary rockbolting in Panel P-101.',
    geotechnicalContext: 'Exponential deceleration of deformation rates (d/dt -> 0), acoustic microseismic vibrations quiet to background (< 1.0 mm/s), risk safely de-escalates back to Normal.',
    affectedNodeCodes: ['SN-101', 'SN-102'],
    durationSeconds: 120,
    expectedMaxRisk: 'Normal',
    expectedAnomalies: ['Strata Stabilization & Rate Decay'],
  },
};
