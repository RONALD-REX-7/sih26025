/**
 * SIH26025 GIS Spatial Data Provider
 * 
 * Authentic Geographic Setting:
 * Bhowra-West Colliery, Jharia Coalfield, Dhanbad, Jharkhand, India.
 * EPSG:4326 / WGS84 Geographic Coordinate System.
 * 
 * Strict Provenance Differentiation:
 * 1. REAL / PUBLIC: Jharia Coalfield leasehold bounds, Indian Railways siding, ventilation shaft.
 * 2. PROTOTYPE OVERLAY: Underground extraction panels (P-101 to P-104).
 * 3. SIMULATED TELEMETRY: 16 ESP32 monitoring nodes.
 * 4. DEMO / EXTERNAL: Synthetic Sentinel-1 InSAR surface deformation grid.
 * 5. EMPIRICAL REFERENCE: CMPDI / DGMS documented empirical subsidence trough benchmark.
 */

import {
  GisInSarPoint,
  GeomechanicalReferenceProfile,
  SubsidenceEventRecord,
  GisLayerConfig,
} from '@/lib/domain/gis-types';

export const GIS_BOUNDS = {
  minLat: 23.6810,
  maxLat: 23.6890,
  minLon: 86.3945,
  maxLon: 86.4025,
  centerLat: 23.6850,
  centerLon: 86.3985,
  referenceDatum: 'WGS84 / EPSG:4326',
  scale: '1:5,000 Cadastral Engineering Scale',
};

export const GIS_LAYERS_CONFIG: GisLayerConfig[] = [
  {
    id: 'panels',
    name: 'Underground Panels',
    category: 'PROTOTYPE',
    provenance: 'DEMO',
    visible: true,
    count: 4,
    description: 'Underground extraction panels P-101 through P-104 in Seam VII/VIII (Prototype Overlay)',
    badgeClass: 'border-slate-300 text-slate-700 dark:text-slate-300',
  },
  {
    id: 'nodes',
    name: 'Sensor Fleet Nodes',
    category: 'TELEMETRY',
    provenance: 'SIMULATED',
    visible: true,
    count: 16,
    description: '16 ESP32 edge telemetry stations with multi-modal geotechnical sensors',
    badgeClass: 'border-emerald-300 text-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
  {
    id: 'infrastructure',
    name: 'Surface Assets & Railway',
    category: 'GEOGRAPHY',
    provenance: 'EXTERNAL',
    visible: true,
    count: 3,
    description: 'Indian Railways Dhanbad-Adra branch siding (45m DGMS buffer) and colliery shafts',
    badgeClass: 'border-amber-300 text-amber-700 bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    id: 'goaf',
    name: 'Goaf Depillaring Zones',
    category: 'PROTOTYPE',
    provenance: 'DEMO',
    visible: true,
    count: 2,
    description: 'Active depillaring extraction caving margins and historical abandoned workings',
    badgeClass: 'border-red-300 text-red-700 bg-red-50/50 dark:bg-red-950/20',
  },
  {
    id: 'insar',
    name: 'InSAR Satellite Grid',
    category: 'EXTERNAL',
    provenance: 'DEMO',
    visible: false,
    count: 18,
    description: 'Synthetic Sentinel-1 interferometric surface deformation observations (Demo / Simulated)',
    badgeClass: 'border-indigo-300 text-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20',
  },
  {
    id: 'geomechanical',
    name: 'Geomechanical Benchmark',
    category: 'REFERENCE',
    provenance: 'EXTERNAL',
    visible: false,
    count: 1,
    description: 'CMPDI/DGMS empirical subsidence trough profile and angle of draw (~32°) limit',
    badgeClass: 'border-purple-300 text-purple-700 bg-purple-50/50 dark:bg-purple-950/20',
  },
  {
    id: 'events',
    name: 'Subsidence Events',
    category: 'TELEMETRY',
    provenance: 'SIMULATED',
    visible: true,
    count: 3,
    description: 'Historical and actively detected ground deformation event epicenters and anomaly clusters',
    badgeClass: 'border-orange-300 text-orange-700 bg-orange-50/50 dark:bg-orange-950/20',
  },
];

/**
 * Synthetic InSAR observations for Bhowra-West Colliery
 * Clearly labeled DEMO / EXTERNAL — not live satellite telemetry.
 */
export const GIS_INSAR_POINTS: GisInSarPoint[] = [
  {
    id: 'SAR-01',
    latitude: 23.6860,
    longitude: 86.3975,
    displacementMm: -28.4,
    velocityMmYr: -48.2,
    coherence: 0.88,
    satelliteTrack: 'Sentinel-1A Descending Track 107',
    acquisitionDate: '2026-09-12T00:42:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-02',
    latitude: 23.6865,
    longitude: 86.3980,
    displacementMm: -32.1,
    velocityMmYr: -54.0,
    coherence: 0.92,
    satelliteTrack: 'Sentinel-1A Descending Track 107',
    acquisitionDate: '2026-09-12T00:42:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-03',
    latitude: 23.6855,
    longitude: 86.3970,
    displacementMm: -22.6,
    velocityMmYr: -38.5,
    coherence: 0.84,
    satelliteTrack: 'Sentinel-1A Descending Track 107',
    acquisitionDate: '2026-09-12T00:42:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-04',
    latitude: 23.6870,
    longitude: 86.3990,
    displacementMm: -14.2,
    velocityMmYr: -24.0,
    coherence: 0.81,
    satelliteTrack: 'Sentinel-1A Descending Track 107',
    acquisitionDate: '2026-09-12T00:42:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-05',
    latitude: 23.6840,
    longitude: 86.3975,
    displacementMm: -18.7,
    velocityMmYr: -31.2,
    coherence: 0.86,
    satelliteTrack: 'Sentinel-1B Ascending Track 42',
    acquisitionDate: '2026-09-08T12:15:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-06',
    latitude: 23.6835,
    longitude: 86.3965,
    displacementMm: -9.5,
    velocityMmYr: -16.0,
    coherence: 0.79,
    satelliteTrack: 'Sentinel-1B Ascending Track 42',
    acquisitionDate: '2026-09-08T12:15:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-07',
    latitude: 23.6825,
    longitude: 86.3955,
    displacementMm: -3.2,
    velocityMmYr: -5.4,
    coherence: 0.94,
    satelliteTrack: 'Sentinel-1B Ascending Track 42',
    acquisitionDate: '2026-09-08T12:15:00Z',
    provenance: 'DEMO',
  },
  {
    id: 'SAR-08',
    latitude: 23.6880,
    longitude: 86.4010,
    displacementMm: -1.8,
    velocityMmYr: -3.0,
    coherence: 0.95,
    satelliteTrack: 'Sentinel-1A Descending Track 107',
    acquisitionDate: '2026-09-12T00:42:00Z',
    provenance: 'DEMO',
  },
];

/**
 * CMPDI / DGMS Empirical Subsidence Reference Profile
 * Grounded in documented empirical guidelines for Jharia Coalfield Seam VII/VIII.
 */
export const GEOMECHANICAL_REFERENCE: GeomechanicalReferenceProfile = {
  id: 'GEO-REF-JHR-01',
  title: 'CMPDI Empirical Subsidence Reference Trough (Seam VII/VIII)',
  methodology:
    'Documented CMPDI Indian Coalfield Empirical Formulations: Subsidence factor a=0.65 with hydraulic sand stowing, angle of draw θ=32°, inflection point at 0.4×H.',
  angleDrawDegrees: 32.0,
  limitAngleDegrees: 58.0,
  inflectionPointDistanceM: 74.0,
  maxPredictedSubsidenceMm: 38.5,
  seamThicknessM: 4.2,
  extractionDepthM: 185.0,
  provenance: 'EXTERNAL',
  caveatNotice:
    'This profile is a standardized empirical reference model from CMPDI guidelines. It serves as an engineering benchmark and does not imply independent collapse prediction.',
  profilePoints: [
    { distanceMeters: -120, predictedSubsidenceMm: 0.5, criticalSlopeMmPerM: 0.2, criticalStrainMmPerM: 0.1 },
    { distanceMeters: -80, predictedSubsidenceMm: 3.2, criticalSlopeMmPerM: 0.8, criticalStrainMmPerM: 0.6 },
    { distanceMeters: -40, predictedSubsidenceMm: 12.8, criticalSlopeMmPerM: 2.1, criticalStrainMmPerM: 1.8 },
    { distanceMeters: 0, predictedSubsidenceMm: 38.5, criticalSlopeMmPerM: 0.4, criticalStrainMmPerM: 0.5 }, // Panel Center (trough bottom)
    { distanceMeters: 40, predictedSubsidenceMm: 14.1, criticalSlopeMmPerM: 2.2, criticalStrainMmPerM: 1.9 },
    { distanceMeters: 80, predictedSubsidenceMm: 3.8, criticalSlopeMmPerM: 0.9, criticalStrainMmPerM: 0.7 },
    { distanceMeters: 120, predictedSubsidenceMm: 0.6, criticalSlopeMmPerM: 0.2, criticalStrainMmPerM: 0.1 },
  ],
};

/**
 * Historical and Demonstrated Subsidence Events linked to spatial nodes
 */
export const GIS_SUBSIDENCE_EVENTS: SubsidenceEventRecord[] = [
  {
    id: 'EVT-2026-001',
    title: 'Correlated Multi-Station Subsidence Basin on Panel P-101',
    type: 'CORRELATED_BASIN',
    detectedAt: '2026-09-20T11:45:00Z',
    riskState: 'Warning',
    epicenterNodeCode: 'SN-102',
    affectedNodeCodes: ['SN-101', 'SN-102', 'SN-103'],
    panelCode: 'P-101',
    maxDisplacementMm: 34.6,
    maxTiltArcsec: 68.4,
    maxVibrationMmPerS: 2.4,
    maxStrainMicrostrain: 640.0,
    timelineSteps: [
      { timestampSec: 0, timeLabel: 't+00:00', description: 'Nominal baseline stability across Panel P-101.', riskState: 'Normal' },
      { timestampSec: 15, timeLabel: 't+00:15', description: 'Incipient extensional strain detected on SN-102.', riskState: 'Advisory' },
      { timestampSec: 35, timeLabel: 't+00:35', description: 'Multi-node displacement trough confirmed on SN-101 and SN-103.', riskState: 'Watch' },
      { timestampSec: 60, timeLabel: 't+01:00', description: 'Deformation gradient exceeds 3.0 mm/m. Safety Officer notified under CMR 2017 Reg 112.', riskState: 'Warning' },
    ],
    associatedAlertIds: ['alt-001'],
    provenance: 'SIMULATED',
  },
  {
    id: 'EVT-2026-002',
    title: 'Transient Surface Machinery Haulage Vibration',
    type: 'TRANSIENT_VIBRATION',
    detectedAt: '2026-09-20T10:15:00Z',
    riskState: 'Advisory',
    epicenterNodeCode: 'SN-101',
    affectedNodeCodes: ['SN-101'],
    panelCode: 'P-101',
    maxDisplacementMm: 18.6,
    maxTiltArcsec: 12.8,
    maxVibrationMmPerS: 5.8,
    maxStrainMicrostrain: 422.0,
    timelineSteps: [
      { timestampSec: 0, timeLabel: 't+00:00', description: 'Nominal background microseismic vibration (1.2 mm/s).', riskState: 'Normal' },
      { timestampSec: 5, timeLabel: 't+00:05', description: 'Acoustic vibration spike (5.8 mm/s) recorded as heavy dumpers pass above.', riskState: 'Advisory' },
      { timestampSec: 25, timeLabel: 't+00:25', description: 'Displacement and tilt remain nominal; vibration decays back to baseline.', riskState: 'Advisory' },
    ],
    associatedAlertIds: [],
    provenance: 'SIMULATED',
  },
  {
    id: 'EVT-2026-003',
    title: 'Incipient Roof Extensometer Flexure on Panel P-103',
    type: 'DEFORMATION_ACCELERATION',
    detectedAt: '2026-09-19T08:30:00Z',
    riskState: 'Watch',
    epicenterNodeCode: 'SN-110',
    affectedNodeCodes: ['SN-109', 'SN-110'],
    panelCode: 'P-103',
    maxDisplacementMm: 29.2,
    maxTiltArcsec: 38.5,
    maxVibrationMmPerS: 2.1,
    maxStrainMicrostrain: 510.0,
    timelineSteps: [
      { timestampSec: 0, timeLabel: 't+00:00', description: 'Depillaring operations in Central Seam VII.', riskState: 'Normal' },
      { timestampSec: 40, timeLabel: 't+00:40', description: 'Continuous extensometer displacement creep reaches 25mm.', riskState: 'Advisory' },
      { timestampSec: 90, timeLabel: 't+01:30', description: 'Multi-sample persistence confirmed (>10s). Inspection ordered.', riskState: 'Watch' },
    ],
    associatedAlertIds: ['alt-002'],
    provenance: 'SIMULATED',
  },
];
