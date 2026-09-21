'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Battery,
  Wifi,
  Search,
  Sliders,
  Filter,
  Radio,
} from 'lucide-react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { IngestionStats } from '@/lib/telemetry/types';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

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
  'SN-112': { panel: 'Panel P-103', depth: '288m' },
  'SN-113': { panel: 'Panel P-104', depth: '220m' },
  'SN-114': { panel: 'Panel P-104', depth: '225m' },
  'SN-115': { panel: 'Panel P-104', depth: '218m' },
  'SN-116': { panel: 'Panel P-104', depth: '222m' },
};

function getValueStatusColor(channelKey: string, value: number): string {
  const absVal = Math.abs(value);
  if (channelKey === 'TILT_X' || channelKey === 'TILT_Y') {
    if (absVal > 60) return 'text-[#B42318] font-bold';
    if (absVal > 30) return 'text-[#9A6A00] font-semibold';
  } else if (channelKey === 'DISP_Z') {
    if (absVal > 40) return 'text-[#B42318] font-bold';
    if (absVal > 30) return 'text-[#9A6A00] font-semibold';
  } else if (channelKey === 'VIB_RMS') {
    if (absVal > 5.0) return 'text-[#B42318] font-bold';
    if (absVal > 2.5) return 'text-[#9A6A00] font-semibold';
  } else if (channelKey === 'STRAIN') {
    if (absVal > 1000) return 'text-[#B42318] font-bold';
    if (absVal > 600) return 'text-[#9A6A00] font-semibold';
  }
  return 'text-[#1D2933] font-medium';
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

  const readingsList = useMemo(() => {
    return Object.values(latestReadings).sort((a, b) => a.sensorCode.localeCompare(b.sensorCode));
  }, [latestReadings]);

  const filteredReadings = useMemo(() => {
    return readingsList.filter((r) => {
      const panelInfo = PANEL_MAP[r.nodeId];
      const parts = r.sensorCode.split('-');
      const channel = parts[parts.length - 1];

      const matchesSearch =
        r.nodeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sensorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (panelInfo && panelInfo.panel.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedPanel !== 'ALL' && panelInfo && !panelInfo.panel.includes(selectedPanel)) {
        return false;
      }

      if (selectedModality !== 'ALL' && channel !== selectedModality) {
        return false;
      }

      return true;
    });
  }, [readingsList, searchQuery, selectedPanel, selectedModality]);

  const onlineNodesCount = useMemo(() => {
    return Object.values(latestHealths).filter((h) => h.status === 'online').length;
  }, [latestHealths]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-[#173B57]" />
              Telemetry ingestion engine &bull; Real-time sensor bus
            </span>
            <ProvenanceBadge provenance={ingestionStats.activeSourceType === 'SIMULATED' ? 'SIMULATED' : 'LIVE'} size="sm" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Multi-Modal Telemetry Stream
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Synchronized high-frequency feed from 16 underground stations across 5 physical geotechnical channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/simulator">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#1D2933]"
            >
              <Sliders className="h-3 w-3 mr-1.5 text-[#52606D]" />
              Simulation controls ({state.status.toUpperCase()})
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-[#F4F6F5] border border-[#D7DEDC] text-xs font-mono-tech">
            <span className="relative flex h-2 w-2">
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  state.status === 'running' ? 'bg-[#2F6B4F]' : 'bg-[#74808A]'
                }`}
              />
            </span>
            <span className="text-[#1D2933] font-semibold">{state.speed}x clock</span>
          </div>
        </div>
      </div>

      {/* Ingestion Status Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Ingested samples
          </div>
          <div className="text-base font-bold tabular-nums text-[#1D2933] mt-0.5 font-mono-tech">
            {ingestionStats.totalSamplesIngested.toLocaleString()}
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            {readingsList.length} active channels synchronized
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Reporting fleet
          </div>
          <div className="text-base font-bold tabular-nums text-[#2F6B4F] mt-0.5 font-mono-tech">
            {onlineNodesCount} <span className="text-xs text-[#52606D] font-normal">/ 16 nodes</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            {Math.round((onlineNodesCount / 16) * 100)}% online &bull; Sub-GHz LoRa
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Current risk state
          </div>
          <div className="mt-1 flex items-center gap-2">
            <RiskBadge state={currentRiskState} size="sm" />
          </div>
          <div className="text-xs text-[#52606D] mt-1 font-mono-tech">
            Active scenario: {state.scenarioId}
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Ingestion buffer
          </div>
          <div className="text-base font-bold tabular-nums text-[#1D2933] mt-0.5 font-mono-tech">
            5s memory buffer
          </div>
          <div className="text-xs text-[#52606D] mt-0.5 font-mono-tech">
            Dropped: {ingestionStats.droppedSamplesCount} &bull; Errors: {ingestionStats.persistenceErrorsCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#74808A]" />
            <Input
              placeholder="Search station or channel (e.g. SN-102)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs font-mono-tech rounded-sm border-[#D7DEDC] bg-[#F4F6F5]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-[#52606D]">
              <Filter className="h-3 w-3" />
              <span>Filters:</span>
            </div>

            <select
              aria-label="Filter by Colliery Panel"
              className="h-8 text-xs px-2.5 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] font-mono-tech text-[#1D2933]"
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
            >
              <option value="ALL">All Panels (P-101 to P-104)</option>
              <option value="P-101">Panel P-101 (240m)</option>
              <option value="P-102">Panel P-102 (260m)</option>
              <option value="P-103">Panel P-103 (280m)</option>
              <option value="P-104">Panel P-104 (220m)</option>
            </select>

            <select
              aria-label="Filter by Transducer Channel"
              className="h-8 text-xs px-2.5 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] font-mono-tech text-[#1D2933]"
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
      <div className="rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] overflow-hidden">
        <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-[#1D2933] uppercase tracking-wider">
              Live Transducer Channels ({filteredReadings.length})
            </h2>
            <p className="text-xs text-[#52606D] mt-0.5">
              Synchronized normalized samples updated in real time by simulation clock
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#52606D] font-mono-tech">
            <Clock className="h-3.5 w-3.5" />
            <span>T+{state.elapsedSec}s elapsed</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wider text-[#52606D] border-b border-[#D7DEDC] font-semibold">
              <tr>
                <th className="px-3.5 py-2.5">Node ID &amp; Panel</th>
                <th className="px-3.5 py-2.5">Transducer Channel</th>
                <th className="px-3.5 py-2.5 text-right">Latest Value</th>
                <th className="px-3.5 py-2.5">Unit</th>
                <th className="px-3.5 py-2.5">Baseline / Limit</th>
                <th className="px-3.5 py-2.5 text-center">Quality</th>
                <th className="px-3.5 py-2.5">Node Health</th>
                <th className="px-3.5 py-2.5 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] font-mono-tech">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#52606D] font-sans">
                    No transducer channels match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((sample) => {
                  const parts = sample.sensorCode.split('-');
                  const channelKey = parts[parts.length - 1];
                  const modality = MODALITY_LABELS[channelKey] || { name: channelKey, unit: '', baseline: '-' };
                  const panelInfo = PANEL_MAP[sample.nodeId] || { panel: 'Colliery', depth: '-' };
                  const health = latestHealths[sample.nodeId];
                  const valColor = getValueStatusColor(channelKey, sample.value);

                  return (
                    <tr key={sample.sensorCode} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-[#1D2933] whitespace-nowrap">
                        {sample.nodeId}
                        <span className="ml-2 font-normal text-[#52606D] font-sans">
                          {panelInfo.panel}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap font-sans">
                        <span className="font-medium text-[#1D2933]">{modality.name}</span>
                        <span className="ml-1.5 text-xs text-[#74808A] font-mono-tech">
                          ({channelKey})
                        </span>
                      </td>
                      <td className={`px-3.5 py-2.5 text-right tabular-nums whitespace-nowrap ${valColor}`}>
                        {sample.value.toFixed(2)}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap">
                        {modality.unit}
                      </td>
                      <td className="px-3.5 py-2.5 text-[#74808A] whitespace-nowrap">
                        {modality.baseline}
                      </td>
                      <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded-sm text-xs bg-[#EAF2ED] text-[#2F6B4F] font-semibold">
                          VALID
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[#2F6B4F]">
                            <Battery className="h-3 w-3" />
                            {health?.batteryPct ?? 95}%
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#74808A]">
                            <Wifi className="h-3 w-3" />
                            {health?.signalRssiDbm ?? -74} dBm
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-[#74808A] whitespace-nowrap">
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
