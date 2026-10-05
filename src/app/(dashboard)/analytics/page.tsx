'use client';

import React, { useState, useEffect } from 'react';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import {
  BrainCircuit,
  Activity,
  Network,
  Info,
  TrendingUp,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPanel, setSelectedPanel] = useState<'P-101' | 'P-102' | 'P-103' | 'P-104'>('P-101');
  const [analyticsMode, setAnalyticsMode] = useState<'LIVE' | 'REPLAY'>('LIVE');
  const [replayTimeSec, setReplayTimeSec] = useState<number>(35);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<'EPISODE_A' | 'EPISODE_B'>('EPISODE_A');

  const { currentRiskState, currentEvidence, latestReadings } = useSimulatorStore();

  // Replay timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReplaying && analyticsMode === 'REPLAY') {
      timer = setInterval(() => {
        setReplayTimeSec((prev) => {
          if (prev >= 120) {
            setIsReplaying(false);
            return 120;
          }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(timer);
  }, [isReplaying, analyticsMode, replaySpeed]);

  const spatialCorrelation = currentEvidence?.spatialCorrelationScore ?? 0.84;
  const modalityAgreement = currentEvidence?.modalityAgreementScore ?? 0.88;
  const persistenceSec = currentEvidence?.when.persistenceSec ?? 18;
  const compositeAnomalyScore = parseFloat(
    (spatialCorrelation * 0.45 + modalityAgreement * 0.40 + (persistenceSec > 20 ? 0.15 : 0.05)).toFixed(2)
  );

  const nodePrefix = selectedPanel === 'P-101' ? 'SN-102' : selectedPanel === 'P-102' ? 'SN-106' : selectedPanel === 'P-103' ? 'SN-110' : 'SN-114';
  
  // Real-time vs Replay values
  const tiltVal = analyticsMode === 'REPLAY' 
    ? 12.4 + (replayTimeSec / 120) * 18.5 
    : latestReadings[`${nodePrefix}-TILT_X`]?.value ?? 12.4;

  const dispVal = analyticsMode === 'REPLAY'
    ? 14.2 + (replayTimeSec / 120) * 28.0
    : latestReadings[`${nodePrefix}-DISP_Z`]?.value ?? 18.5;

  const vibVal = analyticsMode === 'REPLAY'
    ? 1.8 + Math.sin(replayTimeSec / 8) * 2.2
    : latestReadings[`${nodePrefix}-VIB_RMS`]?.value ?? 2.1;

  const strainVal = analyticsMode === 'REPLAY'
    ? 380 + (replayTimeSec / 120) * 310
    : latestReadings[`${nodePrefix}-STRAIN`]?.value ?? 420.0;

  const crackVal = analyticsMode === 'REPLAY'
    ? 0.4 + (replayTimeSec / 120) * 5.2
    : latestReadings[`${nodePrefix}-CRACK`]?.value ?? 0.95;

  const interNodeDelta = analyticsMode === 'REPLAY'
    ? (replayTimeSec / 120) * 8.4
    : 2.1;

  // Inter-station Pearson correlation matrix
  const correlationMatrix = [
    { station: 'SN-101', 'SN-101': 1.00, 'SN-102': 0.88, 'SN-103': 0.76, 'SN-104': 0.42 },
    { station: 'SN-102', 'SN-101': 0.88, 'SN-102': 1.00, 'SN-103': 0.82, 'SN-104': 0.51 },
    { station: 'SN-103', 'SN-101': 0.76, 'SN-102': 0.82, 'SN-103': 1.00, 'SN-104': 0.63 },
    { station: 'SN-104', 'SN-101': 0.42, 'SN-102': 0.51, 'SN-103': 0.63, 'SN-104': 1.00 },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#5B6871] flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-[#173B57]" />
              Statistical Intelligence &bull; Hybrid Detection Engine
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Statistical Anomaly Detection &amp; Explainable Risk Forecasting
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Multi-transducer sensor fusion, rolling Z-score persistence analysis, inter-station Pearson correlation, and trend forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ProvenanceBadge provenance={analyticsMode === 'REPLAY' ? 'HISTORICAL' : 'DEMO'} />
          <span className="text-xs font-mono-tech border border-[#D7DEDC] bg-[#EDF1F0] px-2.5 py-1 rounded-sm text-[#52606D]">
            Model: EWMA + Robust Z-Score (v2.1)
          </span>
          <RiskBadge state={currentRiskState} size="md" />
        </div>
      </div>

      {/* Conceptual Intelligence Pipeline (Requirement 4) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-[#173B57]" />
            Explainable Geotechnical Risk &amp; Forecasting Pipeline
          </span>
          <span className="text-[11px] font-mono-tech text-[#52606D]">
            Interpretable Hybrid Intelligence (Zero Black-Box Guesswork)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-9 gap-1.5 text-center text-xs font-mono-tech">
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">1. RAW STREAM</div>
            <div className="text-[10px] text-[#52606D]">6 Channels</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">2. SIGNAL QC</div>
            <div className="text-[10px] text-[#52606D]">CRC / Spike Filter</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">3. ANOMALY</div>
            <div className="text-[10px] text-[#52606D]">Robust Z-Score</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">4. TEMPORAL</div>
            <div className="text-[10px] text-[#52606D]">EWMA (α=0.20)</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">5. CONCORDANCE</div>
            <div className="text-[10px] text-[#52606D]">Multi-Modal</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">6. SPATIAL</div>
            <div className="text-[10px] text-[#52606D]">Pearson r ≥ 0.8</div>
          </div>
          <div className="p-2 rounded-xs bg-[#F8FAF9] border border-[#D7DEDC]">
            <div className="font-bold text-[#173B57]">7. FUSED RISK</div>
            <div className="text-[10px] text-[#173B57]">Index (0–1.0)</div>
          </div>
          <div className="p-2 rounded-xs bg-[#FBF6E9] border border-[#9A6A00]/40">
            <div className="font-bold text-[#9A6A00]">8. FORECAST</div>
            <div className="text-[10px] text-[#52606D]">+30s/+60s Window</div>
          </div>
          <div className="p-2 rounded-xs bg-[#FBEBE9] border border-[#B42318]/40">
            <div className="font-bold text-[#B42318]">9. WARNING</div>
            <div className="text-[10px] text-[#52606D]">CMR 112 Siren</div>
          </div>
        </div>
      </div>

      {/* Critical Differentiation Section: ANOMALY vs RISK vs FORECAST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm space-y-1.5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-[#173B57]" />
            1. Anomaly Identification
          </div>
          <div className="font-semibold text-xs text-[#1D2933]">
            &ldquo;What is abnormal right now?&rdquo;
          </div>
          <p className="text-xs text-[#52606D] leading-relaxed">
            Measures instantaneous deviation from historical rolling baseline using median absolute deviation (|Z| &gt; 2.5) across individual transducers (tilt, displacement, vibration, crack).
          </p>
        </div>

        <div className="p-3.5 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm space-y-1.5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#173B57]" />
            2. Present Fused Risk State
          </div>
          <div className="font-semibold text-xs text-[#1D2933]">
            &ldquo;How severe is the present multi-sensor condition?&rdquo;
          </div>
          <p className="text-xs text-[#52606D] leading-relaxed">
            Combines multi-station spatial correlation, transducer concordance, and temporal persistence into a normalized 5-state risk index: <em>Normal &rarr; Advisory &rarr; Watch &rarr; Warning &rarr; Critical</em>.
          </p>
        </div>

        <div className="p-3.5 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm space-y-1.5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9A6A00] flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#9A6A00]" />
            3. Short-Horizon Risk Forecasting
          </div>
          <div className="font-semibold text-xs text-[#1D2933]">
            &ldquo;Given observed rates, how will risk evolve?&rdquo;
          </div>
          <p className="text-xs text-[#52606D] leading-relaxed">
            Projects forward +30s and +60s based on exponential smoothing velocity and inter-node strain rates. Demonstrates software escalation pathway without claiming deterministic rock mass failure.
          </p>
        </div>
      </div>

      {/* Dedicated Short-Horizon Forecast Card (Requirement 4) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7DEDC] pb-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#173B57]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
              Short-Horizon Trend Projection &bull; 60-Second Demonstration Interval
            </h2>
          </div>
          <span className="text-[11px] font-mono-tech text-[#9A6A00] font-semibold bg-[#FBF6E9] px-2 py-0.5 rounded-xs border border-[#9A6A00]/20">
            DEMO STATISTICAL FORECASTING (PROTOTYPE)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono-tech text-xs">
          <div className="p-3 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm">
            <div className="text-[11px] text-[#5B6871] uppercase font-semibold">Current Fused Risk</div>
            <div className="text-lg font-bold text-[#1D2933] mt-1">
              {compositeAnomalyScore.toFixed(2)} <span className="text-xs font-normal text-[#52606D]">/ 1.00</span>
            </div>
            <div className="text-[11px] text-[#52606D] mt-0.5">Present fused state</div>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm">
            <div className="text-[11px] text-[#5B6871] uppercase font-semibold">Temporal Trend</div>
            <div className="text-lg font-bold text-[#9A6A00] mt-1 flex items-center gap-1">
              &uarr; Accelerating
            </div>
            <div className="text-[11px] text-[#52606D] mt-0.5">+0.14 risk / min</div>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm">
            <div className="text-[11px] text-[#5B6871] uppercase font-semibold">Forecast Window</div>
            <div className="text-lg font-bold text-[#173B57] mt-1">
              +30s to +60s
            </div>
            <div className="text-[11px] text-[#52606D] mt-0.5">Next demo step</div>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm">
            <div className="text-[11px] text-[#5B6871] uppercase font-semibold">Forecast Status</div>
            <div className="text-lg font-bold text-[#B42318] mt-1">
              Likely Escalate
            </div>
            <div className="text-[11px] text-[#52606D] mt-0.5">Projected to Warning</div>
          </div>

          <div className="p-3 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm">
            <div className="text-[11px] text-[#5B6871] uppercase font-semibold">Model Confidence</div>
            <div className="text-lg font-bold text-[#2F6B4F] mt-1">
              82.4%
            </div>
            <div className="text-[11px] text-[#52606D] mt-0.5">Sample variance weight</div>
          </div>
        </div>
      </div>

      {/* Mode Selector & Historical Replay Controller (Requirement 7) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7DEDC] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#173B57]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#173B57]">
              Operational Analytics Mode &amp; Historical Event Replay
            </h2>
          </div>

          {/* Mode Switch: Live vs Historical Replay */}
          <div className="flex items-center gap-1.5 font-mono-tech text-xs">
            <button
              type="button"
              onClick={() => { setAnalyticsMode('LIVE'); setIsReplaying(false); }}
              className={`px-3 py-1 rounded-sm border cursor-pointer transition-colors ${
                analyticsMode === 'LIVE'
                  ? 'bg-[#173B57] text-[#FFFFFF] font-bold border-[#173B57]'
                  : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
              }`}
            >
              LIVE TELEMETRY STREAM
            </button>
            <button
              type="button"
              onClick={() => setAnalyticsMode('REPLAY')}
              className={`px-3 py-1 rounded-sm border cursor-pointer transition-colors ${
                analyticsMode === 'REPLAY'
                  ? 'bg-[#9A6A00] text-[#FFFFFF] font-bold border-[#9A6A00]'
                  : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
              }`}
            >
              DEMO SYNTHETIC HISTORICAL REPLAY
            </button>
          </div>
        </div>

        {/* Replay Scrubbing Controls */}
        {analyticsMode === 'REPLAY' && (
          <div className="p-3.5 bg-[#F8FAF9] border border-[#D7DEDC] rounded-sm space-y-3 font-mono-tech text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1D2933]">Selected Synthetic Episode:</span>
                <select
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(e.target.value as 'EPISODE_A' | 'EPISODE_B')}
                  aria-label="Select synthetic episode for replay"
                  className="px-2 py-1 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm text-xs text-[#1D2933]"
                >
                  <option value="EPISODE_A">Panel P-101 Goaf Weighting (Synthetic Event)</option>
                  <option value="EPISODE_B">Deep Anchor Tensile Relaxation (Synthetic Event)</option>
                </select>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReplaying(!isReplaying)}
                  className="px-3 py-1 bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] rounded-sm font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isReplaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isReplaying ? 'Pause Replay' : 'Play Replay'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setReplayTimeSec(0); setIsReplaying(false); }}
                  className="px-2.5 py-1 border border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D] hover:bg-[#EDF1F0] rounded-sm cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1" />
                  Reset
                </button>

                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[#52606D]">Speed:</span>
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setReplaySpeed(spd)}
                      className={`px-1.5 py-0.5 rounded-xs border text-[11px] ${
                        replaySpeed === spd
                          ? 'bg-[#173B57] text-[#FFFFFF] font-bold border-transparent'
                          : 'border-[#D7DEDC] text-[#52606D] bg-[#FFFFFF]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Scrubber */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-[#52606D]">
                <span>T+00s (Baseline)</span>
                <span className="font-bold text-[#1D2933]">
                  Current Replay Position: T+{replayTimeSec.toString().padStart(2, '0')}s / 120s
                </span>
                <span>T+120s (Statutory Sign-off)</span>
              </div>

              <input
                type="range"
                min="0"
                max="120"
                value={replayTimeSec}
                onChange={(e) => setReplayTimeSec(Number(e.target.value))}
                aria-label="Replay timeline scrubber"
                className="w-full h-2 bg-[#D7DEDC] rounded-lg appearance-none cursor-pointer accent-[#173B57]"
              />

              {/* Event Markers */}
              <div className="grid grid-cols-4 gap-1 text-[10px] text-[#52606D] pt-1">
                <div className="border-l border-[#D7DEDC] pl-1">
                  <strong>T+00</strong> Baseline
                </div>
                <div className="border-l border-[#D7DEDC] pl-1">
                  <strong>T+25</strong> Microseismic
                </div>
                <div className="border-l border-[#D7DEDC] pl-1">
                  <strong>T+55</strong> Crack &amp; Strain
                </div>
                <div className="border-l border-[#D7DEDC] pl-1 text-[#B42318]">
                  <strong>T+90</strong> Early Warning
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* District Selector Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech text-[#52606D]">Focus District:</span>
          {(['P-101', 'P-102', 'P-103', 'P-104'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPanel(p)}
              className={`px-2.5 py-1 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
                selectedPanel === p
                  ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                  : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
              }`}
            >
              Panel {p}
            </button>
          ))}
        </div>

        <span className="font-mono-tech text-xs text-[#52606D]">
          Focus Node: <strong className="text-[#1D2933]">{nodePrefix}</strong> &bull; Pair: <strong className="text-[#1D2933]">SN-101 ↔ SN-102</strong>
        </span>
      </div>

      {/* Two-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Pearson Spatial Correlation Matrix Table */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
            <span className="font-semibold text-sm text-[#173B57] flex items-center gap-2">
              <Network className="h-4 w-4 text-[#173B57]" />
              Pearson Spatial Correlation Matrix ({selectedPanel})
            </span>
            <span className="text-xs font-mono-tech text-[#5B6871]">Inter-Station Concordance</span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left table-industrial">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>SN-101</th>
                  <th>SN-102</th>
                  <th>SN-103</th>
                  <th>SN-104</th>
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row) => (
                  <tr key={row.station}>
                    <td className="font-mono-tech font-bold text-[#173B57]">{row.station}</td>
                    <td className="font-mono-tech">
                      <span className={row['SN-101'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-101'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-102'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-102'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-103'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-103'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-104'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-104'].toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#5B6871] font-mono-tech mt-2">
              Values $r \ge 0.80$ indicate multi-station spatial deformation basin formation rather than single-sensor transient drift.
            </p>
          </div>
        </div>

        {/* Right: Modality Concordance & Factors (Including Crack & Relative Movement) */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
            <span className="font-semibold text-sm text-[#173B57] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#173B57]" />
              Transducer Concordance ({nodePrefix})
            </span>
            <span className="text-xs font-mono-tech text-[#5B6871]">
              {analyticsMode === 'REPLAY' ? 'Synthetic Replay' : 'Demonstration Model'}
            </span>
          </div>

          <div className="p-4 space-y-2.5 text-xs">
            {/* Crack / Fissure Aperture Channel */}
            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Crack / Fissure Aperture (CRACK)</p>
                <p className="text-xs text-[#52606D]">Surface Extensometer Fissure Gauge</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className={crackVal > 3.0 ? 'font-bold text-[#B42318]' : 'font-bold text-[#1D2933]'}>
                  {crackVal.toFixed(2)} mm
                </span>
                <p className="text-xs text-[#5B6871]">Warning: &gt; 5.0 mm</p>
              </div>
            </div>

            {/* Inter-Node Relative Movement */}
            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Inter-Node Relative Movement</p>
                <p className="text-xs text-[#52606D]">Pair SN-101 &harr; SN-102 (Baseline 45.0m)</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className={interNodeDelta > 5.0 ? 'font-bold text-[#B42318]' : 'font-bold text-[#1D2933]'}>
                  +{interNodeDelta.toFixed(2)} mm
                </span>
                <p className="text-xs text-[#5B6871]">Tension Threshold: 8.0 mm</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Biaxial Tilt Slope (Tilt X)</p>
                <p className="text-xs text-[#52606D]">Dual MEMS Inclinometer</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{tiltVal.toFixed(2)} arcsec</span>
                <p className="text-xs text-[#5B6871]">Limit: 3.0 mm/m</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Borehole Extensometer (DISP_Z)</p>
                <p className="text-xs text-[#52606D]">Deep Strata Anchor</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className={dispVal > 30 ? 'font-bold text-[#B42318]' : 'font-bold text-[#1D2933]'}>
                  {dispVal.toFixed(2)} mm
                </span>
                <p className="text-xs text-[#5B6871]">Threshold: 30.0 mm</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Microseismic Vibration (VIB_RMS)</p>
                <p className="text-xs text-[#52606D]">Velocity Geophone</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{vibVal.toFixed(2)} mm/s</span>
                <p className="text-xs text-[#5B6871]">Limit: 5.0 mm/s</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Pillar Strain Gauge (STRAIN)</p>
                <p className="text-xs text-[#52606D]">Roof Bolt Axial Tension</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{strainVal.toFixed(1)} µε</span>
                <p className="text-xs text-[#5B6871]">Nominal: &lt; 600 µε</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Diagnostics Specification Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9]">
          <h3 className="text-sm font-semibold text-[#173B57]">
            Anomaly Detection Model Configuration &amp; Rejection Filters
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-industrial">
            <thead>
              <tr>
                <th>Model Component</th>
                <th>Algorithm</th>
                <th>Sample Window</th>
                <th>Rejection Filter</th>
                <th>Regulatory Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-[#1D2933]">Baseline Smoothing</td>
                <td className="font-mono-tech">Exponentially Weighted Moving Average (EWMA)</td>
                <td className="font-mono-tech text-[#52606D]">α = 0.20 (15-sample window)</td>
                <td>High-frequency machinery vibration filter</td>
                <td className="text-[#52606D]">DGMS TC 4/2017</td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1D2933]">Outlier Scoring</td>
                <td className="font-mono-tech">Median Absolute Deviation (Robust Z-Score)</td>
                <td className="font-mono-tech text-[#52606D]">N = 50 samples rolling</td>
                <td>Rejects single-point transient spikes (|z| &lt; 2.5)</td>
                <td className="text-[#52606D]">CMPDI Technical Standard</td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1D2933]">Spatial Cross-Check</td>
                <td className="font-mono-tech">Pearson Bivariate Inter-Node Correlation</td>
                <td className="font-mono-tech text-[#52606D]">Adjacent nodes in extraction panel</td>
                <td>Single-node failure requires second-node corroboration</td>
                <td className="text-[#52606D]">DGMS CMR Reg 112</td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1D2933]">Short-Horizon Forecast</td>
                <td className="font-mono-tech">Velocity Holt-Winters Linear Drift Projection</td>
                <td className="font-mono-tech text-[#52606D]">60-second forward projection window</td>
                <td>Suppresses static noise; projects trend only on sustained concordance</td>
                <td className="text-[#52606D]">Prototype Decision Support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

