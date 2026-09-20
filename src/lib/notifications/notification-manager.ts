/**
 * SIH26025 Notification Manager
 * Central dispatch router for multi-channel geotechnical early warnings.
 */

import { Alert } from '@/lib/domain/types';
import {
  NotificationChannel,
  NotificationPayload,
  NotificationProvider,
  NotificationResult,
} from './notification-types';
import { DemoNotificationProvider } from './providers/demo-provider';

export type DispatchListener = (result: NotificationResult) => void;

export class NotificationManager {
  private static instance: NotificationManager | null = null;
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();
  private dispatchHistory: NotificationResult[] = [];
  private listeners: Set<DispatchListener> = new Set();

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private registerDefaultProviders(): void {
    // Default fallback to Demo providers for all channels
    this.providers.set('in_app', new DemoNotificationProvider('in_app', 'Internal-App-Broadcast'));
    this.providers.set('email', new DemoNotificationProvider('email', 'Demo-CIL-Mail-Relay'));
    this.providers.set('sms', new DemoNotificationProvider('sms', 'Demo-DGMS-SMS-Gateway'));
    this.providers.set('webhook', new DemoNotificationProvider('webhook', 'Demo-Colliery-Siren-Webhook'));
    this.providers.set('push', new DemoNotificationProvider('push', 'Demo-Mobile-Push-Service'));
  }

  public registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.channel, provider);
  }

  public subscribe(listener: DispatchListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getHistory(): NotificationResult[] {
    return [...this.dispatchHistory];
  }

  /**
   * Broadcast an alert across appropriate channels based on risk severity.
   */
  public async broadcastAlert(alert: Alert): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    // Default recipients per DGMS Emergency Dispatch Roster
    const recipients: Array<{ channel: NotificationChannel; recipient: string; subject: string }> = [
      {
        channel: 'in_app',
        recipient: 'ALL_ACTIVE_DASHBOARDS',
        subject: `[${alert.risk_state.toUpperCase()}] ${alert.title}`,
      },
    ];

    if (alert.severity === 'medium' || alert.severity === 'high' || alert.severity === 'critical') {
      recipients.push({
        channel: 'email',
        recipient: 'safety-officer@bhowra.cil.in, mgr-operations@bhowra.cil.in',
        subject: `URGENT GEOTECHNICAL ALERT: ${alert.title} (${alert.risk_state})`,
      });
      recipients.push({
        channel: 'sms',
        recipient: '+91 94311 20042 (Colliery Control Room Duty Officer)',
        subject: `[DGMS CMR 112] ${alert.risk_state}: ${alert.title}`,
      });
    }

    if (alert.severity === 'critical') {
      recipients.push({
        channel: 'webhook',
        recipient: 'https://emergency-siren.colliery.local/v1/trigger',
        subject: `SIREN_DISPATCH_TRIGGER_${alert.panel_id || 'GENERAL'}`,
      });
    }

    for (const target of recipients) {
      const provider = this.providers.get(target.channel) || new DemoNotificationProvider(target.channel);

      const payload: NotificationPayload = {
        alertId: alert.id,
        channel: target.channel,
        recipient: target.recipient,
        subject: target.subject,
        body: alert.message,
        riskState: alert.risk_state,
        severity: alert.severity,
        timestamp,
        metadata: {
          panel_id: alert.panel_id,
          mine_id: alert.mine_id,
        },
      };

      try {
        const res = await provider.send(payload);
        results.push(res);
        this.recordDispatch(res);
      } catch (err) {
        const failedResult: NotificationResult = {
          id: `err-${Date.now()}`,
          payload,
          status: 'FAILED',
          providerName: provider.name,
          dispatchedAt: timestamp,
          latencyMs: 0,
          errorMessage: err instanceof Error ? err.message : String(err),
          isDemoSimulation: false,
        };
        results.push(failedResult);
        this.recordDispatch(failedResult);
      }
    }

    return results;
  }

  private recordDispatch(result: NotificationResult): void {
    this.dispatchHistory.unshift(result);
    if (this.dispatchHistory.length > 100) {
      this.dispatchHistory.pop();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (err) {
        console.error('Error in notification dispatch listener:', err);
      }
    });
  }
}
