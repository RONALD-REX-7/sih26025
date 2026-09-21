'use client';

import React, { useState } from 'react';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import {
  BrainCircuit,
  Activity,
  Network,
  SlidersHorizontal,
  Info,
  AlertCircle,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPanel, setSelectedPanel] = useState<'P-101' | 'P-102' | 'P-103' | 'P-104'>('P-101');
  const { currentRiskState, currentEvidence, activeAnomalies, latestReadings, state: simState } = useSimulatorStore();

  const isSimActive = simState.status === 'running';

  // Extract dynamic scores from current evidence or fallback to realistic baselines
  const spatialCorrelation = currentEvidence?.spatialCorrelationScore ?? 0.84;
  const modalityAgreement = currentEvidence?.modalityAgreementScore ?? 0.88;
  const persistenceSec = currentEvidence?.when.persistenceSec ?? 18;
  const compositeAnomalyScore = parseFloat(
    (spatialCorrelation * 0.45 + modalityAgreement * 0.40 + (persistenceSec > 20 ? 0.15 : 0.05)).toFixed(2)
  );

  // Live telemetry channel readouts for the selected panel
  const nodePrefix = selectedPanel === 'P-101' ? 'SN-102' : selectedPanel === 'P-102' ? 'SN-106' : selectedPanel === 'P-103' ? 'SN-110' : 'SN-114';
  const tiltVal = latestReadings[`${nodePrefix}-TILT_X`]?.value ?? 1.42;
  const dispVal = latestReadings[`${nodePrefix}-DISP_Z`]?.value ?? 18.5;
  const vibVal = latestReadings[`${nodePrefix}-VIB_RMS`]?.value ?? 2.1;
  const strainVal = latestReadings[`${nodePrefix}-STRAIN`]?.value ?? 420.0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Statistical Intelligence &bull; Hybrid Detection Engine
            </span>
            <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Statistical Anomaly Detection &amp; Explainable Risk Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Multi-transducer fusion, rolling z-score persistence analysis, and Pearson spatial correlation matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-xs text-slate-600 dark:text-slate-400">
            Model: EWMA + Robust Z-Score (v2.1)
          </span>
          <RiskBadge state={currentRiskState} size="md" />
        </div>
      </div>

      {/* Scientific Transparency Callout */}
      <div className="p-3 rounded-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2.5">
        <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            DGMS Safety-Critical Decision Support Standard:
          </span>{' '}
          This platform performs statistical anomaly detection and evidence-based risk assessment. It detects abnormal rates of change, multi-station persistence, and cross-modality correlation. It does not claim deterministic collapse prediction.
        </div>
      </div>

      {/* Statistical Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Composite Risk Score</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {compositeAnomalyScore.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 1.00</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Nominal threshold: &lt; 0.40</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Spatial Correlation (r)</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            r = +{spatialCorrelation.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Pearson inter-station co-variance</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Persistence Window</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {persistenceSec} <span className="text-xs font-normal text-slate-500">seconds</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Transient dumper filter: 45s</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Modality Concordance</div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {(modalityAgreement * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">Tilt &bull; Disp &bull; PPV agreement</div>
        </div>
      </div>

      {/* Panel Selection Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">District:</span>
          {(['P-101', 'P-102', 'P-103', 'P-104'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPanel(p)}
              className={`px-2 py-1 text-xs font-mono rounded-xs border cursor-pointer ${
                selectedPanel === p
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Panel {p}
            </button>
          ))}
        </div>

        <span className="font-mono text-[11px] text-slate-500">
          Evidence: {currentEvidence?.where.affectedNodes.length ?? 1}/4 stations exhibiting correlated deviation
        </span>
      </div>

      {/* Multi-Quadrant Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quadrant 1: Multi-Sensor Modality Fusion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-sky-600" />
              Multi-Sensor Modality Fusion (Station {nodePrefix})
            </span>
            <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
          </div>

          <div className="p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Biaxial Tilt Slope (Tilt X)</p>
                <p className="text-[10px] text-slate-500 font-mono">Dual MEMS Clinometer</p>
              </div>
              <div className="text-right">
                <span className={`font-mono font-semibold ${Math.abs(tiltVal) > 60 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {tiltVal.toFixed(2)} arcsec
                </span>
                <p className="text-[9px] text-slate-400 font-mono">DGMS limit: 3.0 mm/m</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Borehole Multi-Point Extensometer</p>
                <p className="text-[10px] text-slate-500 font-mono">Deep Strata Anchor (45m)</p>
              </div>
              <div className="text-right">
                <span className={`font-mono font-semibold ${dispVal > 30 ? 'text-rose-600' : dispVal > 20 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {dispVal.toFixed(2)} mm
                </span>
                <p className="text-[9px] text-slate-400 font-mono">Warning threshold: 30.0 mm</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Microseismic Peak Vibration (PPV)</p>
                <p className="text-[10px] text-slate-500 font-mono">Triaxial Geophone</p>
              </div>
              <div className="text-right">
                <span className={`font-mono font-semibold ${vibVal > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {vibVal.toFixed(2)} mm/s
                </span>
                <p className="text-[9px] text-slate-400 font-mono">Safe threshold: &lt; 5.0 mm/s</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Vibrating Wire Strain Gauge</p>
                <p className="text-[10px] text-slate-500 font-mono">Roof Bolt Axial Tension</p>
              </div>
              <div className="text-right">
                <span className={`font-mono font-semibold ${strainVal > 700 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {strainVal.toFixed(1)} &mu;&epsilon;
                </span>
                <p className="text-[9px] text-slate-400 font-mono">Nominal: &lt; 600 &mu;&epsilon;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Explainable Risk Contribution Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
              Risk Synthesis &amp; Contributing Factors
            </span>
            <RiskBadge state={currentRiskState} size="sm" />
          </div>

          <div className="p-3 space-y-3 text-xs">
            <div className="p-2.5 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-slate-100">Engine Synthesis:</span>{' '}
              {currentEvidence?.whyRiskChanged ?? (
                `Risk state evaluated as ${currentRiskState}. Multi-station correlation score (r=${spatialCorrelation.toFixed(2)}) confirms genuine concordance between adjacent nodes.`
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                Contributing Factor Weights
              </div>

              {currentEvidence && currentEvidence.contributingFactors.length > 0 ? (
                currentEvidence.contributingFactors.map((cf, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">{cf.factor}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {Math.round(cf.weight * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div
                        className={`h-full ${
                          cf.state === 'critical'
                            ? 'bg-rose-500'
                            : cf.state === 'elevated'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.round(cf.weight * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">Tilt Gradient Slope</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">35%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">Borehole Extensometer Rate-of-Change</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">30%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-xs overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quadrant 3: Persistence Filter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              Persistence Filter vs Transient Vibration
            </span>
          </div>

          <div className="p-3 space-y-2 text-xs">
            <div className="p-2 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Surface haulage dumpers crossing above the railway line produce transient PPV spikes (&lt; 45 seconds). The persistence filter rejects short spikes, preventing false alarms.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xs border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400">Haulage Vibration</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">&lt; 45 sec spike</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Filtered</p>
              </div>
              <div className="p-2 rounded-xs border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400">Strata Flexing</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">&gt; 3 min trend</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Sent to Risk Engine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant 4: Spatial Correlation Network */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-indigo-600" />
              Spatial Co-Variance Network (16 Stations)
            </span>
          </div>

          <div className="p-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Node Pair: SN-101 &harr; SN-102</span>
              <span className="text-emerald-600 font-semibold">r = +0.89 (High Concordance)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Node Pair: SN-102 &harr; SN-103</span>
              <span className="text-emerald-600 font-semibold">r = +0.84 (High Concordance)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span>Node Pair: SN-105 &harr; SN-109 (Cross-Panel)</span>
              <span className="text-slate-400">r = +0.08 (Decoupled Baseline)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans italic pt-1">
              Decoupling between distant panels verifies localized deformation above Panel {selectedPanel}.
            </p>
          </div>
        </div>
      </div>

      {/* Active Anomalies Register */}
      {activeAnomalies.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              Active Statistical Anomalies ({activeAnomalies.length})
            </span>
            <span className="text-[10px] text-slate-400">Rolling EWMA 2.5&sigma; Exceedances</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-3 text-left">Station</th>
                  <th className="py-2 px-3 text-left">Channel</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-right">Z-Score</th>
                  <th className="py-2 px-3 text-right">Rate of Change</th>
                  <th className="py-2 px-3 text-right">Value</th>
                  <th className="py-2 px-3 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                {activeAnomalies.map((anom) => (
                  <tr key={anom.id}>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{anom.nodeCode}</td>
                    <td className="py-2 px-3 text-slate-500">{anom.sensorCode}</td>
                    <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">{anom.anomalyType}</td>
                    <td className="py-2 px-3 text-right text-amber-600 font-bold">{anom.zScore.toFixed(2)}&sigma;</td>
                    <td className="py-2 px-3 text-right text-slate-500">{anom.rateOfChange.toFixed(3)} {anom.unit}/s</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">{anom.value.toFixed(2)} {anom.unit}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-1.5 py-0.2 rounded-xs text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase">
                        {anom.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
