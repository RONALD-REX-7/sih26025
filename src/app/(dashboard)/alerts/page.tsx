'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from '@/lib/domain/types';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { StateContainer } from '@/components/industrial/state-container';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import { EscalateModal } from '@/components/industrial/escalate-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ShieldAlert,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  FileText,
  Send,
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
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'dispatches'>('queue');
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  // Modal dialog states
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

  const activeAlert =
    (selectedAlertId && alerts.find((a) => a.id === selectedAlertId)) || filteredAlerts[0] || alerts[0];

  const handleOpenAcknowledge = (alert: Alert) => {
    setTargetAckAlert(alert);
  };

  const handleOpenEscalate = (alert: Alert) => {
    setTargetEscalateAlert(alert);
  };

  const handleConfirmAcknowledge = async (payload: AcknowledgementPayload) => {
    if (!targetAckAlert) return;
    await acknowledgeAlert(targetAckAlert.id, payload);
    setAckNotice(`Alert ${targetAckAlert.id} successfully acknowledged. Audit entry recorded.`);
    setTimeout(() => setAckNotice(null), 4000);
  };

  const handleConfirmEscalate = (payload: EscalationPayload) => {
    if (!targetEscalateAlert) return;
    escalateAlert(targetEscalateAlert.id, payload);
    setAckNotice(`Alert ${targetEscalateAlert.id} escalated to ${payload.escalatedTo}. Audit log updated.`);
    setTimeout(() => setAckNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Alarm Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-amber-500" />
              Emergency Response &bull; DGMS CMR 2017 Reg 112
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Early Warning &amp; Subsidence Alert Center
          </h1>
          <p className="text-xs text-slate-500">
            Multi-tier geotechnical alert dispatch, regulatory sign-off, audible siren, and escalation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Audible Siren Controller */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-md border border-slate-200 dark:border-slate-800">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMuteAlarm}
              className={`h-7 px-2 text-xs font-mono cursor-pointer ${
                isAlarmMuted ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isAlarmMuted ? <VolumeX className="h-3.5 w-3.5 mr-1" /> : <Volume2 className="h-3.5 w-3.5 mr-1" />}
              {isAlarmMuted ? 'Alarm Muted' : isAlarmPlaying ? 'Siren Active' : 'Sound Ready'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={playTestAlarm}
              className="h-7 px-2 text-[10px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Test Beep
            </Button>
          </div>

          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              criticalCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}
          >
            {criticalCount > 0 ? `${criticalCount} High Risk Alert(s)` : 'Geotechnical Status: Controlled'}
          </Badge>
        </div>
      </div>

      {ackNotice && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{ackNotice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Active Incidents"
          channelCode="SYS-ALT-ACT"
          value={activeCount}
          unit="events"
          nominalRange={[0, 2]}
          riskState={activeCount > 0 ? 'Advisory' : 'Normal'}
          provenance="DEMO"
        />
        <MetricBlock
          label="Acknowledged"
          channelCode="SYS-ALT-ACK"
          value={alerts.filter((a) => a.status === 'acknowledged').length}
          unit="logged"
          nominalRange={[0, 10]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Escalated Incidents"
          channelCode="DGMS-ESC"
          value={alerts.filter((a) => a.status === 'escalated').length}
          unit="dispatched"
          nominalRange={[0, 0]}
          riskState={alerts.some((a) => a.status === 'escalated') ? 'Warning' : 'Normal'}
          provenance="DEMO"
        />
        <MetricBlock
          label="Notification Dispatches"
          channelCode="NOTIF-DISP"
          value={notificationHistory.length}
          unit="channels"
          nominalRange={[0, 50]}
          riskState="Normal"
          provenance="DEMO"
        />
      </div>

      {/* Mode Tabs: Active Queue vs Notification History */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeTab === 'queue' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('queue')}
            className={`text-xs font-mono h-8 cursor-pointer ${
              activeTab === 'queue' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600'
            }`}
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Incident Queue ({filteredAlerts.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'dispatches' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dispatches')}
            className={`text-xs font-mono h-8 cursor-pointer ${
              activeTab === 'dispatches' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600'
            }`}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Multi-Channel Dispatch Log ({notificationHistory.length})
          </Button>
        </div>

        {activeTab === 'queue' && (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Risk:</span>
              {['ALL', 'Critical', 'Warning', 'Watch', 'Advisory'].map((r) => (
                <Button
                  key={r}
                  variant={selectedRisk === r ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedRisk(r)}
                  className={`text-[10px] h-6 px-1.5 font-mono ${
                    selectedRisk === r
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {r}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Status:</span>
              {['ALL', 'active', 'acknowledged', 'escalated'].map((s) => (
                <Button
                  key={s}
                  variant={selectedStatus === s ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedStatus(s)}
                  className={`text-[10px] h-6 px-1.5 font-mono capitalize ${
                    selectedStatus === s
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: INCIDENT QUEUE & EVIDENCE INSPECTOR */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Table (2 cols) */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    Emergency Geotechnical Incident Log
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select an alert to view convergence evidence, audit metadata, and sign-off directives
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                      <TableHead>Time (IST)</TableHead>
                      <TableHead>Risk State</TableHead>
                      <TableHead>Incident Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="p-8">
                          <StateContainer
                            type="empty"
                            title="No Alerts In Selected Category"
                            description="All geotechnical channels report baseline convergence tolerances."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAlerts.map((a) => (
                        <TableRow
                          key={a.id}
                          onClick={() => setSelectedAlertId(a.id)}
                          className={`text-xs cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/80 ${
                            activeAlert.id === a.id ? 'bg-slate-100/70 dark:bg-slate-800/70' : ''
                          }`}
                        >
                          <TableCell className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(a.triggered_at).toLocaleTimeString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <RiskBadge state={a.risk_state} size="sm" />
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-slate-100 max-w-50 truncate">
                            {a.title}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {a.panel?.code || a.panel_id || 'General'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono capitalize ${
                                a.status === 'active'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                                  : a.status === 'escalated'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                                  : a.status === 'acknowledged'
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-slate-50 text-slate-600 border-slate-300'
                              }`}
                            >
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {a.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenAcknowledge(a)}
                                  className="text-[11px] h-6 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer"
                                >
                                  Sign Off
                                </Button>
                              )}
                              {a.status !== 'resolved' && a.status !== 'escalated' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEscalate(a)}
                                  className="text-[10px] h-6 px-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                  title="Escalate incident to DGMS"
                                >
                                  <Flame className="h-3 w-3 mr-0.5" />
                                  Escalate
                                </Button>
                              )}
                              {a.status === 'acknowledged' && (
                                <span className="text-[10px] font-mono text-slate-400">Signed Off</span>
                              )}
                              {a.status === 'escalated' && (
                                <span className="text-[10px] font-mono text-rose-600 font-semibold">Escalated</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Alert Evidence Inspector (1 col) */}
          <div className="lg:col-span-1">
            {activeAlert ? (
              <Card className="border-slate-200 dark:border-slate-800 h-full flex flex-col">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-900">
                  <div className="flex items-center justify-between mb-1">
                    <RiskBadge state={activeAlert.risk_state} size="md" />
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {activeAlert.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold">{activeAlert.title}</CardTitle>
                  <CardDescription className="text-xs font-mono text-slate-500">
                    ID: {activeAlert.id} &bull; Panel: {activeAlert.panel?.code || activeAlert.panel_id || 'Mine Wide'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-1 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-1">
                      Geotechnical Evidence &amp; Observation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                      {activeAlert.message}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                      Regulatory Mandate &amp; Directive
                    </h4>
                    <div className="p-2.5 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        DGMS Circular (Coal) No. 04 of 2017
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[10.5px] leading-relaxed">
                        Mandates continuous convergence recording, barrier pillar integrity checks, and immediate barricading if tensile strain exceeds 3.0 mm/m.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Triggered At:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {new Date(activeAlert.triggered_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                      </span>
                    </div>
                    {activeAlert.acknowledged_by && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Acknowledged By:</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                          {activeAlert.acknowledged_by}
                        </span>
                      </div>
                    )}
                    {activeAlert.acknowledged_at && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Ack Timestamp:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {new Date(activeAlert.acknowledged_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                        </span>
                      </div>
                    )}
                  </div>

                  {activeAlert.status === 'active' && (
                    <div className="pt-3 space-y-2">
                      <Button
                        onClick={() => handleOpenAcknowledge(activeAlert)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4 mr-1.5" />
                        Statutory Sign-Off &amp; Acknowledge
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenEscalate(activeAlert)}
                        className="w-full text-xs font-mono text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      >
                        <Flame className="h-3.5 w-3.5 mr-1.5" />
                        Escalate to DGMS Hierarchy
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <StateContainer
                type="empty"
                title="No Incident Selected"
                description="Select an alert from the queue to view geotechnical evidence."
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-CHANNEL NOTIFICATION DISPATCH LOG */}
      {activeTab === 'dispatches' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                Multi-Channel Emergency Notification Dispatch Log
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time audit trail of all automated SMS, Email, Webhook, and In-App dispatches
              </CardDescription>
            </div>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                  <TableHead>Timestamp (IST)</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-8">
                      <StateContainer
                        type="empty"
                        title="No Notifications Dispatched Yet"
                        description="Notification dispatches will appear here automatically when risk state transitions occur."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  notificationHistory.map((n) => (
                    <TableRow key={n.id} className="text-xs font-mono">
                      <TableCell className="text-slate-500 whitespace-nowrap">
                        {new Date(n.dispatchedAt).toLocaleTimeString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {n.payload.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-slate-700 dark:text-slate-300">
                        {n.payload.recipient}
                      </TableCell>
                      <TableCell className="text-slate-500 text-[11px]">
                        {n.providerName}
                      </TableCell>
                      <TableCell className="max-w-64 truncate text-slate-800 dark:text-slate-200">
                        {n.payload.subject}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            n.status === 'SIMULATED_DEMO'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : n.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          {n.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {n.latencyMs} ms
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Acknowledge Modal Dialog */}
      <AcknowledgeModal
        alert={targetAckAlert}
        isOpen={!!targetAckAlert}
        onClose={() => setTargetAckAlert(null)}
        onConfirm={handleConfirmAcknowledge}
      />

      {/* Escalate Modal Dialog */}
      <EscalateModal
        alert={targetEscalateAlert}
        isOpen={!!targetEscalateAlert}
        onClose={() => setTargetEscalateAlert(null)}
        onConfirm={handleConfirmEscalate}
      />
    </div>
  );
}
