'use client';

import React, { useEffect, useState } from 'react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { SCENARIO_DEFINITIONS, SimulationScenarioId } from '@/lib/simulator/scenario-definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { DEMO_NODES } from '@/lib/data/mock-data';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Cpu,
  Layers,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export default function SimulatorPage() {
  const {
    state,
    latestReadings,
    historyByChannel,
    initEngine,
    start,
    pause,
    resume,
    reset,
    setSpeed,
    setScenario,
    setSeed,
    setAffectedNodes,
  } = useSimulatorStore();

  const [seedInput, setSeedInput] = useState<string>(state.seed.toString());
  const [copiedSeed, setCopiedSeed] = useState(false);

  useEffect(() => {
    initEngine(1025, 'NORMAL_BASELINE');
  }, [initEngine]);

  const activeDef = SCENARIO_DEFINITIONS[state.scenarioId];

  const handleApplySeed = () => {
    const s = parseInt(seedInput, 10);
    if (!Number.isNaN(s)) {
      setSeed(s);
    }
  };

  const handleRandomizeSeed = () => {
    const rand = Math.floor(Math.random() * 90000) + 10000;
    setSeedInput(rand.toString());
    setSeed(rand);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(state.seed.toString());
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const toggleNodeAffected = (nodeCode: string) => {
    if (state.affectedNodeCodes.includes(nodeCode)) {
      setAffectedNodes(state.affectedNodeCodes.filter((c) => c !== nodeCode));
    } else {
      setAffectedNodes([...state.affectedNodeCodes, nodeCode]);
    }
  };

  const selectPanelNodes = (panelId: string) => {
    const nodes = DEMO_NODES.filter((n) => n.panel_id === panelId).map((n) => n.node_code);
    setAffectedNodes(nodes);
  };

  // Format elapsed time (mm:ss)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Read latest primary telemetry values
  const dispVal = latestReadings['SN-102-DISP_Z']?.value ?? 18.5;
  const tiltVal = latestReadings['SN-102-TILT_X']?.value ?? 12.4;
  const vibVal = latestReadings['SN-101-VIB_RMS']?.value ?? 1.2;
  const strainVal = latestReadings['SN-102-STRAIN']?.value ?? 420.0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Simulation Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              MINE-EVENT SIMULATION & SCENARIO CONTROL STATION
            </span>
            <ProvenanceBadge provenance="SIMULATED" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Deterministic Geotechnical Event Simulator
          </h1>
          <p className="text-xs text-slate-500">
            Seed-reproducible multi-station telemetry generator with mathematical physics modeling across 16 ESP32 nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`font-mono text-xs px-2.5 py-1 ${
              state.status === 'running'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse'
                : state.status === 'paused'
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-300'
            }`}
          >
            STATUS: {state.status.toUpperCase()} &bull; {formatTime(state.elapsedSec)} / {formatTime(activeDef.durationSeconds)}
          </Badge>
          <RiskBadge state={state.currentRiskState} size="md" />
        </div>
      </div>

      {/* Main Playback & Seed Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
          {/* Controls */}
          <div className="flex items-center gap-2">
            {state.status === 'running' ? (
              <Button
                size="sm"
                onClick={pause}
                className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5 mr-1" />
                Pause
              </Button>
            ) : state.status === 'paused' ? (
              <Button
                size="sm"
                onClick={resume}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                Resume
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={start}
                className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                Start Simulation
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              className="text-xs h-8 border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center">
                <FastForward className="h-3 w-3 mr-0.5" /> Speed:
              </span>
              {[1, 2, 5, 10, 30].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={state.speed === s ? 'default' : 'ghost'}
                  onClick={() => setSpeed(s)}
                  className={`text-[11px] h-6 px-1.5 font-mono ${
                    state.speed === s
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>

          {/* Seed Input & Reproducibility */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">PRNG Seed:</span>
            <Input
              type="number"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="w-24 text-xs h-7 font-mono bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplySeed}
              className="text-[11px] h-7 px-2 font-mono"
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRandomizeSeed}
              className="text-[11px] h-7 px-2 font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              title="Generate new random seed"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              New Seed
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopySeed}
              className="text-[11px] h-7 px-2 font-mono text-slate-500"
              title="Copy seed to clipboard"
            >
              {copiedSeed ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Readouts Metrics Row (Dynamic with Simulator Ticks) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Surface Displacement"
          channelCode="DISP_Z"
          value={dispVal}
          unit="mm"
          nominalRange={[0, 40]}
          riskState={dispVal > 32 ? 'Warning' : dispVal > 24 ? 'Watch' : dispVal > 20 ? 'Advisory' : 'Normal'}
          rateOfChange={state.status === 'running' && state.scenarioId.includes('DEFORMATION') ? 0.35 : 0.05}
          provenance="SIMULATED"
        />
        <MetricBlock
          label="Biaxial Tilt (X-Axis)"
          channelCode="TILT_X"
          value={tiltVal}
          unit="arcsec"
          nominalRange={[-150, 150]}
          riskState={Math.abs(tiltVal) > 120 ? 'Warning' : Math.abs(tiltVal) > 80 ? 'Advisory' : 'Normal'}
          rateOfChange={state.status === 'running' && state.scenarioId === 'SENSOR_DRIFT' ? 0.08 : 0.02}
          provenance="SIMULATED"
        />
        <MetricBlock
          label="Peak Particle Velocity"
          channelCode="VIB_RMS"
          value={vibVal}
          unit="mm/s"
          nominalRange={[0, 5]}
          riskState={vibVal > 6.0 ? 'Warning' : vibVal > 4.0 ? 'Watch' : 'Normal'}
          rateOfChange={state.status === 'running' && state.scenarioId === 'MACHINERY_TRANSIENT' ? 1.4 : -0.1}
          provenance="SIMULATED"
        />
        <MetricBlock
          label="Rockbolt / Pillar Strain"
          channelCode="STRAIN"
          value={strainVal}
          unit="microstrain"
          nominalRange={[-800, 1200]}
          riskState={strainVal > 800 ? 'Watch' : 'Normal'}
          rateOfChange={state.status === 'running' && state.scenarioId === 'CRACK_PROGRESS' ? 18.0 : 0.5}
          provenance="SIMULATED"
        />
      </div>

      {/* Real-time Waveform Stream (Live SVG Line Charts) */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Real-Time Dynamic Waveform Streams (Rolling 60-Second Window)
            </CardTitle>
            <CardDescription className="text-xs">
              Primary sensor node telemetry plotted continuously as simulation ticks progress
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {historyByChannel.DISP_Z?.length ?? 0} Ticks Buffered
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Displacement Waveform */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  Displacement (DISP_Z &bull; mm)
                </span>
                <span className="font-mono font-bold text-blue-600">{dispVal.toFixed(2)} mm</span>
              </div>
              {/* SVG Sparkline */}
              <div className="h-28 w-full relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  {/* DGMS Warning Line (30mm) */}
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="2" y="47" fill="#f59e0b" fontSize="7" fontFamily="monospace">DGMS WARNING (30mm)</text>

                  {/* History Polyline */}
                  {historyByChannel.DISP_Z && historyByChannel.DISP_Z.length > 1 ? (
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      points={historyByChannel.DISP_Z.map((pt, idx) => {
                        const x = (idx / Math.max(historyByChannel.DISP_Z.length - 1, 1)) * 300;
                        // Map 0mm -> y=95, 55mm -> y=5
                        const y = Math.max(Math.min(95 - (pt.value / 55) * 90, 95), 5);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  ) : (
                    <line x1="0" y1="65" x2="300" y2="65" stroke="#2563eb" strokeWidth="1.5" />
                  )}
                </svg>
              </div>
            </div>

            {/* Microseismic PPV Waveform */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  Microseismic Vibration (VIB_RMS &bull; mm/s)
                </span>
                <span className="font-mono font-bold text-amber-600">{vibVal.toFixed(2)} mm/s</span>
              </div>
              <div className="h-28 w-full relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="2" y="37" fill="#ef4444" fontSize="7" fontFamily="monospace">VIB THRESHOLD (5.0mm/s)</text>

                  {historyByChannel.VIB_RMS && historyByChannel.VIB_RMS.length > 1 ? (
                    <polyline
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                      points={historyByChannel.VIB_RMS.map((pt, idx) => {
                        const x = (idx / Math.max(historyByChannel.VIB_RMS.length - 1, 1)) * 300;
                        // Map 0mm/s -> y=90, 10mm/s -> y=10
                        const y = Math.max(Math.min(90 - (pt.value / 10) * 80, 90), 10);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  ) : (
                    <line x1="0" y1="80" x2="300" y2="80" stroke="#d97706" strokeWidth="1.5" />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection Matrix (All 9 Required Scenarios) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-500" />
              Scenario Selection Matrix (9 Geotechnical Patterns)
            </h2>
            <p className="text-xs text-slate-500">
              Select a scenario to inspect its deterministic physical sequence, mathematical formulations, and DGMS criteria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(SCENARIO_DEFINITIONS) as SimulationScenarioId[]).map((scId) => {
            const def = SCENARIO_DEFINITIONS[scId];
            const isSelected = state.scenarioId === scId;

            return (
              <Card
                key={scId}
                onClick={() => setScenario(scId)}
                className={`cursor-pointer transition-all border text-xs p-3 hover:border-slate-400 ${
                  isSelected
                    ? 'border-slate-900 dark:border-slate-100 bg-slate-50/80 dark:bg-slate-900/80 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    {def.name}
                  </span>
                  <RiskBadge state={def.expectedMaxRisk} size="sm" showLevel={false} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2 mb-2">
                  {def.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Duration: {def.durationSeconds}s</span>
                  <span className="text-emerald-600 font-medium">
                    {isSelected ? '&bull; LOADED' : 'Click to Load'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Geotechnical Context & Affected Nodes Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geotechnical Detail (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 h-full">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 font-mono">
                  <Info className="h-4 w-4 text-blue-600" />
                  {activeDef.name} &bull; Geotechnical Mechanism
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Category: {activeDef.category.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
                {activeDef.geotechnicalContext}
              </p>

              {activeDef.dgmsReference && (
                <div className="p-2.5 rounded bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 text-[11px]">
                  <strong>DGMS Standard:</strong> {activeDef.dgmsReference}
                </div>
              )}

              {activeDef.expectedAnomalies.length > 0 && (
                <div className="space-y-1 pt-1">
                  <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Expected Anomaly Injections
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDef.expectedAnomalies.map((anom) => (
                      <Badge key={anom} variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-mono">
                        {anom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Affected Nodes Checklist (1 col) */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5 font-mono">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                  Target Fleet Nodes ({state.affectedNodeCodes.length}/16)
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => selectPanelNodes('p-101')}
                    className="text-[10px] h-6 px-1.5 font-mono"
                  >
                    P-101
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setAffectedNodes([])}
                    className="text-[10px] h-6 px-1.5 font-mono text-slate-400"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto max-h-60">
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {DEMO_NODES.map((node) => {
                  const isChecked = state.affectedNodeCodes.includes(node.node_code);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => toggleNodeAffected(node.node_code)}
                      className={`p-1.5 rounded border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{node.node_code}</span>
                      {isChecked && <CheckCircle2 className="h-3 w-3 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
