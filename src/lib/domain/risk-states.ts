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
    badgeClass: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
    borderClass: 'border-[#2F6B4F]',
    bgClass: 'bg-[#EAF2ED]',
    textClass: 'text-[#2F6B4F]',
    severityLevel: 0,
    actionRecommendation: 'Maintain routine automated polling and periodic telemetry health checks.',
  },
  Advisory: {
    state: 'Advisory',
    label: 'Advisory',
    description: 'Isolated sensor deviation or transient vibration detected without spatial correlation.',
    badgeClass: 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30',
    borderClass: 'border-[#9A6A00]',
    bgClass: 'bg-[#FBF6E9]',
    textClass: 'text-[#9A6A00]',
    severityLevel: 1,
    actionRecommendation: 'Verify sensor node calibration and observe 15-minute persistence window.',
  },
  Watch: {
    state: 'Watch',
    label: 'Watch',
    description: 'Multi-sample persistence detected across primary tilt or displacement channels.',
    badgeClass: 'bg-[#FCF2E9] text-[#A85A00] border-[#A85A00]/30',
    borderClass: 'border-[#A85A00]',
    bgClass: 'bg-[#FCF2E9]',
    textClass: 'text-[#A85A00]',
    severityLevel: 2,
    actionRecommendation: 'Alert shift geotechnical in-charge. Restrict heavy machinery travel over affected panel zone.',
  },
  Warning: {
    state: 'Warning',
    label: 'Warning',
    description: 'Correlated multi-sensor acceleration detected across multiple adjacent nodes.',
    badgeClass: 'bg-[#FDF0ED] text-[#B42318] border-[#B42318]/30',
    borderClass: 'border-[#B42318]',
    bgClass: 'bg-[#FDF0ED]',
    textClass: 'text-[#B42318]',
    severityLevel: 3,
    actionRecommendation: 'Safety Officer acknowledgement mandatory. Prepare extraction panel evacuation standby protocol.',
  },
  Critical: {
    state: 'Critical',
    label: 'Critical',
    description: 'Severe persistent deformation gradient exceeding critical geomechanical threshold (> 10 mm/m or rapid acceleration).',
    badgeClass: 'bg-[#FBEBE9] text-[#91180E] border-[#91180E]/40 font-bold',
    borderClass: 'border-[#91180E]',
    bgClass: 'bg-[#FBEBE9]',
    textClass: 'text-[#91180E]',
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
