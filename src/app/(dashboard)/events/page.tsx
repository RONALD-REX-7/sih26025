'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { Timeline, TimelineItem } from '@/components/industrial/timeline';
import { StateContainer } from '@/components/industrial/state-container';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskState } from '@/lib/domain/risk-states';
import { Activity, Play, Filter } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const { activeAnomalies, state, initEngine } = useSimulatorStore();
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
        description: `Observed deviation ${deviation.toFixed(2)} ${anomaly.unit} (robust z-score ${anomaly.zScore.toFixed(1)}σ) on ${anomaly.sensorType}. Sustained persistence: ${anomaly.persistenceSec}s. Modality cross-check verified.`,
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
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              Geotechnical Event Log &bull; DGMS CMR 2017 Reg. 112
            </span>
            <ProvenanceBadge
              provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
              size="sm"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subsidence Events &amp; Anomaly Chronology
          </h1>
          <p className="text-xs text-slate-500">
            Real-time anomaly detection timeline, risk state transitions, and statutory directives recorded by the risk engine.
          </p>
        </div>

        <Link href="/simulator">
          <button
            type="button"
            className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            Simulator Workbench &rarr;
          </button>
        </Link>
      </div>

      {/* Events Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Active Anomalies</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {anomalyCount} <span className="text-[10px] font-normal text-slate-500">signals</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Chronological Events</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {timelineItems.length} <span className="text-[10px] font-normal text-slate-500">recorded</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Elevated Severity</div>
          <div className="text-base font-bold text-rose-600 mt-0.5">
            {criticalEvents} <span className="text-[10px] font-normal text-slate-500">Warning/Critical</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Active Directives</div>
          <div className="text-base font-bold text-amber-600 mt-0.5">
            {activeCount} <span className="text-[10px] font-normal text-slate-500">alerts</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500">Severity:</span>
          {['ALL', 'Critical', 'Warning', 'Watch', 'Advisory', 'Normal'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRisk(r)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs border cursor-pointer ${
                selectedRisk === r
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400">{filteredItems.length} events matching</span>
      </div>

      {/* Timeline Surface */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4">
        {filteredItems.length === 0 ? (
          <StateContainer
            type="empty"
            title="No Events Found"
            description="No subsidence events or statistical anomalies match the selected filter."
          />
        ) : (
          <Timeline items={filteredItems} />
        )}
      </div>
    </div>
  );
}
