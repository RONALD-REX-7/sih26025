'use client';

import React, { useEffect, useState } from 'react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { SCENARIO_DEFINITIONS, SimulationScenarioId } from '@/lib/simulator/scenario-definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { DEMO_NODES } from '@/lib/data/mock-data';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

export default function SimulatorPage() {
  const {
    state,
    latestReadings,
    currentRiskState,
    currentEvidence,
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

  // Channel readouts for primary station
  const tiltVal = latestReadings['SN-102-TILT_X']?.value ?? 12.4;
  const dispVal = latestReadings['SN-102-DISP_Z']?.value ?? 18.5;
  const vibVal = latestReadings['SN-101-VIB_RMS']?.value ?? 1.2;
  const strainVal = latestReadings['SN-102-STRAIN']?.value ?? 420.0;

  // Progression progress percentage
  const progressPct = Math.min(
    Math.round((state.elapsedSec / Math.max(activeDef.durationSeconds, 1)) * 100),
    100
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Workbench Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Engineering Test Station &bull; Geotechnical Simulation
            </span>
            <ProvenanceBadge provenance="SIMULATED" size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mulberry32 Deterministic Telemetry Test Bench
          </h1>
          <p className="text-xs text-slate-500">
            Seed-reproducible multi-station synthetic generator for calibrating DGMS CMR 2017 Reg. 112 early warning algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right font-mono text-xs">
            <div className="text-[10px] text-slate-400 uppercase">Elapsed / Duration</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {formatTime(state.elapsedSec)} / {formatTime(activeDef.durationSeconds)}
            </div>
          </div>
          <RiskBadge state={currentRiskState} size="md" />
        </div>
      </div>

      {/* Main Bench Grid: Scenario & Controls (Left) + Telemetry & Progression (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Scenario Selector & Execution Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Controls Console */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3.5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
              <span>Workbench Controls</span>
              <span className={`px-1.5 py-0.2 rounded-xs text-[10px] ${
                state.status === 'running'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : state.status === 'paused'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {state.status.toUpperCase()}
              </span>
            </div>

            {/* Playback Action Buttons */}
            <div className="flex items-center gap-2">
              {state.status === 'running' ? (
                <Button
                  size="sm"
                  onClick={pause}
                  className="flex-1 text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-mono cursor-pointer"
                >
                  <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                </Button>
              ) : state.status === 'paused' ? (
                <Button
                  size="sm"
                  onClick={resume}
                  className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-mono cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 mr-1" /> Resume
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={start}
                  className="flex-1 text-xs h-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-mono cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 mr-1" /> Start Simulation
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={reset}
                className="text-xs h-8 font-mono border-slate-300 dark:border-slate-700"
                title="Reset simulation to tick 0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            </div>

            {/* Speed Multiplier */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Clock Speed</div>
              <div className="grid grid-cols-4 gap-1.5">
                {([1, 2, 5, 10] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`py-1 text-xs font-mono rounded-xs border cursor-pointer ${
                      state.speed === spd
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Seed Configuration */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                <span>Mulberry32 PRNG Seed</span>
                <span>Active: {state.seed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="h-7 text-xs font-mono"
                  placeholder="Integer seed"
                />
                <Button size="sm" variant="outline" onClick={handleApplySeed} className="h-7 text-xs px-2 font-mono">
                  Apply
                </Button>
                <Button size="sm" variant="ghost" onClick={handleRandomizeSeed} className="h-7 text-xs px-2 font-mono" title="Randomize seed">
                  Rand
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCopySeed} className="h-7 px-2 font-mono text-xs">
                  {copiedSeed ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Scenario Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3.5 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Geotechnical Failure Scenarios (9 Pre-Calibrated)
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {Object.values(SCENARIO_DEFINITIONS).map((def) => {
                const isSelected = def.id === state.scenarioId;
                return (
                  <div
                    key={def.id}
                    onClick={() => setScenario(def.id as SimulationScenarioId)}
                    className={`p-2.5 rounded-sm border cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{def.name}</span>
                      <span className="text-[10px] text-slate-400">{def.durationSeconds}s</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {def.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Telemetry, Progression, & Real-time Evidence */}
        <div className="lg:col-span-7 space-y-4">
          {/* Scenario Overview & Phase Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                ACTIVE SCENARIO: {activeDef.name}
              </span>
              <span className="text-slate-500">Progress: {progressPct}%</span>
            </div>

            {/* Progression Bar */}
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-xs bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Phase I: Initiation</span>
                <span>Phase II: Acceleration</span>
                <span>Phase III: Consolidation</span>
              </div>
            </div>

            {/* Affected Injection Nodes */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Active Target Nodes ({state.affectedNodeCodes.length} active):</span>
                <div className="flex gap-1">
                  {['P-101', 'P-102', 'P-103', 'P-104'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => selectPanelNodes(p)}
                      className="px-1 py-0.2 rounded-xs border border-slate-200 dark:border-slate-700 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {DEMO_NODES.map((n) => {
                  const isAffected = state.affectedNodeCodes.includes(n.node_code);
                  return (
                    <button
                      key={n.node_code}
                      type="button"
                      onClick={() => toggleNodeAffected(n.node_code)}
                      className={`px-1.5 py-0.5 rounded-xs text-[10px] font-mono border cursor-pointer ${
                        isAffected
                          ? 'bg-amber-600 text-white border-transparent font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {n.node_code}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Readout Table (No bloated cards) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                Transducer Channel Deltas (Station SN-102 Epicenter)
              </span>
              <span className="text-[10px] text-slate-400">Live Mathematical Physics</span>
            </div>

            <table className="w-full text-xs font-mono">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-3 text-left">Channel</th>
                  <th className="py-2 px-3 text-left">Transducer Modality</th>
                  <th className="py-2 px-3 text-right">Value</th>
                  <th className="py-2 px-3 text-right">Nominal Range</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">TILT_X</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Biaxial Tilt X</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {tiltVal.toFixed(2)} arcsec
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">&plusmn;150 arcsec</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded-xs text-[10px] ${Math.abs(tiltVal) > 120 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {Math.abs(tiltVal) > 120 ? 'ALERT' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">DISP_Z</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Borehole Extensometer</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {dispVal.toFixed(2)} mm
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">0.0 &ndash; 30.0 mm</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded-xs text-[10px] ${dispVal > 30.0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {dispVal > 30.0 ? 'EXCEEDED' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">VIB_RMS</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Triaxial Seismograph PPV</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {vibVal.toFixed(2)} mm/s
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">&lt; 5.0 mm/s</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded-xs text-[10px] ${vibVal > 5.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {vibVal > 5.0 ? 'ELEVATED' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">STRAIN</td>
                  <td className="py-2 px-3 text-slate-500 font-sans">Rockbolt / Pillar Strain</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {strainVal.toFixed(1)} &mu;&epsilon;
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">&plusmn;800 &mu;&epsilon;</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-1.5 py-0.2 rounded-xs text-[10px] ${strainVal > 800 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {strainVal > 800 ? 'HIGH' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Risk Engine Response & Evidence */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-mono">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                Risk Engine Response Output
              </span>
              <RiskBadge state={currentRiskState} size="sm" />
            </div>
            <div className="p-2.5 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
              <div className="text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-slate-100">Evaluated Rationale:</strong>{' '}
                {currentEvidence?.whyRiskChanged ?? 'Strata deformation rates and multi-station correlation within baseline.'}
              </div>
              <div className="mt-1 text-slate-500 text-[10px]">
                Active Anomaly Clustered Nodes: {currentEvidence?.where.affectedNodes.join(', ') || 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
