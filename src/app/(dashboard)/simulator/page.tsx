'use client';

import React, { useEffect, useState } from 'react';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { SCENARIO_DEFINITIONS, SimulationScenarioId } from '@/lib/simulator/scenario-definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { StatusDot } from '@/components/industrial/status-dot';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { DEMO_NODES } from '@/lib/data/mock-data';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Cpu,
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
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(state.seed.toString()).catch(() => {});
    }
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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Workbench Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-[#173B57]" />
              Engineering test console &bull; Geotechnical test bench
            </span>
            <ProvenanceBadge provenance="SIMULATED" size="sm" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Mulberry32 Deterministic Telemetry Test Bench
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Seed-reproducible multi-station synthetic generator for calibrating DGMS CMR 2017 Reg. 112 early warning algorithms.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono-tech text-xs">
            <div className="text-xs text-[#74808A] uppercase">Elapsed / Duration</div>
            <div className="font-bold text-[#1D2933]">
              {formatTime(state.elapsedSec)} / {formatTime(activeDef.durationSeconds)}
            </div>
          </div>
          <RiskBadge state={currentRiskState} size="sm" />
        </div>
      </div>

      {/* Sticky Playback Controller Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {state.status === 'running' ? (
            <Button
              size="sm"
              onClick={pause}
              className="text-xs h-8 bg-[#9A6A00] hover:bg-[#A85A00] text-[#FFFFFF] font-mono-tech cursor-pointer"
            >
              <Pause className="h-3.5 w-3.5 mr-1" /> Pause
            </Button>
          ) : state.status === 'paused' ? (
            <Button
              size="sm"
              onClick={resume}
              className="text-xs h-8 bg-[#2F6B4F] hover:bg-[#1E4D38] text-[#FFFFFF] font-mono-tech cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 mr-1" /> Resume
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={start}
              className="text-xs h-8 bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-mono-tech cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 mr-1" /> Start simulation
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="text-xs h-8 font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#52606D]"
            title="Reset simulation to tick 0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>

          <span className="text-xs font-mono-tech text-[#52606D] ml-2 flex items-center gap-1.5">
            <StatusDot
              status={state.status === 'running' ? 'active' : state.status === 'paused' ? 'degraded' : 'inactive'}
              size="sm"
            />
            Status: <strong className="text-[#1D2933]">{state.status.toUpperCase()}</strong>
          </span>
        </div>

        {/* Clock Speed & Seed Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-[#52606D] mr-1">Speed:</span>
            {([1, 2, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 text-xs font-mono-tech rounded-sm border cursor-pointer ${
                  state.speed === spd
                    ? 'bg-[#173B57] text-[#FFFFFF] font-bold border-transparent'
                    : 'border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#52606D]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono-tech">
            <span className="text-[#52606D]">Seed:</span>
            <Input
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              className="h-7 w-20 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplySeed}
              className="h-7 text-xs px-2 font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0]"
            >
              Set
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRandomizeSeed}
              className="h-7 text-xs px-2 font-mono-tech text-[#52606D]"
              title="Randomize seed"
            >
              Rand
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopySeed}
              className="h-7 px-2 font-mono-tech text-xs text-[#52606D]"
            >
              {copiedSeed ? <Check className="h-3.5 w-3.5 text-[#2F6B4F]" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Bench Grid: 40% Scenarios List / 60% Active Progression & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (40%): Geotechnical Failure Scenarios List */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1D2933]">
              Geotechnical Failure Scenarios (9 Pre-Calibrated)
            </h2>
            <p className="text-xs text-[#52606D] mt-0.5">
              Select scenario to immediately re-prime deterministic Mulberry32 sequence
            </p>
          </div>

          <div className="divide-y divide-[#D7DEDC] overflow-y-auto max-h-[540px]">
            {Object.values(SCENARIO_DEFINITIONS).map((def) => {
              const isSelected = def.id === state.scenarioId;
              return (
                <div
                  key={def.id}
                  onClick={() => setScenario(def.id as SimulationScenarioId)}
                  className={`p-3 cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#F4F6F5] border-l-4 border-l-[#173B57]'
                      : 'hover:bg-[#F8FAF9]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono-tech">
                    <span className="font-semibold text-[#1D2933]">{def.name}</span>
                    <span className="text-xs text-[#74808A]">{def.durationSeconds}s duration</span>
                  </div>
                  <p className="text-xs text-[#52606D] mt-1 leading-relaxed">
                    {def.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (60%): Scenario Progression & Telemetry Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* Progression Bar & Phase Info */}
          <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="font-bold text-[#1D2933]">
                Scenario progression: {activeDef.name}
              </span>
              <span className="text-[#52606D] font-semibold">{progressPct}% complete</span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-sm bg-[#EDF1F0] overflow-hidden">
                <div
                  className="h-full bg-[#173B57] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono-tech text-[#74808A]">
                <span>Phase I: Initiation</span>
                <span>Phase II: Acceleration</span>
                <span>Phase III: Consolidation</span>
              </div>
            </div>

            {/* Affected Injection Nodes */}
            <div className="pt-3 border-t border-[#D7DEDC] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#52606D]">
                <span className="font-medium">
                  Injection target stations ({state.affectedNodeCodes.length} active):
                </span>
                <div className="flex gap-1 font-mono-tech">
                  {['P-101', 'P-102', 'P-103', 'P-104'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => selectPanelNodes(p)}
                      className="px-1.5 py-0.5 rounded-sm border border-[#D7DEDC] text-xs hover:bg-[#EDF1F0] cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 font-mono-tech">
                {DEMO_NODES.map((n) => {
                  const isAffected = state.affectedNodeCodes.includes(n.node_code);
                  return (
                    <button
                      key={n.node_code}
                      type="button"
                      onClick={() => toggleNodeAffected(n.node_code)}
                      className={`px-2 py-0.5 rounded-sm text-xs border cursor-pointer transition-colors ${
                        isAffected
                          ? 'bg-[#173B57] text-[#FFFFFF] border-transparent font-bold'
                          : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
                      }`}
                    >
                      {n.node_code}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Telemetry Channel Deltas Table */}
          <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden">
            <div className="p-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between text-xs font-mono-tech">
              <span className="font-bold text-[#1D2933] uppercase">
                Transducer channel deltas (Station SN-102 Epicenter)
              </span>
              <span className="text-xs text-[#52606D]">Live sensor fusion</span>
            </div>

            <table className="w-full text-xs font-mono-tech">
              <thead className="border-b border-[#D7DEDC] bg-[#F8FAF9] text-xs text-[#52606D] uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-left">Channel</th>
                  <th className="py-2.5 px-3 text-left">Transducer modality</th>
                  <th className="py-2.5 px-3 text-right">Value</th>
                  <th className="py-2.5 px-3 text-right">Nominal range</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DEDC]">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-[#1D2933]">TILT_X</td>
                  <td className="py-2.5 px-3 text-[#52606D] font-sans">Biaxial Tilt X</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#1D2933] tabular-nums">
                    {tiltVal.toFixed(2)} arcsec
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#74808A]">&plusmn;150 arcsec</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                        Math.abs(tiltVal) > 120
                          ? 'bg-[#FBEBE9] text-[#B42318]'
                          : 'bg-[#EAF2ED] text-[#2F6B4F]'
                      }`}
                    >
                      {Math.abs(tiltVal) > 120 ? 'ALERT' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-[#1D2933]">DISP_Z</td>
                  <td className="py-2.5 px-3 text-[#52606D] font-sans">Borehole Extensometer</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#1D2933] tabular-nums">
                    {dispVal.toFixed(2)} mm
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#74808A]">0.0 &ndash; 30.0 mm</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                        dispVal > 30.0
                          ? 'bg-[#FBEBE9] text-[#B42318]'
                          : 'bg-[#EAF2ED] text-[#2F6B4F]'
                      }`}
                    >
                      {dispVal > 30.0 ? 'EXCEEDED' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-[#1D2933]">VIB_RMS</td>
                  <td className="py-2.5 px-3 text-[#52606D] font-sans">Triaxial Seismograph PPV</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#1D2933] tabular-nums">
                    {vibVal.toFixed(2)} mm/s
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#74808A]">&lt; 5.0 mm/s</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                        vibVal > 5.0
                          ? 'bg-[#FBF6E9] text-[#9A6A00]'
                          : 'bg-[#EAF2ED] text-[#2F6B4F]'
                      }`}
                    >
                      {vibVal > 5.0 ? 'ELEVATED' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-[#1D2933]">STRAIN</td>
                  <td className="py-2.5 px-3 text-[#52606D] font-sans">Rockbolt / Pillar Strain</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#1D2933] tabular-nums">
                    {strainVal.toFixed(1)} &mu;&epsilon;
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#74808A]">&plusmn;800 &mu;&epsilon;</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                        strainVal > 800
                          ? 'bg-[#FBEBE9] text-[#B42318]'
                          : 'bg-[#EAF2ED] text-[#2F6B4F]'
                      }`}
                    >
                      {strainVal > 800 ? 'HIGH' : 'NOMINAL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Risk Engine Response Rationale */}
          <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[#D7DEDC] pb-2">
              <span className="font-bold text-[#1D2933] uppercase font-mono-tech">
                Risk assessment evidence output
              </span>
              <RiskBadge state={currentRiskState} size="sm" />
            </div>
            <div className="p-3 rounded-sm bg-[#F4F6F5] border border-[#D7DEDC] font-mono-tech leading-relaxed">
              <div className="text-[#1D2933]">
                <strong className="text-[#173B57]">Evaluated rationale:</strong>{' '}
                {currentEvidence?.whyRiskChanged ?? 'Strata deformation rates and multi-station correlation within baseline.'}
              </div>
              <div className="mt-1 text-[#52606D] text-xs">
                Active anomaly clustered nodes: {currentEvidence?.where.affectedNodes.join(', ') || 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
