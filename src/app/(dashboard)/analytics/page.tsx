'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import {
  BrainCircuit,
  Activity,
  Network,
  SlidersHorizontal,
  CheckCircle2,
  Info,
  ShieldAlert,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              AI Geotechnical Intelligence &bull; Hybrid Detection Engine
            </span>
            <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Anomaly Detection & Explainable Risk Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Interpretable multi-sensor fusion, statistical z-score persistence analysis, and spatial correlation matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs font-mono">
            Model: Hybrid EWMA + Isolation Forest v2.1
          </Badge>
          <RiskBadge state={currentRiskState} size="md" />
        </div>
      </div>

      {/* Methodological Transparency Callout */}
      <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs flex items-start gap-2.5">
        <Info className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Safety-Critical AI Language & Evaluation Policy
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            This platform performs statistical anomaly detection and evidence-based risk assessment. Under DGMS technical guidelines, it provides decision support and does NOT claim deterministic collapse prediction or zero-false-alarm guarantees.
          </p>
        </div>
      </div>

      {/* Top Analytics Metrics - Wire to Live State */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Composite Anomaly Score"
          channelCode="AI-ANOM-CMP"
          value={compositeAnomalyScore}
          unit="/ 1.00"
          nominalRange={[0.0, 0.40]}
          riskState={compositeAnomalyScore > 0.7 ? 'Warning' : compositeAnomalyScore > 0.4 ? 'Advisory' : 'Normal'}
          rateOfChange={isSimActive ? 0.04 : 0.01}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Multi-Station Correlation"
          channelCode="SPAT-CORR"
          value={spatialCorrelation}
          unit="Pearson r"
          nominalRange={[0.70, 1.00]}
          riskState={spatialCorrelation > 0.8 ? (currentRiskState === 'Normal' ? 'Normal' : currentRiskState) : 'Normal'}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Persistence Window"
          channelCode="STAT-WIN-PERS"
          value={persistenceSec}
          unit="seconds"
          nominalRange={[0.0, 60.0]}
          riskState={persistenceSec > 40 ? 'Watch' : 'Normal'}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Modality Agreement"
          channelCode="FUS-AGREE"
          value={modalityAgreement}
          unit="Concordance"
          nominalRange={[0.5, 1.0]}
          riskState={modalityAgreement > 0.75 ? (currentRiskState === 'Normal' ? 'Normal' : currentRiskState) : 'Normal'}
          provenance={isSimActive ? 'SIMULATED' : 'DEMO'}
        />
      </div>

      {/* Panel Selection Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">Inspection Panel:</span>
          {(['P-101', 'P-102', 'P-103', 'P-104'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={selectedPanel === p ? 'default' : 'outline'}
              onClick={() => setSelectedPanel(p)}
              className="text-xs h-7 font-mono"
            >
              Panel {p}
            </Button>
          ))}
        </div>

        <Badge variant="outline" className="font-mono text-[11px]">
          Confidence: {currentEvidence?.summary ? '91.2%' : '86.4%'}
        </Badge>
      </div>

      {/* Multi-Quadrant Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadrant 1: Multi-Sensor Fusion Matrix */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Multi-Sensor Modality Fusion (Panel {selectedPanel} &bull; {nodePrefix})
              </CardTitle>
              <ProvenanceBadge provenance={isSimActive ? 'SIMULATED' : 'DEMO'} size="sm" />
            </div>
            <CardDescription className="text-xs">
              Cross-verification between independent physical sensing modalities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Biaxial Tilt Slope (Tilt X)</p>
                  <p className="text-[11px] text-slate-500">Node {nodePrefix} &bull; Dual MEMS Clinometer</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${Math.abs(tiltVal) > 60 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {tiltVal.toFixed(2)} arcsec
                  </span>
                  <p className="text-[10px] text-slate-400">DGMS limit: 3.00 mm/m</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Borehole Multi-Point Extensometer</p>
                  <p className="text-[11px] text-slate-500">Node {nodePrefix} &bull; Deep Strata Anchor (45m)</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${dispVal > 30 ? 'text-rose-600' : dispVal > 20 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dispVal.toFixed(2)} mm
                  </span>
                  <p className="text-[10px] text-slate-400">Warning threshold: 30.0 mm</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Microseismic Peak Vibration (PPV)</p>
                  <p className="text-[11px] text-slate-500">Node {nodePrefix} &bull; Triaxial Geophone</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${vibVal > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {vibVal.toFixed(2)} mm/s
                  </span>
                  <p className="text-[10px] text-slate-400">Safe: &lt; 5.0 mm/s</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Vibrating Wire Strain Gauge</p>
                  <p className="text-[11px] text-slate-500">Node {nodePrefix} &bull; Roof Bolt Axial Tension</p>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${strainVal > 700 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                    {strainVal.toFixed(1)} µε
                  </span>
                  <p className="text-[10px] text-slate-400">Nominal: &lt; 600 µε</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 2: Explainable Risk Contribution Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-purple-600" />
                Explainable Risk Assessment Rationale
              </CardTitle>
              <RiskBadge state={currentRiskState} size="sm" />
            </div>
            <CardDescription className="text-xs">
              Decomposition of risk score into physical contributing parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4 text-xs">
            <div className="p-3 rounded bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60">
              <p className="font-semibold text-purple-900 dark:text-purple-200 text-xs mb-1">
                Risk Engine Synthesis
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                {currentEvidence?.whyRiskChanged ?? (
                  `Risk state evaluated as ${currentRiskState}. Multi-station correlation score (r=${spatialCorrelation.toFixed(2)}) confirms genuine concordance between adjacent nodes.`
                )}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contributing Factors Breakdown
              </h4>

              {currentEvidence && currentEvidence.contributingFactors.length > 0 ? (
                currentEvidence.contributingFactors.map((cf, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">{cf.factor}</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {Math.round(cf.weight * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
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
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">Multi-Station Tilt Gradient (Slope)</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">35%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">Borehole Extensometer Rate-of-Change</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 3: Statistical Persistence & Noise Filtering */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              Persistence Window vs Transient Vibration
            </CardTitle>
            <CardDescription className="text-xs">
              Distinguishing surface machinery / haulage trucks from actual continuous subsidence
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Transient Filter Active (EWMA alpha = 0.25)
              </div>
              <p className="text-slate-500 text-[11px]">
                Heavy dumpers operating near the railway siding produce momentary PPV spikes (up to 8.2 mm/s). Because duration is &lt; 45 seconds, the persistence filter automatically rejects them, preventing false evacuation alarms.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Haulage Vibration</span>
                <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">Transient (&lt; 2 min)</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Filtered (Score: 0.05)</p>
              </div>
              <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400">Strata Flexing</span>
                <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">Continuous (&gt; 3 hours)</p>
                <p className="text-[10px] text-amber-600 font-semibold">Passed to Risk Engine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 4: Spatial Correlation Network */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Network className="h-4 w-4 text-indigo-600" />
              Spatial Correlation Network (16 Nodes)
            </CardTitle>
            <CardDescription className="text-xs">
              Neighboring node co-variance matrix across extraction zones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                <span>Node Pair: SN-101 &harr; SN-102</span>
                <span className="text-emerald-600 font-semibold">r = +0.89 (Strong Concordance)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                <span>Node Pair: SN-102 &harr; SN-103</span>
                <span className="text-emerald-600 font-semibold">r = +0.84 (Strong Concordance)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                <span>Node Pair: SN-103 &harr; SN-104</span>
                <span className="text-slate-600 dark:text-slate-400">r = +0.42 (Moderate Baseline)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                <span>Node Pair: SN-105 &harr; SN-109 (Cross-Panel)</span>
                <span className="text-slate-400">r = +0.08 (Decoupled)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Decoupling between distant panels proves spatial localization of the subsidence basin above Panel {selectedPanel}.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Detected Anomalies Table if any */}
      {activeAnomalies.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Active Statistical Anomalies ({activeAnomalies.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Live anomaly events detected by rolling z-score and EWMA filter
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 font-mono text-slate-500 text-[10px]">
                    <th className="py-2">Station</th>
                    <th className="py-2">Channel</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Z-Score</th>
                    <th className="py-2">Rate of Change</th>
                    <th className="py-2">Value</th>
                    <th className="py-2">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {activeAnomalies.map((anom) => (
                    <tr key={anom.id}>
                      <td className="py-2 font-bold">{anom.nodeCode}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{anom.sensorCode}</td>
                      <td className="py-2">{anom.anomalyType}</td>
                      <td className="py-2 text-amber-600 font-bold">{anom.zScore.toFixed(2)}σ</td>
                      <td className="py-2">{anom.rateOfChange.toFixed(3)} {anom.unit}/s</td>
                      <td className="py-2">{anom.value.toFixed(2)} {anom.unit}</td>
                      <td className="py-2 uppercase font-bold text-rose-600">{anom.severity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
