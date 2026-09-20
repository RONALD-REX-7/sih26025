/**
 * SIH26025 Risk States & Classification Engine
 * 
 * Safety-Critical Operational Standard:
 * Exactly five states are permissible across database, APIs, simulator,
 * AI engine, charts, GIS, alerts, reports, and UI.
 * 
 * 1. Normal: Baseline deformation within seasonal and background variance (< 3.0 mm/m).
 * 2. Advisory: Isolated or single-station minor deviation. Elevated monitoring frequency.
 * 3. Watch: Multi-station or persistent deviation detected. Statistical significance (z > 2.5).
 * 4. Warning: Correlated multi-modal anomaly (tilt + displacement + strain) across adjacent nodes.
 * 5. Critical: Sustained acceleration of surface deformation exceeding DGMS geotechnical threshold.
 */

export type RiskState = 'Normal' | 'Advisory' | 'Watch' | 'Warning' | 'Critical';

export const RISK_STATES: readonly RiskState[] = [
  'Normal',
  'Advisory',
  'Watch',
  'Warning',
  'Critical',
] as const;

export interface RiskStateConfig {
  state: RiskState;
  label: string;
  description: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  severityLevel: number; // 0 (Normal) to 4 (Critical)
  actionRecommendation: string;
}

export const RISK_STATE_CONFIGS: Record<RiskState, RiskStateConfig> = {
  Normal: {
    state: 'Normal',
    label: 'Normal',
    description: 'Ground parameters within nominal baseline and DGMS regulatory thresholds.',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    severityLevel: 0,
    actionRecommendation: 'Maintain routine automated polling and periodic telemetry health checks.',
  },
  Advisory: {
    state: 'Advisory',
    label: 'Advisory',
    description: 'Isolated sensor deviation or transient vibration detected without spatial correlation.',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    textClass: 'text-blue-700 dark:text-blue-400',
    severityLevel: 1,
    actionRecommendation: 'Verify sensor node calibration and observe 15-minute persistence window.',
  },
  Watch: {
    state: 'Watch',
    label: 'Watch',
    description: 'Multi-sample persistence detected across primary tilt or displacement channels.',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
    textClass: 'text-amber-700 dark:text-amber-400',
    severityLevel: 2,
    actionRecommendation: 'Alert shift geotechnical in-charge. Restrict heavy machinery travel over affected panel zone.',
  },
  Warning: {
    state: 'Warning',
    label: 'Warning',
    description: 'Correlated multi-sensor acceleration detected across multiple adjacent nodes.',
    badgeClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    borderClass: 'border-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-950/20',
    textClass: 'text-orange-700 dark:text-orange-400',
    severityLevel: 3,
    actionRecommendation: 'Safety Officer acknowledgement mandatory. Prepare extraction panel evacuation standby protocol.',
  },
  Critical: {
    state: 'Critical',
    label: 'Critical',
    description: 'Severe persistent deformation gradient exceeding critical geomechanical threshold (> 10 mm/m or rapid acceleration).',
    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 animate-pulse',
    borderClass: 'border-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    textClass: 'text-red-700 dark:text-red-400',
    severityLevel: 4,
    actionRecommendation: 'IMMEDIATE EVACUATION of affected underground panels and surface barrier perimeter as per DGMS emergency plan.',
  },
};

export function isValidRiskState(value: unknown): value is RiskState {
  return typeof value === 'string' && RISK_STATES.includes(value as RiskState);
}

export function getRiskStateConfig(state: RiskState): RiskStateConfig {
  return RISK_STATE_CONFIGS[state] ?? RISK_STATE_CONFIGS.Normal;
}

export function compareRiskStates(a: RiskState, b: RiskState): number {
  return RISK_STATE_CONFIGS[a].severityLevel - RISK_STATE_CONFIGS[b].severityLevel;
}
