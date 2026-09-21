'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Battery,
  Wifi,
  Search,
  Sliders,
  Filter,
} from 'lucide-react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { IngestionStats } from '@/lib/telemetry/types';
import { RiskBadge } from '@/components/industrial/risk-badge';

const MODALITY_LABELS: Record<string, { name: string; unit: string; baseline: string }> = {
  TILT_X: { name: 'Biaxial Tilt X', unit: 'arcsec', baseline: '0.00 ± 3.00' },
  TILT_Y: { name: 'Biaxial Tilt Y', unit: 'arcsec', baseline: '0.00 ± 3.00' },
  DISP_Z: { name: 'Extensometer Displacement', unit: 'mm', baseline: '18.50 (< 30.0)' },
  VIB_RMS: { name: 'Vibration Velocity PPV', unit: 'mm/s', baseline: '0.10 (< 2.00)' },
  STRAIN: { name: 'Rockmass Strain', unit: 'µε', baseline: '420.0 (< 600)' },
};

const PANEL_MAP: Record<string, { panel: string; depth: string }> = {
  'SN-101': { panel: 'Panel P-101', depth: '240m' },
  'SN-102': { panel: 'Panel P-101', depth: '245m' },
  'SN-103': { panel: 'Panel P-101', depth: '242m' },
  'SN-104': { panel: 'Panel P-101', depth: '238m' },
  'SN-105': { panel: 'Panel P-102', depth: '260m' },
  'SN-106': { panel: 'Panel P-102', depth: '262m' },
  'SN-107': { panel: 'Panel P-102', depth: '258m' },
  'SN-108': { panel: 'Panel P-102', depth: '265m' },
  'SN-109': { panel: 'Panel P-103', depth: '280m' },
  'SN-110': { panel: 'Panel P-103', depth: '285m' },
  'SN-111': { panel: 'Panel P-103', depth: '282m' },
  'SN-112': { panel: 'Panel P-103', depth: '278m' },
  'SN-113': { panel: 'Panel P-104', depth: '220m' },
  'SN-114': { panel: 'Panel P-104', depth: '225m' },
  'SN-115': { panel: 'Panel P-104', depth: '218m' },
  'SN-116': { panel: 'Panel P-104', depth: '222m' },
};

function getValueStatusColor(channelKey: string, value: number): string {
  const absVal = Math.abs(value);
  if (channelKey === 'TILT_X' || channelKey === 'TILT_Y') {
    if (absVal > 60) return 'text-rose-600 dark:text-rose-400 font-bold';
    if (absVal > 30) return 'text-amber-600 dark:text-amber-400 font-semibold';
  } else if (channelKey === 'DISP_Z') {
    if (absVal > 40) return 'text-rose-600 dark:text-rose-400 font-bold';
    if (absVal > 30) return 'text-amber-600 dark:text-amber-400 font-semibold';
  } else if (channelKey === 'VIB_RMS') {
    if (absVal > 5.0) return 'text-rose-600 dark:text-rose-400 font-bold';
    if (absVal > 2.5) return 'text-amber-600 dark:text-amber-400 font-semibold';
  } else if (channelKey === 'STRAIN') {
    if (absVal > 1000) return 'text-rose-600 dark:text-rose-400 font-bold';
    if (absVal > 600) return 'text-amber-600 dark:text-amber-400 font-semibold';
  }
  return 'text-slate-900 dark:text-slate-100 font-medium';
}

export default function TelemetryPage() {
  const { initEngine, state, latestReadings, latestHealths, currentRiskState } = useSimulatorStore();
  const [ingestionStats, setIngestionStats] = useState<IngestionStats>({
    totalSamplesIngested: 0,
    totalBatchesIngested: 0,
    lastReceivedAt: null,
    activeSourceType: 'SIMULATED',
    droppedSamplesCount: 0,
    persistenceErrorsCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPanel, setSelectedPanel] = useState<string>('ALL');
  const [selectedModality, setSelectedModality] = useState<string>('ALL');

  useEffect(() => {
    initEngine();
    const telemetryEngine = TelemetryEngine.getInstance();
    const interval = setInterval(() => {
      setIngestionStats(telemetryEngine.getStats());
    }, 1000);
    return () => clearInterval(interval);
  }, [initEngine]);

  // Transform latestReadings map to sorted array
  const readingsList = useMemo(() => {
    return Object.values(latestReadings).sort((a, b) => a.sensorCode.localeCompare(b.sensorCode));
  }, [latestReadings]);

  // Filtered readings
  const filteredReadings = useMemo(() => {
    return readingsList.filter((r) => {
      const panelInfo = PANEL_MAP[r.nodeId];
      const parts = r.sensorCode.split('-');
      const channel = parts[parts.length - 1];

      // Search match
      const matchesSearch = 
        r.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sensorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (panelInfo && panelInfo.panel.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Panel match
      if (selectedPanel !== 'ALL' && panelInfo && !panelInfo.panel.includes(selectedPanel)) {
        return false;
      }

      // Modality match
      if (selectedModality !== 'ALL' && channel !== selectedModality) {
        return false;
      }

      return true;
    });
  }, [readingsList, searchQuery, selectedPanel, selectedModality]);

  // Calculate online nodes count
  const onlineNodesCount = useMemo(() => {
    return Object.values(latestHealths).filter((h) => h.status === 'online').length;
  }, [latestHealths]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-4 rounded-md border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Telemetry Ingestion Engine
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 rounded-xs">
              PROVENANCE: {ingestionStats.activeSourceType}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-modal sensor stream: Bhowra-West Colliery (ESP32 Gateway &times; 16 Nodes &times; 5 Channels)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/simulator">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-slate-300 dark:border-slate-700">
              <Sliders className="h-3 w-3 text-slate-500" />
              <span>Simulation Station ({state.status.toUpperCase()})</span>
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${state.status === 'running' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{state.speed}x Clock</span>
          </div>
        </div>
      </div>

      {/* High-Density Ingestion Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ingested Samples</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {ingestionStats.totalSamplesIngested.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {readingsList.length} active channels synchronized
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Reporting Fleet</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {onlineNodesCount} <span className="text-xs text-slate-400 font-normal">/ 16 nodes</span>
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            {Math.round((onlineNodesCount / 16) * 100)}% fleet online • RS-485 / RF
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Current Risk State</p>
          <div className="mt-1 flex items-center gap-2">
            <RiskBadge state={currentRiskState} size="sm" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Scenario: {state.scenarioId}
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ingestion Engine</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            5s DB Buffer
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Dropped: {ingestionStats.droppedSamplesCount} • Errors: {ingestionStats.persistenceErrorsCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search node or channel (e.g. SN-102)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs rounded-sm border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
              <Filter className="h-3 w-3" />
              <span>Filters:</span>
            </div>

            {/* Panel Filter */}
            <select
              aria-label="Filter by Colliery Panel"
              className="h-8 text-xs px-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-slate-700 dark:text-slate-300"
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
            >
              <option value="ALL">All Panels (P-101 to P-104)</option>
              <option value="P-101">Panel P-101 (240m)</option>
              <option value="P-102">Panel P-102 (260m)</option>
              <option value="P-103">Panel P-103 (280m)</option>
              <option value="P-104">Panel P-104 (220m)</option>
            </select>

            {/* Modality Filter */}
            <select
              aria-label="Filter by Transducer Channel"
              className="h-8 text-xs px-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-slate-700 dark:text-slate-300"
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
            >
              <option value="ALL">All Transducer Channels</option>
              <option value="TILT_X">Biaxial Tilt X (arcsec)</option>
              <option value="TILT_Y">Biaxial Tilt Y (arcsec)</option>
              <option value="DISP_Z">Extensometer Displacement (mm)</option>
              <option value="VIB_RMS">Vibration Velocity PPV (mm/s)</option>
              <option value="STRAIN">Rockmass Strain (µε)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Telemetry Table */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Live Transducer Channels ({filteredReadings.length})
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Synchronized normalized samples updated in real time by simulation clock
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <Clock className="h-3 w-3" />
            <span>T+{state.elapsedSec}s elapsed</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
              <tr>
                <th className="px-3.5 py-2 font-medium">Node ID & Panel</th>
                <th className="px-3.5 py-2 font-medium">Transducer Channel</th>
                <th className="px-3.5 py-2 font-medium text-right">Latest Value</th>
                <th className="px-3.5 py-2 font-medium">Unit</th>
                <th className="px-3.5 py-2 font-medium">Baseline / Limit</th>
                <th className="px-3.5 py-2 font-medium text-center">Quality</th>
                <th className="px-3.5 py-2 font-medium">Node Health</th>
                <th className="px-3.5 py-2 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No transducer channels match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((sample) => {
                  const parts = sample.sensorCode.split('-');
                  const channelKey = parts[parts.length - 1];
                  const modality = MODALITY_LABELS[channelKey] || { name: channelKey, unit: '', baseline: '-' };
                  const panelInfo = PANEL_MAP[sample.nodeId] || { panel: 'Unknown Panel', depth: '-' };
                  const nodeHealth = latestHealths[sample.nodeId];
                  const isAffected = state.affectedNodeCodes.includes(sample.nodeId);
                  const valueClass = getValueStatusColor(channelKey, sample.value);

                  return (
                    <tr 
                      key={sample.sensorCode}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors ${
                        isAffected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Node ID & Panel */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {sample.nodeId}
                          </span>
                          {isAffected && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 rounded-xs">
                              TARGET
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {panelInfo.panel} ({panelInfo.depth})
                        </div>
                      </td>

                      {/* Modality */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {modality.name}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {sample.sensorCode}
                        </div>
                      </td>

                      {/* Value (Neutral for nominal, warning/red only on genuine exceedance) */}
                      <td className="px-3.5 py-2 whitespace-nowrap text-right">
                        <span className={`text-xs tabular-nums ${valueClass}`}>
                          {sample.value.toFixed(2)}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="px-3.5 py-2 whitespace-nowrap text-slate-500 text-[11px]">
                        {modality.unit}
                      </td>

                      {/* Safe Baseline */}
                      <td className="px-3.5 py-2 whitespace-nowrap text-slate-400 text-[10px]">
                        {modality.baseline}
                      </td>

                      {/* Quality Score (Clean tabular presentation) */}
                      <td className="px-3.5 py-2 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 tabular-nums text-slate-700 dark:text-slate-300 text-[11px]">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            sample.qualityScore >= 0.8 ? 'bg-emerald-500' : sample.qualityScore >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {(sample.qualityScore * 100).toFixed(0)}%
                        </span>
                      </td>

                      {/* Node Health */}
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        {nodeHealth ? (
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-0.5">
                              <Battery className="h-3 w-3 text-slate-400" />
                              {(nodeHealth.batteryVoltage ?? 3.3).toFixed(2)}V
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Wifi className="h-3 w-3 text-slate-400" />
                              {nodeHealth.signalRssiDbm} dBm
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Polling...</span>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="px-3.5 py-2 whitespace-nowrap text-right text-[10px] text-slate-400">
                        {new Date(sample.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
