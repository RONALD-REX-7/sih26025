'use client';

import { create } from 'zustand';
import { Alert, AuditEntry } from '@/lib/domain/types';
import { AlertEngine } from './alert-engine';
import { AcknowledgementPayload, EscalationPayload } from './alert-types';
import { NotificationManager } from '@/lib/notifications/notification-manager';
import { NotificationResult } from '@/lib/notifications/notification-types';
import { AudibleAlarm } from '@/lib/notifications/audible-alarm';

export interface AlertStoreState {
  alerts: Alert[];
  auditEntries: AuditEntry[];
  notificationHistory: NotificationResult[];
  isAlarmMuted: boolean;
  isAlarmPlaying: boolean;
  activeCount: number;
  criticalCount: number;

  // Actions
  initAlertEngine: () => void;
  toggleMuteAlarm: () => void;
  playTestAlarm: () => void;
  acknowledgeAlert: (alertId: string, payload: AcknowledgementPayload) => Promise<Alert | null>;
  escalateAlert: (alertId: string, payload: EscalationPayload) => Alert | null;
  resolveAlert: (alertId: string, resolvedBy: string) => Alert | null;
  recordAudit: (entry: Omit<AuditEntry, 'id' | 'created_at'>) => AuditEntry;
  refresh: () => void;
}

export const useAlertStore = create<AlertStoreState>((set, get) => {
  let isInitialized = false;

  const updateCounts = (alerts: Alert[]) => {
    const active = alerts.filter((a) => a.status === 'active' || a.status === 'escalated').length;
    const critical = alerts.filter(
      (a) => (a.status === 'active' || a.status === 'escalated') && (a.severity === 'critical' || a.severity === 'high')
    ).length;
    return { activeCount: active, criticalCount: critical };
  };

  return {
    alerts: [],
    auditEntries: [],
    notificationHistory: [],
    isAlarmMuted: false,
    isAlarmPlaying: false,
    activeCount: 0,
    criticalCount: 0,

    initAlertEngine: () => {
      if (isInitialized || typeof window === 'undefined') return;
      isInitialized = true;

      const engine = AlertEngine.getInstance();
      const notifManager = NotificationManager.getInstance();
      const audible = AudibleAlarm.getInstance();

      const initialAlerts = engine.getAlerts();
      const initialAudits = engine.getAuditEntries();
      const initialNotifs = notifManager.getHistory();
      const counts = updateCounts(initialAlerts);

      set({
        alerts: initialAlerts,
        auditEntries: initialAudits,
        notificationHistory: initialNotifs,
        isAlarmMuted: audible.getIsMuted(),
        isAlarmPlaying: audible.isPlaying(),
        ...counts,
      });

      // Subscribe to real-time alert updates
      engine.subscribeAlerts(() => {
        const updated = engine.getAlerts();
        set({
          alerts: updated,
          isAlarmPlaying: audible.isPlaying(),
          ...updateCounts(updated),
        });
      });

      // Subscribe to real-time audit updates
      engine.subscribeAudit(() => {
        set({
          auditEntries: engine.getAuditEntries(),
        });
      });

      // Subscribe to real-time notification dispatches
      notifManager.subscribe(() => {
        set({
          notificationHistory: notifManager.getHistory(),
        });
      });
    },

    toggleMuteAlarm: () => {
      const audible = AudibleAlarm.getInstance();
      const newMute = !audible.getIsMuted();
      audible.setMuted(newMute);
      set({
        isAlarmMuted: newMute,
        isAlarmPlaying: audible.isPlaying(),
      });
    },

    playTestAlarm: () => {
      AudibleAlarm.getInstance().playTestChime();
    },

    acknowledgeAlert: async (alertId: string, payload: AcknowledgementPayload) => {
      const engine = AlertEngine.getInstance();
      const result = await engine.acknowledgeAlert(alertId, payload);
      get().refresh();
      return result;
    },

    escalateAlert: (alertId: string, payload: EscalationPayload) => {
      const engine = AlertEngine.getInstance();
      const result = engine.escalateAlert(alertId, payload);
      get().refresh();
      return result;
    },

    resolveAlert: (alertId: string, resolvedBy: string) => {
      const engine = AlertEngine.getInstance();
      const result = engine.resolveAlert(alertId, resolvedBy);
      get().refresh();
      return result;
    },

    recordAudit: (entry: Omit<AuditEntry, 'id' | 'created_at'>) => {
      const engine = AlertEngine.getInstance();
      const result = engine.recordAuditEntry(entry);
      set({ auditEntries: engine.getAuditEntries() });
      return result;
    },

    refresh: () => {
      const engine = AlertEngine.getInstance();
      const notifManager = NotificationManager.getInstance();
      const audible = AudibleAlarm.getInstance();
      const alerts = engine.getAlerts();

      set({
        alerts,
        auditEntries: engine.getAuditEntries(),
        notificationHistory: notifManager.getHistory(),
        isAlarmMuted: audible.getIsMuted(),
        isAlarmPlaying: audible.isPlaying(),
        ...updateCounts(alerts),
      });
    },
  };
});
