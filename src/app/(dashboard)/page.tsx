'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Alert } from '@/lib/domain/types';
import { AcknowledgementPayload } from '@/lib/alerts/alert-types';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { GisLayerId } from '@/lib/domain/gis-types';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskEvidencePanel } from '@/components/industrial/risk-evidence-panel';
import { GisMapCanvas } from '@/components/gis/gis-map-canvas';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { role, profile } = useAuth();
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

  // Primary active alert requiring operator attention
  const activeAlert = useMemo(() => {
    return alerts.find((a) => a.status === 'active' || a.status === 'escalated') || null;
  }, [alerts]);

  // Transducer sensor values for primary station
  const tiltVal = latestReadings['SN-102-TILT_X']?.value ?? 12.4;
  const dispVal = latestReadings['SN-102-DISP_Z']?.value ?? 18.5;
  const vibVal = latestReadings['SN-101-VIB_RMS']?.value ?? 3.2;

  // Fleet Health Aggregations
  const healthValues = Object.values(latestHealths);
  const offlineNodes = healthValues.filter((h) => h.status === 'offline').length;
  const degradedNodes = healthValues.filter((h) => h.status === 'degraded').length;
  const onlineNodes = Math.max(16 - offlineNodes - degradedNodes, 0);
  const avgBattery = healthValues.length > 0
    ? (healthValues.reduce((acc, h) => acc + h.batteryPct, 0) / healthValues.length).toFixed(1)
    : '94.2';
  const avgRssi = healthValues.length > 0
    ? Math.round(healthValues.reduce((acc, h) => acc + h.signalRssiDbm, 0) / healthValues.length)
    : -84;

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
      {/* Simulation Active Notification Strip */}
      {isSimActive && (
        <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="font-semibold font-mono">DETERMINISTIC SIMULATION ACTIVE:</span>
            <span>Scenario: {simState.scenarioId} &bull; Seed: {simState.seed} &bull; Speed: {simState.speed}x</span>
          </div>
          <Link href="/simulator" className="font-semibold underline text-amber-800 dark:text-amber-300 shrink-0 font-mono">
            Workbench Controls &rarr;
          </Link>
        </div>
      )}

      {/* Top Operations Command Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Colliery Operations Command Surface
            </span>
            <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded-xs font-mono">
              DGMS CMR 2017 REG. 112 ACTIVE
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            Bhowra-West Colliery &bull; Underground Subsidence Surveillance
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Jharia Coalfield &bull; Seam VII/VIII (185m–265m depth) &bull; Bord &amp; Pillar Depillaring with Hydraulic Stowing
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-mono uppercase">On-Duty Persona</div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{role} ({profile?.full_name?.split(' ')[0] ?? 'Operator'})</div>
          </div>
          <RiskBadge state={currentRiskState} size="lg" />
        </div>
      </div>

      {/* Immediate Incident Warning Callout OR Statutory Compliance Nominal State */}
      {activeAlert ? (
        <div
          className={`p-3.5 rounded-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            activeAlert.severity === 'critical'
              ? 'border-rose-400 bg-rose-50/90 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100'
              : activeAlert.severity === 'high'
              ? 'border-orange-400 bg-orange-50/90 dark:bg-orange-950/30 text-orange-950 dark:text-orange-100'
              : 'border-amber-400 bg-amber-50/90 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-xs mt-0.5 text-white shrink-0 ${
              activeAlert.severity === 'critical' ? 'bg-rose-600 animate-pulse' : 'bg-orange-600'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-mono font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-black/10 rounded-xs">
                  ACTIVE {activeAlert.severity.toUpperCase()} ALERT
                </span>
                <RiskBadge state={activeAlert.risk_state} size="sm" />
                <span className="text-xs font-mono opacity-80">
                  Panel: <strong>{activeAlert.panel_id}</strong> &bull; Triggered: {new Date(activeAlert.triggered_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs font-bold">{activeAlert.title}</div>
              <p className="text-xs opacity-90 mt-0.5 line-clamp-2 max-w-4xl">
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
              className={`font-semibold text-xs h-7 text-white shadow-none ${
                activeAlert.severity === 'critical'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              Sign Off (CMR 112)
            </Button>
            <Link href="/alerts">
              <Button size="sm" variant="outline" className="text-xs h-7">
                Alert Center &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-sm flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold font-mono">STATUTORY MONITORING NOMINAL:</span>
            <span>All 16 strata monitoring stations reporting within baseline tolerances. 0 active DGMS evacuation directives.</span>
          </div>
          <Link href="/alerts" className="font-semibold underline text-emerald-700 dark:text-emerald-400 font-mono">
            Incident Queue &rarr;
          </Link>
        </div>
      )}

      {/* Central Viewport Workspace: Underground GIS (Left) + Explainable Evidence Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 Cols): Interactive Spatial Surveillance Map */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wide">
                Underground GIS &bull; Panel Layout
              </span>
            </div>

            {/* Quick Layer Controls HUD */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => toggleLayer('panels')}
                className={`px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                  activeLayers.panels ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent' : 'border-slate-300 text-slate-500'
                }`}
              >
                Panels
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('nodes')}
                className={`px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                  activeLayers.nodes ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent' : 'border-slate-300 text-slate-500'
                }`}
              >
                Nodes
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('infrastructure')}
                className={`px-1.5 py-0.5 rounded-xs border cursor-pointer ${
                  activeLayers.infrastructure ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent' : 'border-slate-300 text-slate-500'
                }`}
              >
                Railway
              </button>
              <Link href="/gis" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1">
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Map Surface */}
          <div className="p-2 flex-1 flex flex-col justify-center min-h-[380px]">
            <GisMapCanvas
              activeLayers={activeLayers}
              selectedNodeCode={selectedNodeCode}
              selectedEventId={selectedEventId}
              onSelectNode={(code) => setSelectedNodeCode(code)}
              onSelectEvent={(id) => setSelectedEventId(id)}
              liveRiskByNode={liveRiskByNode}
              className="w-full h-full min-h-[360px]"
            />
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Selected Station: <strong className="text-slate-800 dark:text-slate-200">{selectedNodeCode ?? 'None'}</strong></span>
            <span>Projection: WGS84 &bull; Scale: 1:5000</span>
          </div>
        </div>

        {/* Right (5 Cols): "Why This Risk Changed" Evidence Dossier */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <RiskEvidencePanel
            riskState={currentRiskState}
            evidence={currentEvidence}
            activeAnomalies={activeAnomalies}
            className="flex-1 shadow-none"
          />

          {/* Action Directive Callout */}
          <div className="p-3 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Statutory Inspection Directive
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              {currentRiskState === 'Critical' || currentRiskState === 'Warning'
                ? 'Immediate withdrawal of depillaring crew from affected extraction panel. Verify hydraulic sand stowing line pressure and inspect railway surface siding buffer.'
                : currentRiskState === 'Watch'
                ? 'Heighten acoustic microseismic surveillance. Verify zero offset drift on borehole extensometers across Panel P-101.'
                : 'Maintain routine 30-second telemetry polling interval. All subsidence velocity rates nominal.'}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500">
              <span>Directive Code: DGMS-SOP-{currentRiskState.toUpperCase()}</span>
              <Link href="/analytics" className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5">
                Full Analytics <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Telemetry & Fleet Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>BIAXIAL TILT (X)</span>
            <span className="text-[10px]">TILT_X</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {tiltVal.toFixed(2)} <span className="text-xs font-normal text-slate-500">arcsec</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Nominal: &plusmn;150</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Rate:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {isSimActive ? '+0.80 arcsec/min' : '0.05 arcsec/min'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>SURFACE DISPLACEMENT</span>
            <span className="text-[10px]">DISP_Z</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {dispVal.toFixed(2)} <span className="text-xs font-normal text-slate-500">mm</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Limit: 30 mm</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Rate:</span>
            <span className={dispVal > 30 ? 'text-rose-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}>
              {isSimActive ? '+0.35 mm/min' : '0.02 mm/min'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>VIBRATION VELOCITY</span>
            <span className="text-[10px]">VIB_RMS</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {vibVal.toFixed(2)} <span className="text-xs font-normal text-slate-500">mm/s</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PPV Limit: 5.0</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Rate:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {isSimActive ? '-0.40 mm/s/min' : '0.01 mm/s/min'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>FLEET LINK BUDGET</span>
            <span className="text-[10px]">ESP32 LoRa</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {onlineNodes}/16 <span className="text-xs font-normal text-slate-500">Online</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Mean: {avgRssi} dBm</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Mean Battery:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {avgBattery}%
            </span>
          </div>
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
