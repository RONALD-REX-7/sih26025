/**
 * SIH26025 Notification Channel Contracts & Dispatch Types
 * Explicitly distinguishes actual provider deliveries from demo simulations.
 */

import { Alert } from '@/lib/domain/types';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook';

export type NotificationDispatchStatus = 
  | 'DELIVERED'        // Confirmed delivered by actual external provider
  | 'SIMULATED_DEMO'   // Fallback simulation when external credentials are not present
  | 'FAILED'           // Provider attempted dispatch and failed
  | 'QUEUED';          // Dispatch pending in queue

export interface NotificationPayload {
  alertId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  riskState: Alert['risk_state'];
  severity: Alert['severity'];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  id: string;
  payload: NotificationPayload;
  status: NotificationDispatchStatus;
  providerName: string;
  dispatchedAt: string;
  deliveredAt?: string;
  latencyMs: number;
  errorMessage?: string;
  isDemoSimulation: boolean;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  readonly name: string;
  isConfigured(): boolean;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
