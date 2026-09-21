'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Timeline, TimelineItem } from '@/components/industrial/timeline';
import { StateContainer } from '@/components/industrial/state-container';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { RiskState } from '@/lib/domain/risk-states';
import { Activity, Play, Filter } from 'lucide-react';
import Link from 'next/link';

export default function EventsPage() {
  const { activeAnomalies, initEngine } = useSimulatorStore();
  const { alerts, initAlertEngine, activeCount } = useAlertStore();
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  useEffect(() => {
    initEngine();
    initAlertEngine();
  }, [initEngine, initAlertEngine]);

  // Build a unified event timeline from real-time anomalies and alerts
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // Derive events from anomaly records
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

    // Derive events from alert records
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
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#173B57]" />
              Geotechnical Event Log &bull; DGMS CMR 2017 Reg. 112
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Subsidence Events &amp; Anomaly Chronology
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Chronological audit of sensor anomalies, risk state transitions, and statutory directives recorded by the risk engine.
          </p>
        </div>

        <Link href="/simulator">
          <button
            type="button"
            className="px-3 py-1.5 rounded-sm bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] text-xs font-mono-tech font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="h-3 w-3 fill-current" />
            Simulator Workbench &rarr;
          </button>
        </Link>
      </div>

      {/* Events Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Active Anomalies</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            {anomalyCount} <span className="text-xs font-normal text-[#52606D]">signals</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Chronological Events</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            {timelineItems.length} <span className="text-xs font-normal text-[#52606D]">recorded</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Elevated Severity</div>
          <div className="text-lg font-bold text-[#B42318] mt-0.5">
            {criticalEvents} <span className="text-xs font-normal text-[#52606D]">Warning/Critical</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Active Directives</div>
          <div className="text-lg font-bold text-[#A85A00] mt-0.5">
            {activeCount} <span className="text-xs font-normal text-[#52606D]">alerts</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#74808A] shrink-0" />
          <span className="text-[#52606D]">Severity:</span>
          {['ALL', 'Critical', 'Warning', 'Watch', 'Advisory', 'Normal'].map((r) => (
            <button
              key={r}
              type="button"
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
        <span className="text-xs text-[#52606D]">{filteredItems.length} events matching</span>
      </div>

      {/* Timeline Surface */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 shadow-xs">
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
