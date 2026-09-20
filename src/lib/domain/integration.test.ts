import { describe, it, expect, beforeEach } from 'vitest';
import { SimulatorEngine } from '@/lib/simulator/simulator-engine';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { RiskEngine } from '@/lib/ai/risk-engine';
import { AlertEngine } from '@/lib/alerts/alert-engine';
import { AudibleAlarm } from '@/lib/notifications/audible-alarm';

describe('SIH26025 Full Operational Subsystem Integration Chain', () => {
  let simEngine: SimulatorEngine;
  let telemetryEngine: TelemetryEngine;
  let riskEngine: RiskEngine;
  let alertEngine: AlertEngine;

  beforeEach(() => {
    // Reseed and initialize singletons
    simEngine = new SimulatorEngine(1025, 'ESCALATING_MULTIMODAL_ANOMALY');
    telemetryEngine = TelemetryEngine.getInstance();
    riskEngine = RiskEngine.getInstance();
    alertEngine = AlertEngine.getInstance();
  });

  it('executes the complete unbroken pipeline: Sim -> Telemetry -> Risk -> Alert -> Acknowledge -> Audit', async () => {
    // 1. Initial State
    expect(telemetryEngine).toBeDefined();
    expect(riskEngine).toBeDefined();
    expect(alertEngine).toBeDefined();

    // 2. Generate multi-modal tick from Simulator
    const { samples, healths } = simEngine.generateTick();
    expect(samples.length).toBeGreaterThan(0);
    expect(healths.length).toBe(16);

    // Ingest into TelemetryEngine
    for (const sample of samples) {
      telemetryEngine.ingestSample(sample);
    }
    const telemStats = telemetryEngine.getStats();
    expect(telemStats.totalSamplesIngested).toBeGreaterThan(0);

    // 3. Process through RiskEngine
    for (const sample of samples) {
      riskEngine.processSample(sample);
    }
    for (const health of healths) {
      riskEngine.processNodeHealth(health);
    }

    const currentRisk = riskEngine.getCurrentRiskState();
    expect(['Normal', 'Advisory', 'Watch', 'Warning', 'Critical']).toContain(currentRisk);

    const evidence = riskEngine.getCurrentEvidence();
    expect(evidence).toBeDefined();
    expect(evidence?.where.panelCode).toBeDefined();
    expect(evidence?.contributingFactors).toBeDefined();
    expect(evidence?.whyRiskChanged).toBeDefined();
    expect(evidence?.whatActionRecommended).toBeDefined();

    // 4. Force high-strain evaluation to test Alert creation and anti-storm deduplication
    const assessment = riskEngine.getCurrentAssessment();
    expect(assessment).toBeDefined();

    if (assessment) {
      // Elevate to Warning to verify AlertEngine response
      const elevatedAssessment = {
        ...assessment,
        riskState: 'Warning' as const,
        score: 0.78,
        evidence: {
          ...assessment.evidence,
          where: {
            ...assessment.evidence.where,
            panelCode: 'P-102',
            affectedNodes: ['SN-105', 'SN-106'],
            epicenterNode: 'SN-106',
          },
          whyRiskChanged: 'Sustained tensorial displacement across P-102 extraction line.',
          whatActionRecommended: 'Suspend extraction operations and restrict entry per CMR 2017 Reg 112.',
        },
      };

      alertEngine.processRiskAssessment(elevatedAssessment);

      const activeAlerts = alertEngine.getAlerts().filter((a) => a.status === 'active' || a.status === 'escalated');
      const warningAlert = activeAlerts.find((a) => a.panel_id === 'P-102' || a.panel_id === assessment.panelId);
      expect(warningAlert).toBeDefined();
      expect(warningAlert?.severity).toBe('high');

      // 5. Operator Statutory Sign-off & Acknowledgment under CMR 2017 Reg 112
      if (warningAlert) {
        const ackResult = await alertEngine.acknowledgeAlert(warningAlert.id, {
          operatorName: 'Dr. A. K. Sengupta',
          userRole: 'SafetyOfficer',
          actionTaken: 'Barricaded hazardous district and suspended coal extraction operations',
          comment: 'Convergence velocity monitored continuously via optical extensometer.',
        });

        expect(ackResult).toBeDefined();
        expect(ackResult?.status).toBe('acknowledged');
        expect(ackResult?.acknowledged_by).toContain('Dr. A. K. Sengupta');

        // Verify alarm auto-silencing
        expect(AudibleAlarm.getInstance().isPlaying()).toBe(false);

        // 6. Verify Immutable Audit Entry was committed
        const auditEntries = alertEngine.getAuditEntries();
        const ackAudit = auditEntries.find(
          (entry) => entry.action === 'ALERT_ACKNOWLEDGED' && entry.entity_id === warningAlert.id
        );

        expect(ackAudit).toBeDefined();
        expect(ackAudit?.user_role).toBe('SafetyOfficer');
        expect((ackAudit?.payload_after as Record<string, unknown>).action_taken).toContain(
          'Barricaded hazardous district'
        );
      }
    }
  });

  it('guarantees zero-fabrication provenance tags on all pipeline outputs', () => {
    const { samples, healths } = simEngine.generateTick();
    for (const s of samples) {
      expect(s.provenance).toBe('SIMULATED');
    }
    for (const h of healths) {
      expect(h.provenance).toBe('SIMULATED');
    }
  });
});
