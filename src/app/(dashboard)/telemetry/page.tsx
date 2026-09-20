'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  Radio, 
  Search, 
  Filter, 
  Sliders, 
  ShieldAlert, 
  Battery,
  Wifi,
  Clock,
  HardDrive
} from 'lucide-react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { IngestionStats } from '@/lib/telemetry/types';
import { RiskBadge } from '@/components/industrial/risk-badge';

const MODALITY_LABELS: Record<string, { name: string; unit: string; baseline: string }> = {
  TILT_X: { name: 'Biaxial Tilt X', unit: 'arcsec', baseline: '0.00 ± 3.00' },
  TILT_Y: { name: 'Biaxial Tilt Y', unit: 'arcsec', baseline: '0.00 ± 3.00' },
  DISP_Z: { name: 'Extensometer Displacement', unit: 'mm', baseline: '0.00 (< 5.00)' },
  VIB_RMS: { name: 'Vibration Velocity PPV', unit: 'mm/s', baseline: '0.10 (< 2.00)' },
  STRAIN: { name: 'Rockmass Strain', unit: 'µε', baseline: '0.00 (< 250)' },
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Telemetry Ingestion Engine</h1>
            <Badge variant="outline" className="text-2xs font-mono bg-blue-500/10 text-blue-600 border-blue-500/30">
              PROVENANCE: {ingestionStats.activeSourceType}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normalized multi-modal sensor stream: Bhowra-West Colliery (ESP32 Gateway &times; 16 Nodes &times; 5 Channels)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/simulator">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-slate-300 dark:border-slate-700">
              <Sliders className="h-3.5 w-3.5 text-blue-500" />
              Simulation Station ({state.status.toUpperCase()})
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${state.status === 'running' ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${state.status === 'running' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{state.speed}x Clock</span>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Ingested Samples</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {ingestionStats.totalSamplesIngested.toLocaleString()}
              </p>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                {readingsList.length} active channels
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Reporting Nodes</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {onlineNodesCount} <span className="text-xs text-slate-400 font-normal">/ 16 fleet</span>
              </p>
              <p className="text-2xs text-emerald-600 font-mono mt-0.5">
                {Math.round((onlineNodesCount / 16) * 100)}% fleet health
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Mine Risk Level</p>
              <div className="mt-1">
                <RiskBadge state={currentRiskState} size="sm" />
              </div>
              <p className="text-2xs text-slate-400 font-mono mt-1">
                Scenario: {state.scenarioId}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xs uppercase tracking-wider text-slate-500 font-medium">DB Buffer & Flush</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                5s sync
              </p>
              <p className="text-2xs text-slate-400 font-mono mt-0.5">
                Errors: {ingestionStats.persistenceErrorsCount}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <HardDrive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search node or channel (e.g. SN-102)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>

              {/* Panel Filter */}
              <select
                aria-label="Filter by Colliery Panel"
                className="h-8 text-xs px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
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
                className="h-8 text-xs px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
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
        </CardContent>
      </Card>

      {/* Main Telemetry Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Live Transducer Channels ({filteredReadings.length})</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Synchronized normalized samples updated in real time by simulation clock
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono">
            <Clock className="h-3 w-3" />
            <span>T+{state.elapsedSec}s elapsed</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-2xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Node ID & Panel</th>
                  <th className="px-4 py-2.5 font-medium">Transducer Channel</th>
                  <th className="px-4 py-2.5 font-medium text-right">Latest Value</th>
                  <th className="px-4 py-2.5 font-medium">Unit</th>
                  <th className="px-4 py-2.5 font-medium">Baseline / Limit</th>
                  <th className="px-4 py-2.5 font-medium">Quality</th>
                  <th className="px-4 py-2.5 font-medium">Node Health</th>
                  <th className="px-4 py-2.5 font-medium text-right">Updated</th>
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

                    return (
                      <tr 
                        key={sample.sensorCode}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors ${
                          isAffected ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Node ID & Panel */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {sample.nodeId}
                            </span>
                            {isAffected && (
                              <Badge variant="outline" className="text-3xs px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30">
                                TARGET
                              </Badge>
                            )}
                          </div>
                          <div className="text-3xs text-slate-400 font-sans">
                            {panelInfo.panel} ({panelInfo.depth})
                          </div>
                        </td>

                        {/* Modality */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {modality.name}
                          </span>
                          <div className="text-3xs text-slate-400 font-mono">
                            {sample.sensorCode}
                          </div>
                        </td>

                        {/* Value */}
                        <td className="px-4 py-2.5 whitespace-nowrap text-right">
                          <span className={`font-bold text-sm ${
                            Math.abs(sample.value) > 10 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {sample.value.toFixed(2)}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                          {modality.unit}
                        </td>

                        {/* Safe Baseline */}
                        <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 text-2xs">
                          {modality.baseline}
                        </td>

                        {/* Quality Score */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div 
                                className={`h-full ${
                                  sample.qualityScore > 0.8 ? 'bg-emerald-500' : sample.qualityScore > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${Math.round(sample.qualityScore * 100)}%` }}
                              />
                            </div>
                            <span className="text-2xs text-slate-500">
                              {(sample.qualityScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>

                        {/* Node Health */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {nodeHealth ? (
                            <div className="flex items-center gap-2 text-2xs text-slate-500">
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
                            <span className="text-slate-400 text-3xs">Polling...</span>
                          )}
                        </td>

                        {/* Updated */}
                        <td className="px-4 py-2.5 whitespace-nowrap text-right text-3xs text-slate-400">
                          {new Date(sample.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
