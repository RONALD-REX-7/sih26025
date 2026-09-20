import { describe, it, expect } from 'vitest';
import { validateTelemetrySample, NormalizedTelemetrySample } from './telemetry-contract';

describe('SIH26025 Unified Telemetry Ingestion Contract', () => {
  it('should validate a valid normalized telemetry sample', () => {
    const sample: NormalizedTelemetrySample = {
      nodeId: 'SN-101',
      sensorCode: 'TILT_X',
      sensorType: 'tilt_x',
      timestamp: new Date().toISOString(),
      value: 12.4,
      rawAdc: 2154,
      unit: 'arcsec',
      qualityScore: 0.98,
      batteryPct: 94.0,
      signalRssiDbm: -68,
      provenance: 'DEMO',
    };

    expect(validateTelemetrySample(sample)).toBe(true);
  });

  it('should reject malformed or incomplete telemetry samples', () => {
    expect(validateTelemetrySample(null)).toBe(false);
    expect(validateTelemetrySample({})).toBe(false);
    expect(
      validateTelemetrySample({
        nodeId: 'SN-101',
        // missing sensorCode
        sensorType: 'tilt_x',
        value: 'not-a-number',
      })
    ).toBe(false);
  });

  it('should reject invalid provenance tags', () => {
    const invalidSample = {
      nodeId: 'SN-101',
      sensorCode: 'TILT_X',
      sensorType: 'tilt_x',
      timestamp: new Date().toISOString(),
      value: 12.4,
      unit: 'arcsec',
      qualityScore: 0.98,
      batteryPct: 94.0,
      provenance: 'UNKNOWN_FAKE_TAG',
    };

    expect(validateTelemetrySample(invalidSample)).toBe(false);
  });
});
