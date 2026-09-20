'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import {
  BrainCircuit,
  Activity,
  Network,
  SlidersHorizontal,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPanel, setSelectedPanel] = useState<'P-101' | 'P-103'>('P-101');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              AI Geotechnical Intelligence &bull; Hybrid Detection Engine
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
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

      {/* Top Analytics Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Composite Anomaly Score"
          channelCode="AI-ANOM-CMP"
          value={0.38}
          unit="/ 1.00"
          nominalRange={[0.0, 0.40]}
          riskState="Advisory"
          rateOfChange={0.04}
          provenance="DEMO"
        />
        <MetricBlock
          label="Multi-Station Correlation"
          channelCode="SPAT-CORR-P101"
          value={0.84}
          unit="Pearson r"
          nominalRange={[0.70, 1.00]}
          riskState="Advisory"
          provenance="DEMO"
        />
        <MetricBlock
          label="Persistence Window"
          channelCode="STAT-WIN-PERS"
          value={4.5}
          unit="hours"
          nominalRange={[0.0, 3.0]}
          riskState="Advisory"
          provenance="DEMO"
        />
        <MetricBlock
          label="Sensor Modality Fusion"
          channelCode="FUS-CHAN-4"
          value={4.0}
          unit="channels"
          nominalRange={[1.0, 4.0]}
          riskState="Normal"
          provenance="DEMO"
        />
      </div>

      {/* Panel Selection Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Inspection Panel:</span>
          <Button
            size="sm"
            variant={selectedPanel === 'P-101' ? 'default' : 'outline'}
            onClick={() => setSelectedPanel('P-101')}
            className="text-xs h-7 font-mono"
          >
            Panel P-101 (Active Extraction &bull; Seam VII)
          </Button>
          <Button
            size="sm"
            variant={selectedPanel === 'P-103' ? 'default' : 'outline'}
            onClick={() => setSelectedPanel('P-103')}
            className="text-xs h-7 font-mono"
          >
            Panel P-103 (Depillaring Sector)
          </Button>
        </div>

        <Badge variant="outline" className="font-mono text-[11px]">
          Confidence: 86.4%
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
                Multi-Sensor Modality Fusion (Panel {selectedPanel})
              </CardTitle>
              <ProvenanceBadge provenance="DEMO" size="sm" />
            </div>
            <CardDescription className="text-xs">
              Cross-verification between independent physical sensing modalities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Biaxial Tilt Slope (Tilt X/Y)</p>
                  <p className="text-[11px] text-slate-500">Node SN-102 &bull; Dual MEMS Clinometer</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-amber-600">1.42 mm/m</span>
                  <p className="text-[10px] text-slate-400">DGMS limit: 3.00 mm/m</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Borehole Multi-Point Extensometer</p>
                  <p className="text-[11px] text-slate-500">Node SN-103 &bull; Deep Strata Anchor (45m)</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">18.5 mm</span>
                  <p className="text-[10px] text-slate-400">Warning limit: 30.0 mm</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Microseismic Peak Vibration (PPV)</p>
                  <p className="text-[11px] text-slate-500">Node SN-104 &bull; Triaxial Geophone</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-emerald-600">2.1 mm/s</span>
                  <p className="text-[10px] text-slate-400">Safe: &lt; 5.0 mm/s</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Vibrating Wire Piezometer</p>
                  <p className="text-[11px] text-slate-500">Hydrogeological Strata Pore Pressure</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">142 kPa</span>
                  <p className="text-[10px] text-slate-400">Baseline: 135 &plusmn; 15 kPa</p>
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
              <RiskBadge state="Advisory" size="sm" />
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
                Risk state transitioned to <strong>Advisory</strong> because multi-station tilt gradient (SN-102 &amp; SN-103) sustained an elevated rate-of-change over 4 hours with high spatial correlation (r=0.84), confirming genuine continuous strata flexing rather than isolated transducer drift.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contributing Factor Weights
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Multi-Station Tilt Gradient (Slope)</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">35%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Borehole Extensometer Rate-of-Change</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">30%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Microseismic PPV Acoustic Energy</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">20%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">Pore Water Pressure Anomaly</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">15%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
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
                Transient Filter Active (EWMA alpha = 0.15)
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
              Decoupling between distant panels proves spatial localization of the subsidence basin above Panel P-101.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
