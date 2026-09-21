'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Alert } from '@/lib/domain/types';
import { AcknowledgementPayload } from '@/lib/alerts/alert-types';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { GisLayerId } from '@/lib/domain/gis-types';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { RiskEvidencePanel } from '@/components/industrial/risk-evidence-panel';
import { GisMapCanvas } from '@/components/gis/gis-map-canvas';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  FileCheck,
  Shield,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    latestReadings,
    latestHealths,
    currentRiskState,
    currentEvidence,
    activeAnomalies,
    state: simState,
    initEngine,
  } = useSimulatorStore();

  const {
    alerts,
    acknowledgeAlert,
    initAlertEngine,
  } = useAlertStore();

  const [selectedNodeCode, setSelectedNodeCode] = useState<string | null>('SN-102');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAlertForAck, setSelectedAlertForAck] = useState<Alert | null>(null);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);

  // GIS Active Layers on Dashboard
  const [activeLayers, setActiveLayers] = useState<Record<GisLayerId, boolean>>({
    panels: true,
    nodes: true,
    infrastructure: true,
    goaf: true,
    insar: false,
    geomechanical: false,
    events: true,
  });

  const toggleLayer = (layerId: GisLayerId) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  useEffect(() => {
    initEngine(1025, 'NORMAL_BASELINE');
    initAlertEngine();
  }, [initEngine, initAlertEngine]);

  const isSimActive = simState.status === 'running';

  // Active alert requiring operator attention
  const activeAlert = useMemo(() => {
    return alerts.find((a) => a.status === 'active' || a.status === 'escalated') || null;
  }, [alerts]);

  // Fleet Health Aggregations
  const healthValues = Object.values(latestHealths);
  const offlineNodes = healthValues.filter((h) => h.status === 'offline').length;
  const degradedNodes = healthValues.filter((h) => h.status === 'degraded').length;
  const onlineNodes = Math.max(16 - offlineNodes - degradedNodes, 0);

  // Derive live risk state per node
  const liveRiskByNode = useMemo(() => {
    const map: Record<string, RiskState> = {};
    for (const node of DEMO_NODES) {
      const nodeDisp = latestReadings[`${node.node_code}-DISP_Z`]?.value ?? 18.5;
      let r: RiskState = 'Normal';
      if (nodeDisp > 48.0) r = 'Critical';
      else if (nodeDisp > 32.0) r = 'Warning';
      else if (nodeDisp > 24.0) r = 'Watch';
      else if (nodeDisp > 20.0) r = 'Advisory';
      map[node.node_code] = r;
    }
    if (currentEvidence?.where.epicenterNode) {
      map[currentEvidence.where.epicenterNode] = currentRiskState;
    }
    return map;
  }, [latestReadings, currentEvidence, currentRiskState]);

  // Handle operator sign-off submission
  const handleAcknowledgeConfirm = async (payload: AcknowledgementPayload) => {
    if (!selectedAlertForAck) return;
    await acknowledgeAlert(selectedAlertForAck.id, payload);
    setIsAckModalOpen(false);
    setSelectedAlertForAck(null);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* 1. High-Priority Operational Status Bar (48px) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#173B57] shrink-0" />
            <span className="font-semibold text-sm text-[#1D2933] tracking-tight truncate">
              Bhowra-West Colliery Command
            </span>
          </div>

          <span className="text-[#D7DEDC] hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-2 text-xs text-[#52606D]">
            <span>DGMS Status:</span>
            <span className="font-mono-tech font-semibold text-[#1D2933]">CMR 2017 Reg 112</span>
          </div>

          <span className="text-[#D7DEDC] hidden md:inline">|</span>

          <div className="flex items-center gap-2 text-xs text-[#52606D]">
            <span>Fleet:</span>
            <span className="font-mono-tech font-semibold text-[#1D2933]">{onlineNodes}/16 Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isSimActive && (
            <span className="text-xs font-mono-tech bg-[#FBF6E9] border border-[#9A6A00]/40 text-[#9A6A00] px-2 py-0.5 rounded-sm font-semibold">
              SIMULATING ({simState.speed}x)
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52606D] hidden sm:inline">Strata Condition:</span>
            <RiskBadge state={currentRiskState} size="md" />
          </div>
        </div>
      </div>

      {/* 2. Active Alert Evacuation Directive (if active) */}
      {activeAlert && (
        <div
          className={`p-3.5 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            activeAlert.severity === 'critical'
              ? 'border-[#91180E] bg-[#FBEBE9] text-[#91180E]'
              : activeAlert.severity === 'high'
              ? 'border-[#B42318] bg-[#FDF0ED] text-[#B42318]'
              : 'border-[#9A6A00] bg-[#FBF6E9] text-[#9A6A00]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-sm text-[#FFFFFF] shrink-0 mt-0.5 ${
              activeAlert.severity === 'critical' ? 'bg-[#91180E] animate-pulse' : 'bg-[#B42318]'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono-tech font-bold text-xs uppercase tracking-wider px-1.5 py-0.5 bg-black/10 rounded-sm">
                  {activeAlert.severity.toUpperCase()} DIRECTIVE
                </span>
                <RiskBadge state={activeAlert.risk_state} size="sm" />
                <span className="text-xs font-mono-tech opacity-90">
                  Panel: <strong>{activeAlert.panel_id}</strong> &bull; Triggered: {new Date(activeAlert.triggered_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm font-bold tracking-tight">{activeAlert.title}</div>
              <p className="text-xs opacity-90 mt-0.5 line-clamp-2 max-w-4xl font-sans">
                {activeAlert.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              size="sm"
              onClick={() => {
                setSelectedAlertForAck(activeAlert);
                setIsAckModalOpen(true);
              }}
              className="font-semibold text-xs h-8 px-3 bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] rounded-sm"
            >
              Sign Off (CMR 112)
            </Button>
            <Link href="/alerts">
              <Button size="sm" variant="outline" className="text-xs h-8 px-3 border-[#D7DEDC] bg-[#FFFFFF] text-[#1D2933] hover:bg-[#EDF1F0]">
                Incident Log &rarr;
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Central Operational Split View: GIS Surveillance (65%) + Evidence Dossier (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: GIS Underground Surveillance Canvas (7 Cols / ~60%) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden flex flex-col shadow-xs">
          <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#173B57]" />
              <span className="text-xs font-semibold text-[#173B57] font-mono-tech uppercase tracking-wide">
                Underground GIS &bull; Panel Layout
              </span>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5 text-xs font-mono-tech">
              <button
                type="button"
                onClick={() => toggleLayer('panels')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer transition-colors ${
                  activeLayers.panels ? 'bg-[#173B57] text-[#FFFFFF] border-[#173B57]' : 'border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D]'
                }`}
              >
                Panels
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('nodes')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer transition-colors ${
                  activeLayers.nodes ? 'bg-[#173B57] text-[#FFFFFF] border-[#173B57]' : 'border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D]'
                }`}
              >
                Stations
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('infrastructure')}
                className={`px-2 py-0.5 rounded-sm border cursor-pointer transition-colors ${
                  activeLayers.infrastructure ? 'bg-[#173B57] text-[#FFFFFF] border-[#173B57]' : 'border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D]'
                }`}
              >
                Railway
              </button>
              <Link href="/gis" className="text-[#74808A] hover:text-[#173B57] ml-1" title="Open Full Screen GIS">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Map Surface */}
          <div className="p-2 flex-1 flex flex-col justify-center min-h-100">
            <GisMapCanvas
              activeLayers={activeLayers}
              selectedNodeCode={selectedNodeCode}
              selectedEventId={selectedEventId}
              onSelectNode={(code) => setSelectedNodeCode(code)}
              onSelectEvent={(id) => setSelectedEventId(id)}
              liveRiskByNode={liveRiskByNode}
              className="w-full h-full min-h-95"
            />
          </div>

          <div className="px-4 py-2 border-t border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between text-xs font-mono-tech text-[#52606D]">
            <span>Selected Station: <strong className="text-[#1D2933]">{selectedNodeCode ?? 'None'}</strong></span>
            <span>Projection: WGS84 &bull; Scale: 1:5000</span>
          </div>
        </div>

        {/* Right: Explainable Risk Assessment & Evidence Dossier (5 Cols / ~40%) */}
        <div className="lg:col-span-5 space-y-4">
          <RiskEvidencePanel
            riskState={currentRiskState}
            evidence={currentEvidence}
            activeAnomalies={activeAnomalies}
            className="shadow-xs"
          />

          {/* Statutory Inspection Directive */}
          <div className="p-3.5 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs space-y-2 shadow-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-[#173B57]" />
              Statutory Shift Directive
            </div>
            <p className="text-xs text-[#1D2933] leading-relaxed">
              {currentRiskState === 'Critical' || currentRiskState === 'Warning'
                ? 'Immediate withdrawal of extraction crew from Panel P-101. Verify hydraulic sand stowing pressure line and inspect railway siding 45m reserve perimeter.'
                : currentRiskState === 'Watch'
                ? 'Heighten borehole extensometer surveillance. Verify sensor calibration baseline across adjacent stations.'
                : 'Maintain standard 30-second polling. Strata deformation gradient nominal across all panels.'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#D7DEDC] text-xs font-mono-tech text-[#52606D]">
              <span>DGMS-SOP-{currentRiskState.toUpperCase()}</span>
              <Link href="/analytics" className="text-[#173B57] font-semibold hover:underline flex items-center gap-0.5">
                Full Analytics <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Station Fleet Telemetry & Transducer Status Table (Full Width) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[#173B57] tracking-tight">
              Station Fleet Telemetry & Transducer Status
            </h2>
            <p className="text-xs text-[#52606D]">
              Real-time multi-channel sensor readings across Bhowra-West monitoring network (16 Stations, 80 Transducers)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sensors">
              <Button size="sm" variant="outline" className="h-7 text-xs border-[#D7DEDC] bg-[#FFFFFF] text-[#1D2933] hover:bg-[#EDF1F0]">
                All Transducers Matrix &rarr;
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-industrial">
            <thead>
              <tr>
                <th>Station ID</th>
                <th>Panel</th>
                <th>Displacement (Z)</th>
                <th>Biaxial Tilt (X)</th>
                <th>Biaxial Tilt (Y)</th>
                <th>Vibration RMS</th>
                <th>Battery</th>
                <th>Condition</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_NODES.map((node) => {
                const disp = latestReadings[`${node.node_code}-DISP_Z`]?.value ?? 18.5;
                const tiltX = latestReadings[`${node.node_code}-TILT_X`]?.value ?? 12.4;
                const tiltY = latestReadings[`${node.node_code}-TILT_Y`]?.value ?? -8.1;
                const vib = latestReadings[`${node.node_code}-VIB_RMS`]?.value ?? 3.2;
                const health = latestHealths[node.node_code];
                const nodeRisk = liveRiskByNode[node.node_code] ?? 'Normal';
                const isSelected = selectedNodeCode === node.node_code;

                return (
                  <tr
                    key={node.id}
                    onClick={() => setSelectedNodeCode(node.node_code)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#EDF1F0]/80 font-medium' : ''
                    }`}
                  >
                    <td className="font-mono-tech font-bold text-[#173B57]">
                      {node.node_code}
                    </td>
                    <td className="text-xs text-[#52606D] font-mono-tech">
                      {node.panel?.code || node.panel_id}
                    </td>
                    <td className="font-mono-tech">
                      <span className={disp > 30.0 ? 'text-[#B42318] font-bold' : 'text-[#1D2933]'}>
                        {disp.toFixed(2)} mm
                      </span>
                    </td>
                    <td className="font-mono-tech text-[#1D2933]">
                      {tiltX.toFixed(2)} arcsec
                    </td>
                    <td className="font-mono-tech text-[#1D2933]">
                      {tiltY.toFixed(2)} arcsec
                    </td>
                    <td className="font-mono-tech text-[#1D2933]">
                      {vib.toFixed(2)} mm/s
                    </td>
                    <td className="font-mono-tech text-xs">
                      <span className={health?.batteryPct && health.batteryPct < 25 ? 'text-[#B42318] font-bold' : 'text-[#52606D]'}>
                        {health?.batteryPct ? `${health.batteryPct}%` : '95%'}
                      </span>
                    </td>
                    <td>
                      <RiskBadge state={nodeRisk} size="sm" showIcon={false} />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeCode(node.node_code);
                        }}
                        className="text-xs text-[#173B57] font-semibold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Acknowledgment Modal */}
      <AcknowledgeModal
        alert={selectedAlertForAck}
        isOpen={isAckModalOpen}
        onClose={() => {
          setIsAckModalOpen(false);
          setSelectedAlertForAck(null);
        }}
        onConfirm={handleAcknowledgeConfirm}
      />
    </div>
  );
}
