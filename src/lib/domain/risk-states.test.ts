import { describe, it, expect } from 'vitest';
import {
  RISK_STATES,
  RISK_STATE_CONFIGS,
  isValidRiskState,
  compareRiskStates,
  RiskState,
} from './risk-states';
import { DATA_PROVENANCES, isValidProvenance } from './provenance';
import { SENSOR_METADATA, SensorType, USER_ROLES } from './constants';

describe('SIH26025 Safety-Critical Domain Model', () => {
  it('should enforce exactly 5 locked risk states in correct severity order', () => {
    expect(RISK_STATES).toEqual(['Normal', 'Advisory', 'Watch', 'Warning', 'Critical']);
    expect(RISK_STATES).toHaveLength(5);

    const states: RiskState[] = ['Normal', 'Advisory', 'Watch', 'Warning', 'Critical'];
    for (let i = 0; i < states.length - 1; i++) {
      expect(compareRiskStates(states[i], states[i + 1])).toBeLessThan(0);
    }
  });

  it('should provide complete operational configuration for all 5 risk states', () => {
    for (const state of RISK_STATES) {
      const config = RISK_STATE_CONFIGS[state];
      expect(config).toBeDefined();
      expect(config.state).toBe(state);
      expect(config.label).toBe(state);
      expect(config.badgeClass).toBeTruthy();
      expect(config.borderClass).toBeTruthy();
      expect(config.bgClass).toBeTruthy();
      expect(config.actionRecommendation).toBeTruthy();
    }
  });

  it('should correctly validate risk states', () => {
    expect(isValidRiskState('Normal')).toBe(true);
    expect(isValidRiskState('Critical')).toBe(true);
    expect(isValidRiskState('Emergency')).toBe(false);
    expect(isValidRiskState('')).toBe(false);
    expect(isValidRiskState(null)).toBe(false);
  });

  it('should enforce strict data provenance classifications', () => {
    expect(DATA_PROVENANCES).toContain('LIVE');
    expect(DATA_PROVENANCES).toContain('SIMULATED');
    expect(DATA_PROVENANCES).toContain('DEMO');
    expect(DATA_PROVENANCES).toContain('HISTORICAL');
    expect(DATA_PROVENANCES).toContain('EXTERNAL');
    expect(DATA_PROVENANCES).toContain('EXPERIMENTAL');
    expect(DATA_PROVENANCES).toContain('ASSUMPTION');

    expect(isValidProvenance('LIVE')).toBe(true);
    expect(isValidProvenance('SYNTHETIC_FAKE')).toBe(false);
  });

  it('should define DGMS geotechnical sensor types with valid thresholds', () => {
    const requiredSensors: SensorType[] = [
      'tilt_x',
      'tilt_y',
      'displacement',
      'vibration',
      'strain',
    ];

    for (const type of requiredSensors) {
      const meta = SENSOR_METADATA[type];
      expect(meta).toBeDefined();
      expect(meta.warningThreshold).toBeLessThan(meta.criticalThreshold);
      expect(meta.rateOfChangeLimitPerMinute).toBeGreaterThan(0);
      expect(meta.unit).toBeTruthy();
    }
  });

  it('should include all 4 authorized user roles', () => {
    expect(USER_ROLES).toEqual([
      'MineManager',
      'SafetyOfficer',
      'Engineer',
      'Administrator',
    ]);
  });
});
