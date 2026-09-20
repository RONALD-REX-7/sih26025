import { describe, it, expect, beforeEach } from 'vitest';
import { RiskEngine } from './risk-engine';
import { NormalizedTelemetrySample } from '@/lib/domain/telemetry-contract';
import { NodeHealthSample } from '@/lib/telemetry/types';

describe('SIH26025 Explainable RiskEngine & Sensor Fusion', () => {
  let riskEngine: RiskEngine;

  beforeEach(() => {
    riskEngine = RiskEngine.getInstance();
    riskEngine.reset();
  });

  const createSample = (
    nodeId: string,
    metric: string,
    value: number,
    timestampOffsetSec = 0
  ): NormalizedTelemetrySample => {
    const type =
      metric === 'TILT_X'
        ? 'tilt_x'
        : metric === 'TILT_Y'
        ? 'tilt_y'
        : metric === 'DISP_Z'
        ? 'displacement'
        : metric === 'VIB_RMS'
        ? 'vibration'
        : 'strain';

    const unit =
      metric === 'DISP_Z'
        ? 'mm'
        : metric.startsWith('TILT')
        ? 'arcsec'
        : metric === 'VIB_RMS'
        ? 'mm/s'
        : 'microstrain';

    return {
      nodeId,
      sensorCode: `${nodeId}-${metric}`,
      sensorType: type,
      timestamp: new Date(Date.now() + timestampOffsetSec * 1000).toISOString(),
      value,
      unit,
      qualityScore: 0.99,
      batteryPct: 95,
      provenance: 'SIMULATED',
    };
  };

  it('maintains Normal state when all nodes report within nominal baselines', () => {
    // Feed nominal samples for Panel P-101
    const nodes = ['SN-101', 'SN-102', 'SN-103', 'SN-104'];
    for (const node of nodes) {
      riskEngine.processSample(createSample(node, 'DISP_Z', 18.5));
      riskEngine.processSample(createSample(node, 'TILT_X', 12.4));
      riskEngine.processSample(createSample(node, 'VIB_RMS', 1.2));
      riskEngine.processSample(createSample(node, 'STRAIN', 420.0));
    }

    const assessment = riskEngine.evaluateRiskState(Date.now());
    expect(assessment.riskState).toBe('Normal');
    expect(assessment.evidence.spatialCorrelationScore).toBe(0);
    expect(assessment.evidence.dgmsComplianceStatus).toBe('COMPLIANT');
    expect(assessment.evidence.whyRiskChanged).toContain('No anomalous movement');
  });

  it('differentiates ANOMALY vs RISK: Transient machinery vibration flags Advisory, NOT Critical or Warning', () => {
    // Baseline state first
    riskEngine.processSample(createSample('SN-101', 'DISP_Z', 18.5));
    riskEngine.processSample(createSample('SN-101', 'TILT_X', 12.4));

    // Sudden high-amplitude vibration transient from continuous miner passing (6.5 mm/s, z > 20)
    riskEngine.processSample(createSample('SN-101', 'VIB_RMS', 6.5, 1));

    // Anomaly should be detected on vibration channel
    const anomalies = riskEngine.getActiveAnomalies();
    const vibAnomaly = anomalies.find((a) => a.sensorCode === 'SN-101-VIB_RMS');
    expect(vibAnomaly).toBeDefined();
    expect(vibAnomaly?.anomalyType).toBe('SPIKE');

    // BUT Risk State MUST NOT be Critical or Warning because displacement and tilt are stable!
    const assessment = riskEngine.evaluateRiskState(Date.now() + 1000);
    expect(assessment.riskState).toBe('Advisory');
    expect(assessment.riskState).not.toBe('Critical');
    expect(assessment.riskState).not.toBe('Warning');

    // Evidence must explicitly cite machinery noise explanation
    expect(assessment.evidence.primaryReason).toContain('Machinery Noise');
    expect(assessment.evidence.modalityAgreementScore).toBeLessThan(0.4);
    expect(assessment.evidence.spatialCorrelationScore).toBe(0);
  });

  it('evaluates isolated sensor drift as Advisory or Watch without triggering Warning', () => {
    // Simulate monotonic drift on SN-102-TILT_X over 30 ticks
    for (let t = 0; t <= 30; t++) {
      const driftedVal = 12.4 + t * 1.2; // drifts up to ~48 arcsec
      riskEngine.processSample(createSample('SN-102', 'TILT_X', driftedVal, t));
      // Adjacent nodes remain flat at baseline
      riskEngine.processSample(createSample('SN-101', 'TILT_X', 12.4, t));
      riskEngine.processSample(createSample('SN-103', 'TILT_X', 12.4, t));
      // Displacement remains flat
      riskEngine.processSample(createSample('SN-102', 'DISP_Z', 18.5, t));
    }

    const assessment = riskEngine.evaluateRiskState(Date.now() + 30000);
    // Should be at most Watch due to single-station persistence, NEVER Warning or Critical
    expect(['Advisory', 'Watch']).toContain(assessment.riskState);
    expect(assessment.riskState).not.toBe('Warning');
    expect(assessment.riskState).not.toBe('Critical');

    // Spatial correlation must remain low because adjacent nodes SN-101 & SN-103 are nominal
    expect(assessment.evidence.spatialCorrelationScore).toBeLessThan(0.3);
  });

  it('escalates to Warning and Critical on correlated multi-node deformation and geotechnical threshold breach', () => {
    const startTime = Date.now();

    // Simulate multi-node subsidence basin in Panel P-101 (SN-101, SN-102, SN-103)
    for (let t = 1; t <= 20; t++) {
      // SN-102 epicenter displacement crosses 52mm (> 48mm DGMS critical threshold)
      riskEngine.processSample(createSample('SN-102', 'DISP_Z', 18.5 + t * 1.8, t));
      riskEngine.processSample(createSample('SN-102', 'TILT_X', 12.4 + t * 3.5, t));
      riskEngine.processSample(createSample('SN-102', 'STRAIN', 420.0 + t * 20.0, t));

      // Adjacent nodes SN-101 and SN-103 also deflect (spatial trough correlation)
      riskEngine.processSample(createSample('SN-101', 'DISP_Z', 18.5 + t * 1.3, t));
      riskEngine.processSample(createSample('SN-101', 'TILT_X', 12.4 + t * 2.2, t));
      riskEngine.processSample(createSample('SN-103', 'DISP_Z', 18.5 + t * 1.2, t));
    }

    const assessment = riskEngine.evaluateRiskState(startTime + 20000);
    expect(assessment.riskState).toBe('Critical');
    expect(assessment.score).toBeGreaterThan(0.85);

    // Multi-modal agreement and spatial correlation must both be very high
    expect(assessment.evidence.modalityAgreementScore).toBeGreaterThanOrEqual(0.75);
    expect(assessment.evidence.spatialCorrelationScore).toBeGreaterThanOrEqual(0.75);
    expect(assessment.evidence.dgmsComplianceStatus).toBe('CRITICAL_THRESHOLD');
    expect(assessment.evidence.whatActionRecommended).toContain('IMMEDIATE EVACUATION');
    expect(assessment.evidence.where.affectedNodes).toContain('SN-102');
  });

  it('handles communication loss and marks node health accordingly', () => {
    const health: NodeHealthSample = {
      nodeId: 'SN-105-UUID',
      nodeCode: 'SN-105',
      timestamp: new Date().toISOString(),
      batteryPct: 88,
      signalRssiDbm: -128,
      packetLossPct: 100.0,
      driftDetected: false,
      status: 'offline',
      provenance: 'SIMULATED',
    };

    riskEngine.processNodeHealth(health);
    const assessment = riskEngine.evaluateRiskState(Date.now());
    expect(assessment.riskState).toBe('Advisory');
    expect(assessment.evidence.whyRiskChanged).toContain('Wireless link degradation');
  });

  it('de-escalates cleanly back towards Normal upon recovery', () => {
    // 1. First establish an elevated state
    riskEngine.processSample(createSample('SN-102', 'DISP_Z', 35.0, 1));
    riskEngine.processSample(createSample('SN-101', 'DISP_Z', 30.0, 1));
    riskEngine.evaluateRiskState(Date.now());

    // 2. Reset / Stowing recovery occurs
    riskEngine.reset();
    expect(riskEngine.getCurrentRiskState()).toBe('Normal');
    expect(riskEngine.getActiveAnomalies().length).toBe(0);
    expect(riskEngine.getCurrentEvidence()?.dgmsComplianceStatus).toBe('COMPLIANT');
  });
});
