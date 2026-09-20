/**
 * SIH26025 Alert Engine & Policy Domain Definitions
 */

import { Alert, AlertSeverity, AuditEntry, UserRole } from '@/lib/domain/types';
import { RiskState } from '@/lib/domain/risk-states';

export interface AlertPolicyConfig {
  autoEscalateDelaySec: number; // Duration before unacknowledged Critical/Warning alerts auto-escalate
  minPersistenceForAdvisorySec: number; // Minimum persistence before Advisory generates an alert
  enableAudibleAlarm: boolean;
}

export interface AcknowledgementPayload {
  operatorName: string;
  userRole: UserRole;
  actionTaken: string;
  comment?: string;
}

export interface EscalationPayload {
  reason: string;
  escalatedTo: string;
  authorizedBy: string;
  userRole: UserRole;
}

export interface AlertFilterCriteria {
  riskState?: RiskState | 'ALL';
  status?: Alert['status'] | 'ALL';
  panelId?: string | 'ALL';
  severity?: AlertSeverity | 'ALL';
}

export type AlertListener = (alert: Alert) => void;
export type AuditListener = (entry: AuditEntry) => void;
