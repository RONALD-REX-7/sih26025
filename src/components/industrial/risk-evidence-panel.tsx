'use client';

import React from 'react';
import { RiskEvidence, AnomalyRecord } from '@/lib/ai/types';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from './risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Brain,
  Activity,
  MapPin,
  Clock,
  CheckCircle2,
  Radio,
  FileText,
} from 'lucide-react';

interface RiskEvidencePanelProps {
  riskState: RiskState;
  evidence: RiskEvidence | null;
  activeAnomalies?: AnomalyRecord[];
  className?: string;
}

export function RiskEvidencePanel({
  riskState,
  evidence,
  activeAnomalies = [],
  className,
}: RiskEvidencePanelProps) {
  if (!evidence) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Brain className="h-4 w-4 animate-spin text-slate-400" />
          Initializing AI Anomaly Detection & Sensor Fusion Engine...
        </div>
      </Card>
    );
  }

  return (
    <Card className={`border-slate-200 dark:border-slate-800 overflow-hidden ${className || ''}`}>
      {/* Top Banner */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                Explainable Risk Engine & Evidence Dossier
              </CardTitle>
              <p className="text-[11px] text-slate-500 font-mono">
                Model: sih-explainable-ensemble-v1.0 &bull; Evaluated:{' '}
                {new Date(evidence.when.lastEvaluatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RiskBadge state={riskState} size="md" />
            <Badge
              variant="outline"
              className="text-[11px] font-mono border-slate-300 dark:border-slate-700"
            >
              DGMS: {evidence.dgmsComplianceStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Why Risk Changed Statement */}
        <div
          className={`p-3 rounded-lg border leading-relaxed ${
            riskState === 'Critical'
              ? 'bg-red-50/80 border-red-200 text-red-950 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
              : riskState === 'Warning'
              ? 'bg-orange-50/80 border-orange-200 text-orange-950 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-200'
              : riskState === 'Watch'
              ? 'bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
              : riskState === 'Advisory'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 opacity-80" />
            <div>
              <div className="font-semibold text-xs tracking-tight mb-0.5">
                {evidence.summary}
              </div>
              <div className="text-[11px] opacity-90 leading-relaxed font-sans">
                <strong>Why Risk Changed:</strong> {evidence.whyRiskChanged}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Evidence Breakdown: WHAT, WHERE, WHEN, ACTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500" />
              What Changed
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              {evidence.what}
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-red-500" />
              Where (Spatial Topology)
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              Panel: <span className="font-semibold">{evidence.where.panelCode}</span> &bull; Epicenter:{' '}
              <span className="font-semibold">{evidence.where.epicenterNode || 'None'}</span> &bull; Affected:{' '}
              {evidence.where.affectedNodes.length > 0
                ? evidence.where.affectedNodes.join(', ')
                : 'None (Nominal)'}
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Persistence & Duration
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              {evidence.howPersistent}
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <FileText className="h-3 w-3 text-emerald-500" />
              Recommended Operational Action
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              {evidence.whatActionRecommended}
            </p>
          </div>
        </div>

        {/* Dual Gauge Indicators: Sensor Fusion & Spatial Correlation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-500 flex items-center gap-1">
                <Radio className="h-3 w-3 text-indigo-500" />
                Cross-Modality Agreement:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {(evidence.modalityAgreementScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  evidence.modalityAgreementScore >= 0.7
                    ? 'bg-red-500'
                    : evidence.modalityAgreementScore >= 0.4
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(evidence.modalityAgreementScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Isolated Channel (Noise)</span>
              <span>Multi-Modal (Disp+Tilt+Strain)</span>
            </div>
          </div>

          <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-purple-500" />
                Spatial Topology Correlation:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {(evidence.spatialCorrelationScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  evidence.spatialCorrelationScore >= 0.7
                    ? 'bg-red-500'
                    : evidence.spatialCorrelationScore >= 0.3
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(evidence.spatialCorrelationScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Single Station (Local)</span>
              <span>Multi-Node Basin (P-101)</span>
            </div>
          </div>
        </div>

        {/* Contributing Factors Matrix */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Contributing Geotechnical Factors (Ensemble Weights)
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-md divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {evidence.contributingFactors.map((f, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      f.state === 'critical'
                        ? 'bg-red-500'
                        : f.state === 'elevated'
                        ? 'bg-orange-500'
                        : f.state === 'transient'
                        ? 'bg-blue-500'
                        : f.state === 'drift'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {f.factor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">{f.evidence}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono uppercase ${
                      f.state === 'critical'
                        ? 'border-red-300 text-red-700 bg-red-50 dark:bg-red-950/20'
                        : f.state === 'elevated'
                        ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-950/20'
                        : f.state === 'transient'
                        ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/20'
                        : f.state === 'drift'
                        ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/20'
                        : 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                    }`}
                  >
                    {f.state} [{(f.weight * 100).toFixed(0)}%]
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Safety Principle Note */}
        <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Operational Integrity: <strong>Anomaly ≠ Risk</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Active Channel Anomalies: {activeAnomalies.length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
