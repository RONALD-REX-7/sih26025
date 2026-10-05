/**
 * SIH26025 Domain Constants & Geotechnical Thresholds
 * Grounded in Indian DGMS (Directorate General of Mines Safety) technical circulars.
 */

import { DataProvenance } from './provenance';

export type UserRole = 'MineManager' | 'SafetyOfficer' | 'Engineer' | 'Administrator';

export const USER_ROLES: readonly UserRole[] = [
  'MineManager',
  'SafetyOfficer',
  'Engineer',
  'Administrator',
] as const;

export type SensorType =
  | 'tilt_x'
  | 'tilt_y'
  | 'displacement'
  | 'vibration'
  | 'strain'
  | 'crack'
  | 'moisture'
  | 'pore_pressure'
  | 'acoustic_emission';

export interface SensorMetadata {
  type: SensorType;
  displayName: string;
  unit: string;
  nominalRange: [number, number];
  warningThreshold: number;
  criticalThreshold: number;
  rateOfChangeLimitPerMinute: number;
  description: string;
}

export const SENSOR_METADATA: Record<SensorType, SensorMetadata> = {
  tilt_x: {
    type: 'tilt_x',
    displayName: 'Biaxial Tilt (X-Axis)',
    unit: 'arcsec',
    nominalRange: [-150, 150],
    warningThreshold: 200,
    criticalThreshold: 350,
    rateOfChangeLimitPerMinute: 20,
    description: 'High-precision angular tilt along primary panel extraction axis',
  },
  tilt_y: {
    type: 'tilt_y',
    displayName: 'Biaxial Tilt (Y-Axis)',
    unit: 'arcsec',
    nominalRange: [-150, 150],
    warningThreshold: 200,
    criticalThreshold: 350,
    rateOfChangeLimitPerMinute: 20,
    description: 'High-precision angular tilt transverse to extraction axis',
  },
  displacement: {
    type: 'displacement',
    displayName: 'Surface Displacement (Vertical Z)',
    unit: 'mm',
    nominalRange: [0, 40],
    warningThreshold: 60,
    criticalThreshold: 100,
    rateOfChangeLimitPerMinute: 3.5,
    description: 'Surface borehole displacement gauge measuring progressive subsidence',
  },
  vibration: {
    type: 'vibration',
    displayName: 'Peak Particle Velocity (PPV) / Vibration',
    unit: 'mm/s',
    nominalRange: [0, 5],
    warningThreshold: 10,
    criticalThreshold: 18,
    rateOfChangeLimitPerMinute: 4.0,
    description: 'Triaxial seismograph measuring roof stratal fracturing and transient blasting',
  },
  strain: {
    type: 'strain',
    displayName: 'Pillar / Rockbolt Strain',
    unit: 'microstrain',
    nominalRange: [-800, 1200],
    warningThreshold: 1800,
    criticalThreshold: 2800,
    rateOfChangeLimitPerMinute: 150,
    description: 'Vibrating wire strain gauge installed on roof support pillars',
  },
  crack: {
    type: 'crack',
    displayName: 'Crack / Fissure Aperture Extensometer',
    unit: 'mm',
    nominalRange: [0.0, 1.5],
    warningThreshold: 5.0,
    criticalThreshold: 12.0,
    rateOfChangeLimitPerMinute: 0.8,
    description: 'Surface crack / fissure dilation gauge measuring tensile stratal separation (Prototype channel)',
  },
  moisture: {
    type: 'moisture',
    displayName: 'Strata Volumetric Water Content',
    unit: '%',
    nominalRange: [5, 25],
    warningThreshold: 35,
    criticalThreshold: 45,
    rateOfChangeLimitPerMinute: 5.0,
    description: 'Soil moisture / water table proximity sensor',
  },
  pore_pressure: {
    type: 'pore_pressure',
    displayName: 'Piezometric Pore Pressure',
    unit: 'kPa',
    nominalRange: [100, 400],
    warningThreshold: 600,
    criticalThreshold: 850,
    rateOfChangeLimitPerMinute: 30,
    description: 'Vibrating wire piezometer measuring hydro-geological pressure',
  },
  acoustic_emission: {
    type: 'acoustic_emission',
    displayName: 'Acoustic Emission Hit Rate',
    unit: 'hits/min',
    nominalRange: [0, 20],
    warningThreshold: 80,
    criticalThreshold: 200,
    rateOfChangeLimitPerMinute: 50,
    description: 'High-frequency ultrasonic sensor detecting micro-cracking prior to main roof fall',
  },
};

export const DEMO_MINE_INFO = {
  id: 'MINE-JHR-001',
  name: 'Bhowra-West Colliery (Demo Mine)',
  coalField: 'Jharia Coalfield, Dhanbad, Jharkhand',
  coordinates: {
    latitude: 23.6845,
    longitude: 86.3982,
    zoom: 15.5,
  },
  depthRange: '150m - 265m',
  seamName: 'Seam VII / VIII Top',
  dgmsClassification: 'Category-IV Severe Subsidence Potential',
  defaultProvenance: 'DEMO' as DataProvenance,
};

// Regulatory reference mapping (CMR 2017 Reg 112 & Technical Circulars)
// Note: Prototype threshold benchmarks for engineering decision support; not a legal compliance determination.
export const DGMS_REGULATORY_THRESHOLDS = {
  maxAllowableSubsidenceSlope: 3.0, // mm/m (Warning indicator)
  criticalSubsidenceSlope: 10.0, // mm/m (Evacuation indicator)
  maxAllowableHorizontalStrain: 2.0, // mm/m
  railwayProtectedMarginMeters: 45.0, // distance buffer
  referenceRegulation: 'Coal Mines Regulations 2017, Regulation 112 (Subsidence Management)',
};

export interface InterNodePairConfig {
  pairId: string;
  nodeA: string;
  nodeB: string;
  baselineDistanceM: number;
  criticalStrainDeltaMm: number;
  description: string;
}

export const INTER_NODE_PAIRS: readonly InterNodePairConfig[] = [
  {
    pairId: 'PAIR-101-102',
    nodeA: 'SN-101',
    nodeB: 'SN-102',
    baselineDistanceM: 42.5,
    criticalStrainDeltaMm: 35.0,
    description: 'Panel P-101 extraction rib boundary chord',
  },
  {
    pairId: 'PAIR-102-103',
    nodeA: 'SN-102',
    nodeB: 'SN-103',
    baselineDistanceM: 45.0,
    criticalStrainDeltaMm: 38.0,
    description: 'Panel P-101 central goaf depression chord',
  },
  {
    pairId: 'PAIR-105-106',
    nodeA: 'SN-105',
    nodeB: 'SN-106',
    baselineDistanceM: 48.0,
    criticalStrainDeltaMm: 40.0,
    description: 'Panel P-102 haulage incline protection chord',
  },
  {
    pairId: 'PAIR-109-110',
    nodeA: 'SN-109',
    nodeB: 'SN-110',
    baselineDistanceM: 50.0,
    criticalStrainDeltaMm: 42.0,
    description: 'Panel P-103 railway siding protective barrier chord',
  },
] as const;
