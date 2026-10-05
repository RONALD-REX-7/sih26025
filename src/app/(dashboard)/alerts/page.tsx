'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from '@/lib/domain/types';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { StateContainer } from '@/components/industrial/state-container';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import { EscalateModal } from '@/components/industrial/escalate-modal';
import {
  CheckCircle2,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Send,
} from 'lucide-react';
import { AcknowledgementPayload, EscalationPayload } from '@/lib/alerts/alert-types';

export default function AlertsPage() {
  const {
    alerts,
    activeCount,
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#5B6871] flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-[#173B57]" />
              Emergency Response Coordination &bull; DGMS CMR 2017 Reg 112
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
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
            type="button"
            onClick={toggleMuteAlarm}
            aria-label={isAlarmMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
            className={`h-8 px-3 text-xs font-mono-tech font-medium rounded-sm border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isAlarmMuted
                ? 'border-[#D7DEDC] bg-[#EDF1F0] text-[#5B6871]'
                : 'border-[#173B57] bg-[#FFFFFF] text-[#173B57]'
            }`}
          >
            {isAlarmMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
            <span>{isAlarmMuted ? 'Alarm Muted' : isAlarmPlaying ? 'Siren Active' : 'Siren Ready'}</span>
          </button>

          <button
            type="button"
            onClick={playTestAlarm}
            aria-label="Test audible alarm tone"
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
          <div className="text-[11px] font-semibold text-[#5B6871] uppercase tracking-wider">Active Directives</div>
          <div className="text-lg font-bold text-[#B42318] mt-0.5">
            {activeCount} <span className="text-xs font-normal text-[#52606D]">requiring action</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#5B6871] uppercase tracking-wider">Acknowledged</div>
          <div className="text-lg font-bold text-[#2F6B4F] mt-0.5">
            {alerts.filter((a) => a.status === 'acknowledged').length} <span className="text-xs font-normal text-[#52606D]">signed off</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#5B6871] uppercase tracking-wider">Escalated</div>
          <div className="text-lg font-bold text-[#A85A00] mt-0.5">
            {alerts.filter((a) => a.status === 'escalated').length} <span className="text-xs font-normal text-[#52606D]">dispatched</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#5B6871] uppercase tracking-wider">Dispatch Log Entries</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            {notificationHistory.length} <span className="text-xs font-normal text-[#52606D]">events</span>
          </div>
        </div>
      </div>

      {/* Notification Delivery Channels Status (Requirement 10) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7DEDC] pb-2.5">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#173B57]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
              Automated Early-Warning Notification Delivery Matrix
            </h2>
          </div>
          <span className="text-[11px] font-mono-tech text-[#52606D]">
            Multi-Channel Incident Dispatch
          </span>
        </div>

        {/* External Provider Disclosure Note */}
        <div className="p-2.5 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm text-xs text-[#52606D] flex items-start gap-2">
          <span className="font-bold text-[#173B57] font-mono-tech shrink-0">[DATA TRUTH]</span>
          <span>
            External cellular SMS and SMTP email relays are not connected to third-party telecommunication providers in this student demonstration prototype. In-app notifications and Web Audio acoustic sirens are genuinely operational; remote telecommunication dispatches are executed as controlled <strong className="text-[#1D2933]">DEMO DISPATCH (SIMULATED)</strong> events for judge inspection.
          </span>
        </div>

        {/* 5 Delivery Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 font-mono-tech text-xs">
          {/* Channel 1: In-App */}
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#52606D] uppercase font-semibold">Channel 01</div>
              <div className="font-bold text-[#1D2933] text-sm mt-0.5">IN-APP BANNER</div>
              <div className="text-[11px] text-[#52606D] mt-1 font-sans">Command Surface &amp; GIS Overlay</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D7DEDC] flex items-center justify-between">
              <span className="text-[10px] text-[#2F6B4F] font-bold bg-[#EAF2ED] px-1.5 py-0.5 rounded-xs">
                OPERATIONAL
              </span>
              <span className="text-[10px] text-[#52606D]">Active</span>
            </div>
          </div>

          {/* Channel 2: Acoustic Siren */}
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#52606D] uppercase font-semibold">Channel 02</div>
              <div className="font-bold text-[#1D2933] text-sm mt-0.5">GALLERY SIREN</div>
              <div className="text-[11px] text-[#52606D] mt-1 font-sans">Web Audio Synthesizer (880Hz)</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D7DEDC] flex items-center justify-between">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs ${
                isAlarmMuted ? 'bg-[#EDF1F0] text-[#5B6871]' : 'bg-[#EAF2ED] text-[#2F6B4F]'
              }`}>
                {isAlarmMuted ? 'MUTED' : 'READY / ACTIVE'}
              </span>
              <span className="text-[10px] text-[#52606D]">Local Audio</span>
            </div>
          </div>

          {/* Channel 3: SMS Dispatch */}
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#52606D] uppercase font-semibold">Channel 03</div>
              <div className="font-bold text-[#1D2933] text-sm mt-0.5">CELLULAR SMS</div>
              <div className="text-[11px] text-[#52606D] mt-1 font-sans">Shift Incharge &amp; Safety Officer</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D7DEDC] flex items-center justify-between">
              <span className="text-[10px] text-[#9A6A00] font-bold bg-[#FBF6E9] px-1.5 py-0.5 rounded-xs">
                DEMO DISPATCH
              </span>
              <span className="text-[10px] text-[#52606D]">Simulated</span>
            </div>
          </div>

          {/* Channel 4: Email Dispatch */}
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#52606D] uppercase font-semibold">Channel 04</div>
              <div className="font-bold text-[#1D2933] text-sm mt-0.5">DIRECTORATE EMAIL</div>
              <div className="text-[11px] text-[#52606D] mt-1 font-sans">DGMS Regional Office &amp; Colliery Mgr</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D7DEDC] flex items-center justify-between">
              <span className="text-[10px] text-[#9A6A00] font-bold bg-[#FBF6E9] px-1.5 py-0.5 rounded-xs">
                DEMO DISPATCH
              </span>
              <span className="text-[10px] text-[#52606D]">Simulated</span>
            </div>
          </div>

          {/* Channel 5: Mobile Push */}
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#52606D] uppercase font-semibold">Channel 05</div>
              <div className="font-bold text-[#1D2933] text-sm mt-0.5">MOBILE PUSH / PWA</div>
              <div className="text-[11px] text-[#52606D] mt-1 font-sans">Offline Service Worker Dispatch</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#D7DEDC] flex items-center justify-between">
              <span className="text-[10px] text-[#173B57] font-bold bg-[#EDF1F0] px-1.5 py-0.5 rounded-xs">
                LOCAL BROWSER
              </span>
              <span className="text-[10px] text-[#52606D]">Ready</span>
            </div>
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
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tech">
            <div className="flex items-center gap-1.5">
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

            <div className="flex items-center gap-1.5">
              <span className="text-[#52606D]">Status:</span>
              {['ALL', 'active', 'acknowledged', 'escalated'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2 py-0.5 text-xs font-mono-tech rounded-sm border cursor-pointer capitalize transition-colors ${
                    selectedStatus === s
                      ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                      : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
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
          <div className="p-3 bg-[#F8FAF9] border-b border-[#D7DEDC] flex items-center justify-between text-xs font-mono-tech">
            <span className="text-[#52606D]">
              External Transmissions Ledger &bull; {notificationHistory.length} Total Dispatches
            </span>
            <span className="text-[11px] text-[#9A6A00] font-semibold bg-[#FBF6E9] px-2 py-0.5 rounded-xs border border-[#9A6A00]/20">
              Cellular/SMTP: DEMO DISPATCH (SIMULATED)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-industrial">
              <thead>
                <tr>
                  <th>Dispatch Time</th>
                  <th>Channel</th>
                  <th>Delivery Mode</th>
                  <th>Recipient / Endpoint</th>
                  <th>Directive Content</th>
                  <th>Protocol Status</th>
                </tr>
              </thead>
              <tbody>
                {notificationHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-xs text-[#52606D] font-mono-tech">
                      No automated dispatches triggered in current session. Start strata scenario to observe multi-channel broadcasts.
                    </td>
                  </tr>
                ) : (
                  notificationHistory.map((item) => {
                    const isDemoExternal = item.payload.channel === 'sms' || item.payload.channel === 'email' || item.payload.channel === 'push' || item.providerName.toLowerCase().includes('demo');
                    return (
                      <tr key={item.id} className="transition-colors">
                        <td className="font-mono-tech text-xs text-[#52606D]">
                          {new Date(item.dispatchedAt).toLocaleTimeString()}
                        </td>
                        <td className="font-mono-tech font-semibold text-[#173B57]">
                          {(item.payload.channel || item.providerName).toUpperCase()}
                        </td>
                        <td>
                          {isDemoExternal ? (
                            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono-tech font-bold bg-[#FBF6E9] text-[#9A6A00] border border-[#9A6A00]/30">
                              DEMO DISPATCH
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono-tech font-bold bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30">
                              LIVE IN-APP
                            </span>
                          )}
                        </td>
                        <td className="font-mono-tech text-xs text-[#1D2933]">
                          {item.payload.recipient || item.providerName}
                        </td>
                        <td className="text-xs text-[#52606D] max-w-lg truncate">
                          {item.payload.subject || item.payload.body}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold ${
                            item.status === 'DELIVERED' ? 'bg-[#EAF2ED] text-[#2F6B4F]' : 'bg-[#EDF1F0] text-[#52606D]'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
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
