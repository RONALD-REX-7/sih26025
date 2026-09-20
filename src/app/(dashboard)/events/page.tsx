'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { Timeline, TimelineItem } from '@/components/industrial/timeline';
import { StateContainer } from '@/components/industrial/state-container';
import { MetricBlock } from '@/components/industrial/metric-block';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskState } from '@/lib/domain/risk-states';
import { Activity, Play, Filter, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const { activeAnomalies, state, currentRiskState, initEngine } = useSimulatorStore();
  const { alerts, initAlertEngine, activeCount } = useAlertStore();
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  useEffect(() => {
    initEngine();
    initAlertEngine();
  }, [initEngine, initAlertEngine]);

  // Build a unified event timeline from real-time anomalies and alerts
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // Derive events from anomaly records (risk engine output)
    for (const anomaly of activeAnomalies) {
      const deviation = Math.abs(anomaly.value - anomaly.baselineMean);
      items.push({
        id: anomaly.id,
        timestamp: anomaly.detectedAt,
        title: `Anomaly: ${anomaly.sensorCode} — ${anomaly.anomalyType}`,
        description: `Deviation ${deviation.toFixed(2)} ${anomaly.unit} (z-score ${anomaly.zScore.toFixed(1)}) on ${anomaly.sensorType}. Persistence: ${anomaly.persistenceSec}s. Confidence: ${(anomaly.confidence * 100).toFixed(0)}%.`,
        riskState: anomaly.severity === 'critical'
          ? 'Critical' as RiskState
          : anomaly.severity === 'high'
          ? 'Warning' as RiskState
          : anomaly.severity === 'medium'
          ? 'Watch' as RiskState
          : 'Advisory' as RiskState,
        provenance: 'SIMULATED',
        location: anomaly.nodeCode,
      });
    }

    // Derive events from alert records (statutory alerts)
    for (const alert of alerts) {
      items.push({
        id: alert.id,
        timestamp: alert.triggered_at,
        title: `Alert: ${alert.title}`,
        description: alert.message,
        riskState: alert.risk_state as RiskState,
        provenance: 'DEMO',
        location: alert.panel?.code || alert.panel_id || 'Mine Wide',
      });
    }

    // Sort by most recent first
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activeAnomalies, alerts]);

  // Filter by risk state
  const filteredItems = useMemo(() => {
    if (selectedRisk === 'ALL') return timelineItems;
    return timelineItems.filter((item) => item.riskState === selectedRisk);
  }, [timelineItems, selectedRisk]);

  const anomalyCount = activeAnomalies.length;
  const criticalEvents = timelineItems.filter(
    (t) => t.riskState === 'Critical' || t.riskState === 'Warning'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              Geotechnical Event Log
            </span>
            <ProvenanceBadge
              provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
              size="sm"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subsidence Events &amp; Anomaly Chronology
          </h1>
          <p className="text-xs text-slate-500">
            Real-time anomaly detection events, risk state transitions, and statutory alerts from the AI risk engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/simulator">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-medium">
              <Play className="h-3 w-3 mr-1 fill-current" />
              Trigger Event in Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Active Anomalies"
          channelCode="EVT-ANOM-ACT"
          value={anomalyCount}
          unit="detected"
          nominalRange={[0, 3]}
          riskState={anomalyCount > 5 ? 'Warning' : anomalyCount > 0 ? 'Advisory' : 'Normal'}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Active Alerts"
          channelCode="EVT-ALT-ACT"
          value={activeCount}
          unit="incidents"
          nominalRange={[0, 2]}
          riskState={activeCount > 0 ? 'Advisory' : 'Normal'}
          provenance="DEMO"
        />
        <MetricBlock
          label="Critical / Warning Events"
          channelCode="EVT-CRIT"
          value={criticalEvents}
          unit="flagged"
          nominalRange={[0, 1]}
          riskState={criticalEvents > 0 ? 'Warning' : 'Normal'}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Mine Risk Level"
          channelCode="EVT-MINE-RSK"
          value={['Normal', 'Advisory', 'Watch', 'Warning', 'Critical'].indexOf(currentRiskState)}
          unit={`(${currentRiskState})`}
          nominalRange={[0, 1]}
          riskState={currentRiskState}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter Risk Level:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'Critical', 'Warning', 'Watch', 'Advisory', 'Normal'].map((risk) => (
              <Button
                key={risk}
                variant={selectedRisk === risk ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRisk(risk)}
                className={`text-[11px] h-7 px-2.5 font-mono ${
                  selectedRisk === risk
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {risk}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      {filteredItems.length > 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Chronological Event Progression
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {filteredItems.length} Event{filteredItems.length !== 1 ? 's' : ''}
                </Badge>
                <RiskBadge state={currentRiskState} size="sm" />
              </div>
            </div>
            <CardDescription className="text-xs">
              Real-time anomaly detections, risk transitions, and statutory alerts from the AI engine pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <Timeline items={filteredItems} />
          </CardContent>
        </Card>
      ) : (
        <StateContainer
          type="empty"
          title="No Active Geotechnical Events"
          description={
            state.status !== 'running'
              ? 'Start the simulator to generate telemetry events and observe real-time anomaly detection.'
              : 'The mine strata is currently in a stable state. No persistent tilt deflection, borehole displacement, or acoustic emission bursts have exceeded advisory thresholds.'
          }
          action={
            state.status !== 'running' ? (
              <Link href="/simulator">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Play className="h-3 w-3 mr-1 fill-current" />
                  Open Simulator
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Active Anomalies Detail Table — only when anomalies exist */}
      {activeAnomalies.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                AI Anomaly Detection Evidence
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono bg-rose-50 text-rose-700 border-rose-300">
                {activeAnomalies.length} Anomal{activeAnomalies.length !== 1 ? 'ies' : 'y'}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Sensor-level deviations flagged by z-score, persistence analysis, and cross-modality fusion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Sensor Code</th>
                    <th className="px-4 py-2.5 font-medium">Node</th>
                    <th className="px-4 py-2.5 font-medium">Modality</th>
                    <th className="px-4 py-2.5 font-medium">Anomaly Type</th>
                    <th className="px-4 py-2.5 font-medium text-right">Z-Score</th>
                    <th className="px-4 py-2.5 font-medium text-right">Value</th>
                    <th className="px-4 py-2.5 font-medium text-right">Baseline</th>
                    <th className="px-4 py-2.5 font-medium text-right">Persistence</th>
                    <th className="px-4 py-2.5 font-medium">Severity</th>
                    <th className="px-4 py-2.5 font-medium text-right">Detected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {activeAnomalies.map((a) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/40 ${
                        a.severity === 'critical' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {a.sensorCode}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-semibold">
                        {a.nodeCode}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 uppercase">
                        {a.sensorType}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {a.anomalyType}
                        </Badge>
                      </td>
                      <td className={`px-4 py-2.5 text-right font-bold ${
                        Math.abs(a.zScore) > 4 ? 'text-rose-600' : Math.abs(a.zScore) > 2 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {a.zScore.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-300">
                        {a.value.toFixed(3)} {a.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400">
                        {a.baselineMean.toFixed(3)} {a.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">
                        {a.persistenceSec}s
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono capitalize ${
                            a.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : a.severity === 'high'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : a.severity === 'medium'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : 'bg-slate-50 text-slate-600 border-slate-300'
                          }`}
                        >
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(a.detectedAt).toLocaleTimeString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
