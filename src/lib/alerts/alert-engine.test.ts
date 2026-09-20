import { describe, it, expect, beforeEach } from 'vitest';
import { AlertEngine } from './alert-engine';
import { RiskAssessmentEvent } from '@/lib/ai/types';

describe('SIH26025 Operational Alert & Audit Pipeline', () => {
  let engine: AlertEngine;

  beforeEach(() => {
    engine = AlertEngine.getInstance();
  });

  it('triggers a critical alert and audit entry when RiskEngine emits Critical state', () => {
    const mockAssessment: RiskAssessmentEvent = {
      id: 'test-risk-crit-1',
      mineId: '388b9f62-1218-4f8b-bdda-87bbd066a974',
      panelId: 'p-102',
      assessedAt: new Date().toISOString(),
      riskState: 'Critical',
      score: 0.92,
      confidence: 0.88,
      modelVersion: '1.0.0-heuristic',
      provenance: 'SIMULATED',
      evidence: {
        primaryReason: 'DGMS convergence limit exceeded',
        summary: 'Tensile displacement in P-102',
        what: 'Accelerated strata flexure and tensile displacement exceeding 48 mm',
        where: {
          panelCode: 'P-102',
          affectedNodes: ['SN-105', 'SN-106'],
          epicenterNode: 'SN-106',
        },
        when: {
          detectedAt: new Date().toISOString(),
          persistenceSec: 45,
          lastEvaluatedAt: new Date().toISOString(),
        },
        which: {
          channels: ['SN-106-DISP_Z'],
          sensorTypes: ['displacement'],
        },
        howPersistent: 'Persistent for 45s across multiple consecutive sampling frames',
        whyRiskChanged: 'Multi-station correlated displacement exceeding DGMS limits.',
        whatActionRecommended: 'Order immediate underground evacuation of Panel P-102 per CMR 2017 Reg 112.',
        spatialCorrelationScore: 0.85,
        modalityAgreementScore: 0.90,
        dgmsComplianceStatus: 'CRITICAL_THRESHOLD',
        contributingFactors: [],
      },
    };

    engine.processRiskAssessment(mockAssessment);

    const alerts = engine.getAlerts();
    const criticalAlert = alerts.find((a) => a.risk_state === 'Critical' && a.panel_id === 'p-102');

    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.severity).toBe('critical');
    expect(criticalAlert?.status).toBe('active');
    expect(criticalAlert?.title).toContain('CRITICAL');

    // Audit log should record the ALERT_TRIGGERED entry
    const auditLogs = engine.getAuditEntries();
    const triggeredAudit = auditLogs.find((a) => a.action === 'ALERT_TRIGGERED' && a.entity_id === criticalAlert?.id);
    expect(triggeredAudit).toBeDefined();
    expect(triggeredAudit?.entity_type).toBe('alert');
  });

  it('enforces anti-storm deduplication for ongoing high-risk state on the same panel', () => {
    const alertsBefore = engine.getAlerts().length;

    const duplicateAssessment: RiskAssessmentEvent = {
      id: 'test-risk-crit-2',
      mineId: '388b9f62-1218-4f8b-bdda-87bbd066a974',
      panelId: 'p-102',
      assessedAt: new Date().toISOString(),
      riskState: 'Critical',
      score: 0.95,
      confidence: 0.90,
      modelVersion: '1.0.0-heuristic',
      provenance: 'SIMULATED',
      evidence: {
        primaryReason: 'DGMS convergence limit exceeded',
        summary: 'Continuing flexure in P-102',
        what: 'Continuing flexure',
        where: {
          panelCode: 'P-102',
          affectedNodes: ['SN-105', 'SN-106'],
          epicenterNode: 'SN-106',
        },
        when: {
          detectedAt: new Date().toISOString(),
          persistenceSec: 50,
          lastEvaluatedAt: new Date().toISOString(),
        },
        which: {
          channels: ['SN-106-DISP_Z'],
          sensorTypes: ['displacement'],
        },
        howPersistent: 'Persistent for 50s',
        whyRiskChanged: 'Continuing flexure',
        whatActionRecommended: 'Evacuation confirmed',
        spatialCorrelationScore: 0.85,
        modalityAgreementScore: 0.90,
        dgmsComplianceStatus: 'CRITICAL_THRESHOLD',
        contributingFactors: [],
      },
    };

    engine.processRiskAssessment(duplicateAssessment);

    // Number of alerts should not increase due to active deduplication
    const alertsAfter = engine.getAlerts().length;
    expect(alertsAfter).toBe(alertsBefore);
  });

  it('allows an authenticated Safety Officer to sign off and acknowledge an alert with audit trail', async () => {
    const alerts = engine.getAlerts();
    const targetAlert = alerts.find((a) => a.status === 'active') || alerts[0];

    const acknowledged = await engine.acknowledgeAlert(targetAlert.id, {
      operatorName: 'Rajesh Kumar',
      userRole: 'SafetyOfficer',
      actionTaken: 'Evacuation of District P-102 completed; barricades erected per CMR 2017 Reg 112',
      comment: 'Continuous optical convergence telemetry active.',
    });

    expect(acknowledged).toBeDefined();
    expect(acknowledged?.status).toBe('acknowledged');
    expect(acknowledged?.acknowledged_by).toContain('Rajesh Kumar (SafetyOfficer)');
    expect(acknowledged?.acknowledged_at).toBeDefined();

    // Verify audit log entry
    const audits = engine.getAuditEntries();
    const ackAudit = audits.find((a) => a.action === 'ALERT_ACKNOWLEDGED' && a.entity_id === targetAlert.id);
    expect(ackAudit).toBeDefined();
    expect(ackAudit?.user_role).toBe('SafetyOfficer');
    expect((ackAudit?.payload_after as Record<string, unknown>)?.action_taken).toContain('Evacuation of District P-102');
  });

  it('supports explicit escalation with escalation audit entry', () => {
    const alerts = engine.getAlerts();
    const alertToEscalate = alerts.find((a) => a.status === 'acknowledged') || alerts[0];

    const escalated = engine.escalateAlert(alertToEscalate.id, {
      reason: 'Subsidence crack opening on surface railway siding buffer zone',
      escalatedTo: 'Director General of Mines Safety (DGMS) Eastern Zone',
      authorizedBy: 'Colliery Manager A. K. Sengupta',
      userRole: 'MineManager',
    });

    expect(escalated?.status).toBe('escalated');

    // Verify audit log entry
    const audits = engine.getAuditEntries();
    const escAudit = audits.find((a) => a.action === 'ALERT_ESCALATED' && a.entity_id === alertToEscalate.id);
    expect(escAudit).toBeDefined();
    expect(escAudit?.user_role).toBe('MineManager');
  });
});
