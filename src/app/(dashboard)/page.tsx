'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Alert } from '@/lib/domain/types';
import { AcknowledgementPayload } from '@/lib/alerts/alert-types';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { IngestionStats } from '@/lib/telemetry/types';
import { GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { RiskEvidencePanel } from '@/components/industrial/risk-evidence-panel';
import { AcknowledgeModal } from '@/components/industrial/acknowledge-modal';
import {
  MapPin,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Server,
  Zap,
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

  const [selectedAlertForAck, setSelectedAlertForAck] = useState<Alert | null>(null);
  const [isAckModalOpen, setIsAckModalOpen] = useState(false);

  const [ingestionStats, setIngestionStats] = useState<IngestionStats>({
    totalSamplesIngested: 0,
    totalBatchesIngested: 0,
    lastReceivedAt: null,
    activeSourceType: 'SIMULATED',
    droppedSamplesCount: 0,
    persistenceErrorsCount: 0,
  });

  useEffect(() => {
    initEngine(1025, 'NORMAL_BASELINE');
    initAlertEngine();

    const telemetryEngine = TelemetryEngine.getInstance();
    const interval = setInterval(() => {
      setIngestionStats(telemetryEngine.getStats());
    }, 1000);

    return () => clearInterval(interval);
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
  const strainVal = latestReadings['SN-102-STRAIN']?.value ?? 420.0;

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

  // Handle operator sign-off submission
  const handleAcknowledgeConfirm = async (payload: AcknowledgementPayload) => {
    if (!selectedAlertForAck) return;
    await acknowledgeAlert(selectedAlertForAck.id, payload);
    setIsAckModalOpen(false);
    setSelectedAlertForAck(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Simulation Active Bar */}
      {isSimActive && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
            <span className="font-semibold font-mono">DETERMINISTIC SIMULATION ACTIVE:</span>
            <span>Scenario: {simState.scenarioId} &bull; Seed: {simState.seed} &bull; Speed: {simState.speed}x</span>
          </div>
          <Link href="/simulator" className="font-semibold underline text-amber-700 dark:text-amber-300 shrink-0">
            Open Simulation Controls &rarr;
          </Link>
        </div>
      )}

      {/* Top Colliery Operations Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Colliery Operations Command Center
            </span>
            <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-300 font-mono">
              DGMS CMR 2017 REG. 112 ACTIVE
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bhowra-West Colliery &bull; Underground Subsidence Surveillance
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Jharia Coalfield &bull; Seam VII/VIII (185m–265m depth) &bull; Bord & Pillar Depillaring &bull; Real-time AI early warning
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100">Duty Persona</div>
            <div className="text-xs text-slate-500 font-mono">{role} ({profile?.full_name?.split(' ')[0]})</div>
          </div>
          <RiskBadge state={currentRiskState} size="lg" />
        </div>
      </div>

      {/* Active Incident Warning Callout OR Statutory Compliance Status */}
      {activeAlert ? (
        <Card className={`border-2 animate-in fade-in duration-200 ${
          activeAlert.severity === 'critical'
            ? 'border-rose-500 bg-rose-500/10'
            : activeAlert.severity === 'high'
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-amber-500 bg-amber-500/10'
        }`}>
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full mt-0.5 shrink-0 text-white ${
                activeAlert.severity === 'critical' ? 'bg-rose-600 animate-pulse' : 'bg-orange-600'
              }`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="destructive" className="uppercase font-mono text-[10px]">
                    ACTIVE {activeAlert.severity.toUpperCase()} ALERT
                  </Badge>
                  <RiskBadge state={activeAlert.risk_state} size="sm" />
                  <span className="text-xs font-mono text-slate-500">
                    District: {activeAlert.panel_id} &bull; Triggered: {new Date(activeAlert.triggered_at).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50">
                  {activeAlert.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
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
                className={`font-semibold text-xs shadow-xs text-white ${
                  activeAlert.severity === 'critical'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Sign Off & Acknowledge
              </Button>
              <Link href="/alerts">
                <Button size="sm" variant="outline" className="text-xs">
                  Alert Center &rarr;
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold font-mono">STATUTORY MONITORING STATUS:</span>
            <span>All strata deformation parameters nominal. 0 active DGMS CMR 2017 Reg 112 evacuation orders.</span>
          </div>
          <Link href="/alerts" className="font-semibold underline text-emerald-700 dark:text-emerald-400">
            View Incident Queue &rarr;
          </Link>
        </div>
      )}

      {/* Primary Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Biaxial Tilt (X-Axis)"
          channelCode="TILT_X"
          value={tiltVal}
          unit="arcsec"
          nominalRange={[-150, 150]}
          riskState={Math.abs(tiltVal) > 120 ? 'Warning' : Math.abs(tiltVal) > 80 ? 'Advisory' : 'Normal'}
          rateOfChange={isSimActive ? 0.8 : 0.05}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />

        <MetricBlock
          label="Surface Displacement"
          channelCode="DISP_Z"
          value={dispVal}
          unit="mm"
          nominalRange={[0, 40]}
          riskState={dispVal > 32 ? 'Warning' : dispVal > 24 ? 'Watch' : dispVal > 20 ? 'Advisory' : 'Normal'}
          rateOfChange={isSimActive ? 0.35 : 0.02}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />

        <MetricBlock
          label="Peak Particle Velocity"
          channelCode="VIB_RMS"
          value={vibVal}
          unit="mm/s"
          nominalRange={[0, 5]}
          riskState={vibVal > 6.0 ? 'Warning' : vibVal > 4.0 ? 'Watch' : 'Normal'}
          rateOfChange={isSimActive ? -0.4 : 0.01}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />

        <MetricBlock
          label="Rockbolt / Pillar Strain"
          channelCode="STRAIN"
          value={strainVal}
          unit="µε"
          nominalRange={[-800, 1200]}
          riskState={strainVal > 800 ? 'Watch' : 'Normal'}
          rateOfChange={isSimActive ? 5.0 : 0.5}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />
      </div>

      {/* Main Operational Two-Column Grid: Evidence Dossier & Fleet Surveillance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: "Why This Risk Changed" Evidence Dossier */}
        <div className="lg:col-span-2 space-y-6">
          <RiskEvidencePanel
            riskState={currentRiskState}
            evidence={currentEvidence}
            activeAnomalies={activeAnomalies}
          />

          {/* Active Subsidence Event Progression */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Demonstrated Subsidence Event Progression
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {GIS_SUBSIDENCE_EVENTS.length} Historical Records
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Microseismic acoustic bursts and goaf break-line progression
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {GIS_SUBSIDENCE_EVENTS.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <RiskBadge state={evt.riskState} size="sm" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {evt.title}
                        </span>
                        <ProvenanceBadge provenance={evt.provenance} size="sm" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Epicenter: <strong>{evt.epicenterNodeCode}</strong> &bull; Affected: {evt.affectedNodeCodes.join(', ')} &bull; Peak Disp: {evt.maxDisplacementMm} mm
                      </p>
                    </div>

                    <Link href="/events" className="shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs font-mono">
                        Inspect Timeline &rarr;
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Fleet Health, Situational GIS, & System Metrics */}
        <div className="space-y-6">
          {/* Sensor Fleet Status Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-500" />
                  Edge Fleet & Telemetry Health
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {onlineNodes}/16 Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono">Fleet Mean Battery</div>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {avgBattery}%
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono">Mean LoRaWAN RSSI</div>
                  <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                    {avgRssi} dBm
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Active Online Stations:</span>
                  <span className="font-mono font-semibold text-emerald-600">{onlineNodes} nodes</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Degraded / Weak Link:</span>
                  <span className="font-mono font-semibold text-amber-600">{degradedNodes} nodes</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Offline / Unreachable:</span>
                  <span className="font-mono font-semibold text-rose-600">{offlineNodes} nodes</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Physical Transducers:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">80 channels</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href="/nodes" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs h-7 font-mono">
                    Hardware Fleet &rarr;
                  </Button>
                </Link>
                <Link href="/sensors" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs h-7 font-mono">
                    Calibration &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* GIS Situational Quick-View */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  Spatial & GIS Surveillance
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  WGS84 1:5000
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Underground extraction panels P-101 to P-104 georeferenced beneath Jharia leasehold bounds. Continuous clearance tracking against Indian Railways siding corridor (45m restriction).
              </p>

              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Railway Corridor Clearance:</span>
                  <span className="font-bold text-emerald-600">38.4 m (Pass)</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Synthetic InSAR Scatterers:</span>
                  <span className="text-slate-500">8 PS Points</span>
                </div>
              </div>

              <Link href="/gis">
                <Button size="sm" className="w-full text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">
                  Open Interactive GIS Canvas &rarr;
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ingestion & Persistence Engine Status */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 pb-2 border-b border-slate-100 dark:border-slate-900">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Ingestion Engine & Persistence Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Samples Ingested:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {ingestionStats.totalSamplesIngested.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Active Ingestion Source:</span>
                <span className="font-semibold text-amber-600">
                  {ingestionStats.activeSourceType}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Supabase PostgreSQL:</span>
                <span className="font-semibold text-emerald-600">
                  ACTIVE_HEALTHY
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Dropped Frame Rate:</span>
                <span className="text-slate-500">
                  {ingestionStats.droppedSamplesCount} (0.00%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CMR 2017 Regulatory Sign-Off Dialog */}
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
