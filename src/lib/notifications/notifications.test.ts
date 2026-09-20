import { describe, it, expect, beforeEach } from 'vitest';
import { DemoNotificationProvider } from './providers/demo-provider';
import { NotificationManager } from './notification-manager';
import { Alert } from '@/lib/domain/types';

describe('SIH26025 Notification Provider & Non-Fabrication Guarantees', () => {
  it('ensures DemoNotificationProvider explicitly marks dispatches as SIMULATED_DEMO', async () => {
    const provider = new DemoNotificationProvider('sms', 'Demo-SMS');
    expect(provider.isConfigured()).toBe(true);

    const result = await provider.send({
      alertId: 'test-alt-1',
      channel: 'sms',
      recipient: '+919431100000',
      subject: 'Critical Subsidence Alert',
      body: 'Tensile strain exceeded threshold',
      riskState: 'Critical',
      severity: 'critical',
      timestamp: new Date().toISOString(),
    });

    expect(result.status).toBe('SIMULATED_DEMO');
    expect(result.isDemoSimulation).toBe(true);
    expect(result.providerName).toBe('Demo-SMS');
    expect(result.latencyMs).toBeGreaterThan(0);
  });

  describe('NotificationManager', () => {
    let manager: NotificationManager;

    beforeEach(() => {
      manager = NotificationManager.getInstance();
    });

    it('broadcasts critical alert across multi-channel emergency roster', async () => {
      const mockAlert: Alert = {
        id: 'alt-critical-99',
        mine_id: '388b9f62-1218-4f8b-bdda-87bbd066a974',
        panel_id: 'p-101',
        severity: 'critical',
        risk_state: 'Critical',
        title: 'Impending Goaf Fall and Surface Subsidence',
        message: 'Convergence rate exceeded 5.0 mm/hr along Panel P-101 extraction line.',
        status: 'active',
        triggered_at: new Date().toISOString(),
      };

      const results = await manager.broadcastAlert(mockAlert);

      // Critical alert dispatches: in_app, email, sms, webhook
      expect(results.length).toBe(4);
      const channels = results.map((r) => r.payload.channel);
      expect(channels).toContain('in_app');
      expect(channels).toContain('email');
      expect(channels).toContain('sms');
      expect(channels).toContain('webhook');

      // History should record these dispatches
      const history = manager.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(4);
    });
  });
});
