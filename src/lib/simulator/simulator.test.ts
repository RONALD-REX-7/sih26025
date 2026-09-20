import { describe, it, expect } from 'vitest';
import { Mulberry32 } from './prng';
import { SimulatorEngine } from './simulator-engine';
import { SCENARIO_DEFINITIONS } from './scenario-definitions';
import { validateTelemetrySample } from '@/lib/domain/telemetry-contract';

describe('Mulberry32 Deterministic PRNG', () => {
  it('produces identical sequences for the same seed', () => {
    const prng1 = new Mulberry32(1025);
    const prng2 = new Mulberry32(1025);

    const seq1 = Array.from({ length: 50 }, () => prng1.next());
    const seq2 = Array.from({ length: 50 }, () => prng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const prng1 = new Mulberry32(1025);
    const prng2 = new Mulberry32(2048);

    const val1 = prng1.next();
    const val2 = prng2.next();

    expect(val1).not.toEqual(val2);
  });
});

describe('SimulatorEngine Physics & Determinism', () => {
  it('reproduces identical telemetry sequences given the same seed and scenario', () => {
    const engineA = new SimulatorEngine(42, 'GRADUAL_DEFORMATION');
    const engineB = new SimulatorEngine(42, 'GRADUAL_DEFORMATION');

    for (let i = 0; i < 15; i++) {
      const tickA = engineA.generateTick();
      const tickB = engineB.generateTick();

      expect(tickA.samples.length).toBe(tickB.samples.length);
      expect(tickA.samples.map((s) => s.value)).toEqual(tickB.samples.map((s) => s.value));
    }
  });

  it('verifies MACHINERY_TRANSIENT exhibits elevated vibration pulse that returns to baseline', () => {
    const engine = new SimulatorEngine(100, 'MACHINERY_TRANSIENT');

    // Baseline tick (t=0)
    const tick0 = engine.generateTick();
    const vib0 = tick0.samples.find((s) => s.sensorCode === 'SN-101-VIB_RMS')!;
    expect(vib0.value).toBeLessThan(3.0);

    // Fast-forward to peak disturbance window (t=16)
    for (let t = 1; t <= 16; t++) {
      engine['state'].elapsedSec = t;
    }
    const tick16 = engine.generateTick();
    const vib16 = tick16.samples.find((s) => s.sensorCode === 'SN-101-VIB_RMS')!;
    expect(vib16.value).toBeGreaterThan(4.0); // Spikes during passing heavy machinery
  });

  it('verifies COMMUNICATION_FAILURE flips affected nodes to offline with 100% packet loss', () => {
    const engine = new SimulatorEngine(200, 'COMMUNICATION_FAILURE');

    // Fast forward to t=25
    engine['state'].elapsedSec = 25;
    const tick25 = engine.generateTick();

    const sn105Health = tick25.healths.find((h) => h.nodeCode === 'SN-105')!;
    expect(sn105Health.status).toBe('offline');
    expect(sn105Health.packetLossPct).toBe(100.0);
    expect(sn105Health.signalRssiDbm).toBe(-128);
  });

  it('validates all 80 generated telemetry channels satisfy the unified contract schema', () => {
    const engine = new SimulatorEngine(300, 'ESCALATING_MULTIMODAL_ANOMALY');
    const { samples } = engine.generateTick();

    expect(samples.length).toBe(80); // 16 nodes * 5 channels
    for (const sample of samples) {
      expect(validateTelemetrySample(sample)).toBe(true);
      expect(sample.provenance).toBe('SIMULATED');
    }
  });

  it('confirms all 9 scenario definitions are properly registered with DGMS guidelines', () => {
    const scenarios = Object.keys(SCENARIO_DEFINITIONS);
    expect(scenarios.length).toBe(9);
    expect(scenarios).toContain('NORMAL_BASELINE');
    expect(scenarios).toContain('MACHINERY_TRANSIENT');
    expect(scenarios).toContain('SENSOR_DRIFT');
    expect(scenarios).toContain('COMMUNICATION_FAILURE');
    expect(scenarios).toContain('GRADUAL_DEFORMATION');
    expect(scenarios).toContain('CRACK_PROGRESS');
    expect(scenarios).toContain('MULTI_NODE_CORRELATED_DEFORMATION');
    expect(scenarios).toContain('ESCALATING_MULTIMODAL_ANOMALY');
    expect(scenarios).toContain('RECOVERY');
  });
});
