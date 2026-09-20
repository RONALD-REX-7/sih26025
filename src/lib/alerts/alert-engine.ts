/**
 * SIH26025 Operational Alert & Audit Response Engine
 * 
 * Pipeline:
 * Risk Assessment -> Alert Policy -> Alert -> Notification -> Acknowledgement -> Escalation -> Audit
 */

import { Alert, AlertAcknowledgement, AuditEntry, AlertSeverity } from '@/lib/domain/types';
import { RiskState } from '@/lib/domain/risk-states';
import { DEMO_ALERTS, DEMO_AUDIT_ENTRIES } from '@/lib/data/mock-data';
import { RiskEngine } from '@/lib/ai/risk-engine';
import { RiskAssessmentEvent } from '@/lib/ai/types';
import { NotificationManager } from '@/lib/notifications/notification-manager';
import { AudibleAlarm } from '@/lib/notifications/audible-alarm';
import { createClient } from '@/lib/supabase/client';
import {
  AcknowledgementPayload,
  EscalationPayload,
  AlertListener,
  AuditListener,
  AlertPolicyConfig,
} from './alert-types';

export class AlertEngine {
  private static instance: AlertEngine | null = null;

  private alerts: Map<string, Alert> = new Map();
  private auditEntries: AuditEntry[] = [];
  private acknowledgements: Map<string, AlertAcknowledgement> = new Map();

  private alertListeners: Set<AlertListener> = new Set();
  private auditListeners: Set<AuditListener> = new Set();

  private autoEscalateCheckTimer: NodeJS.Timeout | null = null;
  private isSupabaseConnected = false;

  private policyConfig: AlertPolicyConfig = {
    autoEscalateDelaySec: 60, // Auto-escalates unacknowledged high/critical alerts after 60s
    minPersistenceForAdvisorySec: 15,
    enableAudibleAlarm: true,
  };

  private constructor() {
    this.seedInitialState();
    this.bindRiskEngine();

    if (typeof window !== 'undefined') {
      this.autoEscalateCheckTimer = setInterval(() => {
        this.checkAutoEscalations();
      }, 5000);
    }
  }

  public static getInstance(): AlertEngine {
    if (!AlertEngine.instance) {
      AlertEngine.instance = new AlertEngine();
    }
    return AlertEngine.instance;
  }

  private seedInitialState(): void {
    for (const alt of DEMO_ALERTS) {
      this.alerts.set(alt.id, { ...alt });
    }
    this.auditEntries = [...DEMO_AUDIT_ENTRIES];
  }

  /**
   * Binds to AI Risk Engine risk assessments.
   */
  private bindRiskEngine(): void {
    if (typeof window === 'undefined') return;
    try {
      const riskEngine = RiskEngine.getInstance();
      riskEngine.subscribeToRiskAssessments((assessment) => {
        this.processRiskAssessment(assessment);
      });
    } catch {
      // RiskEngine may not be initialized in non-browser or test context
    }
  }

  /**
   * Evaluates Alert Policy upon receiving an AI Risk Assessment.
   */
  public processRiskAssessment(assessment: RiskAssessmentEvent): void {
    const { riskState, score, evidence } = assessment;

    // Normal state does not trigger new alerts
    if (riskState === 'Normal') {
      return;
    }

    // Map RiskState to Alert Severity
    let severity: AlertSeverity = 'info';
    if (riskState === 'Advisory') severity = 'low';
    if (riskState === 'Watch') severity = 'medium';
    if (riskState === 'Warning') severity = 'high';
    if (riskState === 'Critical') severity = 'critical';

    // Anti-storm deduplication:
    // Check if an active alert for the same panel/epicenter already exists
    const panelId = assessment.panelId || evidence.where.panelCode || 'p-101';
    const locationStr = evidence.where.panelCode + (evidence.where.epicenterNode ? ` (Epicenter: ${evidence.where.epicenterNode})` : '');
    const existingActive = Array.from(this.alerts.values()).find(
      (a) => a.panel_id === panelId && (a.status === 'active' || a.status === 'escalated')
    );

    if (existingActive) {
      // If severity has escalated, update existing alert rather than spamming a new row
      if (this.isMoreSevere(severity, existingActive.severity)) {
        existingActive.severity = severity;
        existingActive.risk_state = riskState;
        existingActive.title = this.generateAlertTitle(riskState, locationStr);
        existingActive.message = `${evidence.whyRiskChanged} Action: ${evidence.whatActionRecommended}`;
        this.notifyAlertChanged(existingActive);

        if (severity === 'critical' || severity === 'high') {
          AudibleAlarm.getInstance().triggerAlarm(severity === 'critical' ? 'critical' : 'warning');
        }
      }
      return;
    }

    // If Advisory, only alert if persistence threshold is exceeded
    if (riskState === 'Advisory' && evidence.when.persistenceSec < this.policyConfig.minPersistenceForAdvisorySec) {
      return;
    }

    // Generate New Alert
    const newAlert: Alert = {
      id: `alt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      risk_assessment_id: assessment.id,
      mine_id: assessment.mineId || '388b9f62-1218-4f8b-bdda-87bbd066a974',
      panel_id: panelId,
      severity,
      risk_state: riskState,
      title: this.generateAlertTitle(riskState, locationStr),
      message: `${evidence.whyRiskChanged} Action: ${evidence.whatActionRecommended}`,
      status: 'active',
      triggered_at: new Date().toISOString(),
    };

    this.alerts.set(newAlert.id, newAlert);
    this.notifyAlertChanged(newAlert);

    // Multi-channel broadcast via NotificationManager
    NotificationManager.getInstance().broadcastAlert(newAlert);

    // Trigger Audible Siren for High/Critical
    if (severity === 'critical' || severity === 'high') {
      AudibleAlarm.getInstance().triggerAlarm(severity === 'critical' ? 'critical' : 'warning');
    }

    // Record Immutable Audit Log Entry
    this.recordAuditEntry({
      action: 'ALERT_TRIGGERED',
      entity_type: 'alert',
      entity_id: newAlert.id,
      user_role: 'Administrator',
      payload_after: {
        severity,
        risk_state: riskState,
        score,
        panel_id: panelId,
        title: newAlert.title,
      },
    });

    // Asynchronously buffer to Supabase
    this.syncAlertToSupabase(newAlert);
  }

  private isMoreSevere(a: AlertSeverity, b: AlertSeverity): boolean {
    const ranks: Record<AlertSeverity, number> = {
      info: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return ranks[a] > ranks[b];
  }

  private generateAlertTitle(risk: RiskState, location: string): string {
    switch (risk) {
      case 'Critical':
        return `CRITICAL: Impending Strata Flexure & Subsidence Threat (${location})`;
      case 'Warning':
        return `WARNING: Severe Multi-Sensor Convergence Deviation (${location})`;
      case 'Watch':
        return `WATCH: Accelerated Deformation Trend on Extraction Line (${location})`;
      case 'Advisory':
      default:
        return `ADVISORY: Multi-Station Geomechanical Deviation (${location})`;
    }
  }

  /**
   * Operator Acknowledges an active Alert.
   */
  public async acknowledgeAlert(alertId: string, payload: AcknowledgementPayload): Promise<Alert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const payloadBefore = { ...alert };
    const nowIso = new Date().toISOString();

    alert.status = 'acknowledged';
    alert.acknowledged_by = `${payload.operatorName} (${payload.userRole})`;
    alert.acknowledged_at = nowIso;

    // Record acknowledgement domain entity
    const ackRecord: AlertAcknowledgement = {
      id: `ack-${Date.now()}`,
      alert_id: alertId,
      user_id: `usr-${payload.userRole.toLowerCase()}-01`,
      user_role: payload.userRole,
      action_taken: payload.actionTaken,
      comment: payload.comment || null,
      acknowledged_at: nowIso,
    };
    this.acknowledgements.set(alertId, ackRecord);

    // Stop active siren if this was high/critical
    AudibleAlarm.getInstance().stopAlarm();

    // Record Immutable Audit Entry
    this.recordAuditEntry({
      action: 'ALERT_ACKNOWLEDGED',
      entity_type: 'alert',
      entity_id: alertId,
      user_role: payload.userRole,
      payload_before: payloadBefore as unknown as Record<string, unknown>,
      payload_after: {
        status: 'acknowledged',
        acknowledged_by: alert.acknowledged_by,
        action_taken: payload.actionTaken,
        comment: payload.comment,
      },
    });

    this.notifyAlertChanged(alert);

    // Persist to Supabase
    this.syncAcknowledgementToSupabase(alert);

    return alert;
  }

  /**
   * Escalate an alert (manually or auto).
   */
  public escalateAlert(alertId: string, payload: EscalationPayload): Alert | null {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status === 'resolved') return null;

    const payloadBefore = { ...alert };
    alert.status = 'escalated';

    this.recordAuditEntry({
      action: 'ALERT_ESCALATED',
      entity_type: 'alert',
      entity_id: alertId,
      user_role: payload.userRole,
      payload_before: payloadBefore as unknown as Record<string, unknown>,
      payload_after: {
        status: 'escalated',
        reason: payload.reason,
        escalated_to: payload.escalatedTo,
        authorized_by: payload.authorizedBy,
      },
    });

    this.notifyAlertChanged(alert);

    // Broadcast escalation notice
    NotificationManager.getInstance().broadcastAlert({
      ...alert,
      title: `[ESCALATED] ${alert.title}`,
      message: `ESCALATION: ${payload.reason} (Target: ${payload.escalatedTo})`,
    });

    return alert;
  }

  /**
   * Resolve an alert.
   */
  public resolveAlert(alertId: string, resolvedBy: string): Alert | null {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const payloadBefore = { ...alert };
    alert.status = 'resolved';
    alert.resolved_at = new Date().toISOString();

    this.recordAuditEntry({
      action: 'ALERT_RESOLVED',
      entity_type: 'alert',
      entity_id: alertId,
      user_role: 'SafetyOfficer',
      payload_before: payloadBefore as unknown as Record<string, unknown>,
      payload_after: {
        status: 'resolved',
        resolved_by: resolvedBy,
        resolved_at: alert.resolved_at,
      },
    });

    AudibleAlarm.getInstance().stopAlarm();
    this.notifyAlertChanged(alert);
    return alert;
  }

  /**
   * Automated periodic check for unacknowledged critical alerts.
   */
  private checkAutoEscalations(): void {
    const now = Date.now();
    const timeoutMs = this.policyConfig.autoEscalateDelaySec * 1000;

    for (const alert of this.alerts.values()) {
      if (alert.status === 'active' && (alert.severity === 'critical' || alert.severity === 'high')) {
        const triggerTime = new Date(alert.triggered_at).getTime();
        if (now - triggerTime > timeoutMs) {
          this.escalateAlert(alert.id, {
            reason: `Unacknowledged after ${this.policyConfig.autoEscalateDelaySec} seconds under DGMS Emergency Response SLA`,
            escalatedTo: 'Colliery Manager & DGMS Sitarampur Regional Inspectorate',
            authorizedBy: 'Automated Alert Policy Engine',
            userRole: 'Administrator',
          });
        }
      }
    }
  }

  /**
   * Immutable Audit Entry recorder.
   */
  public recordAuditEntry(entry: Omit<AuditEntry, 'id' | 'created_at'>): AuditEntry {
    const fullEntry: AuditEntry = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      ...entry,
    };

    this.auditEntries.unshift(fullEntry);
    if (this.auditEntries.length > 200) {
      this.auditEntries.pop();
    }

    this.auditListeners.forEach((l) => {
      try {
        l(fullEntry);
      } catch (err) {
        console.error('Error in audit listener:', err);
      }
    });

    // Sync to Supabase audit_entries table
    this.syncAuditToSupabase(fullEntry);

    return fullEntry;
  }

  public getAlerts(): Alert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
    );
  }

  public getAuditEntries(): AuditEntry[] {
    return [...this.auditEntries];
  }

  public subscribeAlerts(listener: AlertListener): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  public subscribeAudit(listener: AuditListener): () => void {
    this.auditListeners.add(listener);
    return () => this.auditListeners.delete(listener);
  }

  private notifyAlertChanged(alert: Alert): void {
    this.alertListeners.forEach((l) => {
      try {
        l(alert);
      } catch (err) {
        console.error('Error in alert listener:', err);
      }
    });
  }

  // --- Supabase Persistence Handlers ---
  private async syncAlertToSupabase(alert: Alert): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const supabase = createClient();
      // Map demo panel ids to valid Supabase panel UUID if needed
      const panelUuid = alert.panel_id === 'p-101' ? '6c9d6d48-ca3c-4d8b-9da7-e730d79b9b60' : alert.panel_id;

      await supabase.from('alerts').insert({
        mine_id: alert.mine_id,
        panel_id: panelUuid,
        severity: alert.severity,
        risk_state: alert.risk_state,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        triggered_at: alert.triggered_at,
      });
      this.isSupabaseConnected = true;
    } catch {
      this.isSupabaseConnected = false;
    }
  }

  private async syncAcknowledgementToSupabase(alert: Alert): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const supabase = createClient();
      // Record audit and update alert status in Supabase
      await supabase.from('alerts').update({
        status: 'acknowledged',
        acknowledged_at: alert.acknowledged_at,
      }).eq('title', alert.title);
    } catch {}
  }

  private async syncAuditToSupabase(entry: AuditEntry): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const supabase = createClient();
      await supabase.from('audit_entries').insert({
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        user_role: entry.user_role || 'Administrator',
        payload_before: (entry.payload_before || null) as unknown as import('@/lib/supabase/database.types').Json,
        payload_after: (entry.payload_after || null) as unknown as import('@/lib/supabase/database.types').Json,
        ip_address: entry.ip_address || '10.14.2.45',
        created_at: entry.created_at,
      });
    } catch {}
  }
}
