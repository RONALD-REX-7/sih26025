/**
 * SIH26025 Demo Notification Provider
 * 
 * Safety & Integrity Guarantee:
 * Never claims an SMS, Email, or Webhook was delivered to a real recipient without external confirmation.
 * Explicitly marks all generated dispatches with SIMULATED_DEMO provenance and demo metadata.
 */

import {
  NotificationChannel,
  NotificationPayload,
  NotificationProvider,
  NotificationResult,
} from '../notification-types';

export class DemoNotificationProvider implements NotificationProvider {
  public readonly channel: NotificationChannel;
  public readonly name: string;

  constructor(channel: NotificationChannel, name?: string) {
    this.channel = channel;
    this.name = name || `Demo-${channel.toUpperCase()}-Provider`;
  }

  public isConfigured(): boolean {
    return true; // Always operational as a demo fallback
  }

  public async send(payload: NotificationPayload): Promise<NotificationResult> {
    const startTime = Date.now();

    // Deterministic simulated latency (between 40ms and 150ms)
    await new Promise((resolve) => setTimeout(resolve, 60));
    const latencyMs = Date.now() - startTime;

    // Output transparent debug note in non-production environments
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.info(
        `%c[SIH26025 DEMO NOTIFICATION]%c (${this.name})\n` +
          `Channel: ${payload.channel.toUpperCase()} | Recipient: ${payload.recipient}\n` +
          `Subject: ${payload.subject}\n` +
          `Notice: External credentials not configured. Simulated dispatch only.`,
        'background: #d97706; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 2px;',
        'color: inherit;'
      );
    }

    return {
      id: `demo-dispatch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      payload,
      status: 'SIMULATED_DEMO',
      providerName: this.name,
      dispatchedAt: new Date().toISOString(),
      latencyMs,
      isDemoSimulation: true,
    };
  }
}
