'use client';

import React, { useState } from 'react';
import { Alert } from '@/lib/domain/types';
import { DEMO_ALERTS } from '@/lib/data/mock-data';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { StateContainer } from '@/components/industrial/state-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldAlert, Bell } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeAlertId, setActiveAlertId] = useState<string>(alerts[0]?.id ?? '');
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    const matchesRisk = selectedRisk === 'ALL' || a.risk_state === selectedRisk;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesRisk && matchesStatus;
  });

  const activeAlert = alerts.find((a) => a.id === activeAlertId) || alerts[0];

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged',
              acknowledged_by: 'Current Safety Officer',
              acknowledged_at: new Date().toISOString(),
            }
          : a
      )
    );
    setAckNotice(`Alert ${alertId} acknowledged. Audit log entry recorded.`);
    setTimeout(() => setAckNotice(null), 4000);
  };

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const criticalCount = alerts.filter((a) => a.risk_state === 'Critical' || a.risk_state === 'Warning').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Emergency Response &bull; DGMS CMR 2017 Reg 112
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Early Warning & Subsidence Alert Center
          </h1>
          <p className="text-xs text-slate-500">
            Multi-tier geotechnical alert dispatch, operator verification, and evacuation perimeter management.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          value={acknowledgedCount}
          unit="logged"
          nominalRange={[0, 10]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Evacuation Orders"
          channelCode="DGMS-EVAC"
          value={0}
          unit="zones"
          nominalRange={[0, 0]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Mean Ack Latency"
          channelCode="OP-LAT-ACK"
          value={3.2}
          unit="min"
          nominalRange={[0, 10]}
          riskState="Normal"
          provenance="DEMO"
        />
      </div>

      {/* Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-500">Risk Level:</span>
            {['ALL', 'Normal', 'Advisory', 'Watch', 'Warning', 'Critical'].map((r) => (
              <Button
                key={r}
                variant={selectedRisk === r ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRisk(r)}
                className={`text-[11px] h-7 px-2 font-mono ${
                  selectedRisk === r
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {r}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-slate-500">Status:</span>
            {['ALL', 'active', 'acknowledged', 'resolved'].map((s) => (
              <Button
                key={s}
                variant={selectedStatus === s ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStatus(s)}
                className={`text-[11px] h-7 px-2 font-mono capitalize ${
                  selectedStatus === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Alerts Table & Selected Alert Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  Incident Queue ({filteredAlerts.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any row to inspect geotechnical evidence and escalation perimeters
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-8">
                        <StateContainer
                          type="empty"
                          title="No Alerts In Selected Category"
                          description="The strata monitoring fleet reports all channels within baseline tolerances."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlerts.map((a) => (
                      <TableRow
                        key={a.id}
                        onClick={() => setActiveAlertId(a.id)}
                        className={`text-xs cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/80 ${
                          activeAlertId === a.id ? 'bg-slate-100/70 dark:bg-slate-800/70' : ''
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
                          {a.panel?.code ?? 'General'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono capitalize ${
                              a.status === 'active'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                                : a.status === 'acknowledged'
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-slate-50 text-slate-600 border-slate-300'
                            }`}
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {a.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(a.id)}
                              className="text-[11px] h-6 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                            >
                              Acknowledge
                            </Button>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">Logged</span>
                          )}
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
                  ID: {activeAlert.id} &bull; Panel: {activeAlert.panel?.name ?? 'Mine Wide'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 flex-1 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider mb-1">
                    Geotechnical Evidence & Observation
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    {activeAlert.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                    Regulatory Mandate & Directive
                  </h4>
                  <div className="p-2.5 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-200">DGMS Circular (Coal) No. 04 of 2017</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Requires continuous convergence recording, daily shift logging, and immediate barricading if tensile strain exceeds 3.0 mm/m.
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
                  <div className="pt-3">
                    <Button
                      onClick={() => handleAcknowledge(activeAlert.id)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                    >
                      <ShieldAlert className="h-4 w-4 mr-1.5" />
                      Sign Off & Acknowledge Alert
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
    </div>
  );
}
