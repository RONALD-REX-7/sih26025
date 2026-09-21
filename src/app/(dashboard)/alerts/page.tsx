'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from '@/lib/domain/types';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { StateContainer } from '@/components/industrial/state-container';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import { EscalateModal } from '@/components/industrial/escalate-modal';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { AcknowledgementPayload, EscalationPayload } from '@/lib/alerts/alert-types';

export default function AlertsPage() {
  const {
    alerts,
    activeCount,
    criticalCount,
    isAlarmMuted,
    isAlarmPlaying,
    notificationHistory,
    initAlertEngine,
    toggleMuteAlarm,
    playTestAlarm,
    acknowledgeAlert,
    escalateAlert,
  } = useAlertStore();

  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'queue' | 'dispatches'>('queue');
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  const [targetAckAlert, setTargetAckAlert] = useState<Alert | null>(null);
  const [targetEscalateAlert, setTargetEscalateAlert] = useState<Alert | null>(null);

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const filteredAlerts = alerts.filter((a) => {
    const matchesRisk = selectedRisk === 'ALL' || a.risk_state === selectedRisk;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesRisk && matchesStatus;
  });

  const handleOpenAcknowledge = (alert: Alert) => {
    setTargetAckAlert(alert);
  };

  const handleOpenEscalate = (alert: Alert) => {
    setTargetEscalateAlert(alert);
  };

  const handleConfirmAcknowledge = async (payload: AcknowledgementPayload) => {
    if (!targetAckAlert) return;
    await acknowledgeAlert(targetAckAlert.id, payload);
    setAckNotice(`Alert ${targetAckAlert.id} successfully acknowledged. Statutory audit entry committed.`);
    setTimeout(() => setAckNotice(null), 4000);
  };

  const handleConfirmEscalate = (payload: EscalationPayload) => {
    if (!targetEscalateAlert) return;
    escalateAlert(targetEscalateAlert.id, payload);
    setAckNotice(`Alert ${targetEscalateAlert.id} escalated to ${payload.escalatedTo}. Audit log updated.`);
    setTimeout(() => setAckNotice(null), 4000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-[#173B57]" />
              Emergency Response Coordination &bull; DGMS CMR 2017 Reg 112
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Early Warning &amp; Incident Action Center
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Real-time incident dispatch, regulatory CMR 112 shift sign-off, audible siren readiness, and escalation workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Audible Siren Toggle */}
          <button
            onClick={toggleMuteAlarm}
            className={`h-8 px-3 text-xs font-mono-tech font-medium rounded-sm border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isAlarmMuted
                ? 'border-[#D7DEDC] bg-[#EDF1F0] text-[#74808A]'
                : 'border-[#173B57] bg-[#FFFFFF] text-[#173B57]'
            }`}
          >
            {isAlarmMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isAlarmMuted ? 'Alarm Muted' : isAlarmPlaying ? 'Siren Active' : 'Siren Ready'}</span>
          </button>

          <button
            onClick={playTestAlarm}
            className="h-8 px-2.5 text-xs font-mono-tech border border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D] hover:bg-[#EDF1F0] rounded-sm cursor-pointer"
          >
            Test Beep
          </button>
        </div>
      </div>

      {ackNotice && (
        <div className="p-3 text-xs bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#2F6B4F] shrink-0" />
          <span>{ackNotice}</span>
        </div>
      )}

      {/* Incident Metric Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Active Directives</div>
          <div className="text-lg font-bold text-[#B42318] mt-0.5">
            {activeCount} <span className="text-xs font-normal text-[#52606D]">requiring action</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Acknowledged</div>
          <div className="text-lg font-bold text-[#2F6B4F] mt-0.5">
            {alerts.filter((a) => a.status === 'acknowledged').length} <span className="text-xs font-normal text-[#52606D]">signed off</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Escalated</div>
          <div className="text-lg font-bold text-[#A85A00] mt-0.5">
            {alerts.filter((a) => a.status === 'escalated').length} <span className="text-xs font-normal text-[#52606D]">dispatched</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Dispatch Log Entries</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            {notificationHistory.length} <span className="text-xs font-normal text-[#52606D]">events</span>
          </div>
        </div>
      </div>

      {/* Tabs: Incident Queue vs Multi-Channel Dispatch Log */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              activeTab === 'queue'
                ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            <Bell className="h-3.5 w-3.5 inline mr-1.5" />
            Incident Queue ({filteredAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('dispatches')}
            className={`px-3 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              activeTab === 'dispatches'
                ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            <Send className="h-3.5 w-3.5 inline mr-1.5" />
            Dispatch Transmissions ({notificationHistory.length})
          </button>
        </div>

        {activeTab === 'queue' && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech">
            <span className="text-[#52606D]">Severity:</span>
            {['ALL', 'Critical', 'Warning', 'Watch', 'Advisory'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2 py-0.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
                  selectedRisk === r
                    ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                    : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'queue' ? (
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          {filteredAlerts.length === 0 ? (
            <div className="p-8">
              <StateContainer
                type="empty"
                title="No Incidents in Queue"
                description="All strata monitoring stations are operating within statutory tolerances."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-industrial">
                <thead>
                  <tr>
                    <th>Alert ID</th>
                    <th>Risk State</th>
                    <th>Panel</th>
                    <th>Directive Title &amp; Observed Evidence</th>
                    <th>Triggered At</th>
                    <th>Status</th>
                    <th className="text-right">Statutory Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="transition-colors">
                      <td className="font-mono-tech font-bold text-[#173B57]">
                        {alert.id}
                      </td>
                      <td>
                        <RiskBadge state={alert.risk_state} size="sm" showIcon={false} />
                      </td>
                      <td className="font-mono-tech text-xs text-[#52606D]">
                        {alert.panel?.code || alert.panel_id || 'P-101'}
                      </td>
                      <td className="max-w-md">
                        <div className="font-semibold text-xs text-[#1D2933]">
                          {alert.title}
                        </div>
                        <div className="text-xs text-[#52606D] truncate mt-0.5">
                          {alert.message}
                        </div>
                      </td>
                      <td className="font-mono-tech text-xs text-[#52606D]">
                        {new Date(alert.triggered_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold ${
                          alert.status === 'active'
                            ? 'bg-[#FBEBE9] text-[#91180E]'
                            : alert.status === 'escalated'
                            ? 'bg-[#FBF6E9] text-[#9A6A00]'
                            : 'bg-[#EAF2ED] text-[#2F6B4F]'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right space-x-1.5">
                        {alert.status !== 'acknowledged' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenAcknowledge(alert)}
                              className="px-2.5 py-1 rounded-sm bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] text-xs font-mono-tech font-medium cursor-pointer"
                            >
                              Sign Off
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEscalate(alert)}
                              className="px-2 py-1 rounded-sm border border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0] text-xs font-mono-tech cursor-pointer"
                            >
                              Escalate
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <span className="text-xs text-[#2F6B4F] font-mono-tech font-semibold">
                            Signed Off
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Dispatch Log View */
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-industrial">
              <thead>
                <tr>
                  <th>Dispatch Time</th>
                  <th>Channel</th>
                  <th>Recipient / Station</th>
                  <th>Message Content</th>
                  <th>Protocol Status</th>
                </tr>
              </thead>
              <tbody>
                {notificationHistory.map((item) => (
                  <tr key={item.id} className="transition-colors">
                    <td className="font-mono-tech text-xs text-[#52606D]">
                      {new Date(item.dispatchedAt).toLocaleTimeString()}
                    </td>
                    <td className="font-mono-tech font-semibold text-[#173B57]">
                      {(item.payload.channel || item.providerName).toUpperCase()}
                    </td>
                    <td className="font-mono-tech text-xs text-[#1D2933]">
                      {item.payload.recipient || item.providerName}
                    </td>
                    <td className="text-xs text-[#52606D] max-w-lg truncate">
                      {item.payload.subject || item.payload.body}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold bg-[#EAF2ED] text-[#2F6B4F]">
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      <AcknowledgeModal
        alert={targetAckAlert}
        isOpen={Boolean(targetAckAlert)}
        onClose={() => setTargetAckAlert(null)}
        onConfirm={handleConfirmAcknowledge}
      />

      {/* Escalate Modal */}
      <EscalateModal
        alert={targetEscalateAlert}
        isOpen={Boolean(targetEscalateAlert)}
        onClose={() => setTargetEscalateAlert(null)}
        onConfirm={handleConfirmEscalate}
      />
    </div>
  );
}
