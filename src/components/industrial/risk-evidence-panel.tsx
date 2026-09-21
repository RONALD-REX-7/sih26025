'use client';

import React from 'react';
import { RiskEvidence, AnomalyRecord } from '@/lib/ai/types';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from './risk-badge';
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
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Brain className="h-4 w-4 animate-spin text-slate-400" />
          Initializing AI Anomaly Detection & Sensor Fusion Engine...
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${className || ''}`}>
      {/* Dossier Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
              Explainable Risk Engine & Evidence Dossier
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Model: sih-explainable-ensemble-v1.0 &bull; Evaluated:{' '}
              {new Date(evidence.when.lastEvaluatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge state={riskState} size="sm" />
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-slate-300 dark:border-slate-700 rounded-xs"
          >
            DGMS: {evidence.dgmsComplianceStatus}
          </Badge>
        </div>
      </div>

      <div className="p-3.5 space-y-3 text-xs">
        {/* Why Risk Changed Statement */}
        <div
          className={`p-2.5 rounded-sm border text-xs leading-relaxed ${
            riskState === 'Critical'
              ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200'
              : riskState === 'Warning'
              ? 'bg-orange-50 border-orange-200 text-orange-950 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-200'
              : riskState === 'Watch'
              ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
              : riskState === 'Advisory'
              ? 'bg-blue-50 border-blue-200 text-blue-950 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200'
              : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 opacity-80" />
            <div>
              <div className="font-semibold text-xs tracking-tight">
                {evidence.summary}
              </div>
              <div className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                <span className="font-semibold">Why Risk Changed:</span> {evidence.whyRiskChanged}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Evidence Grid (Clean unified layout with divider) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 rounded-sm p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-500" />
              What Changed
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              {evidence.what}
            </p>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3 text-rose-500" />
              Where (Spatial Topology)
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              Panel: <span className="font-semibold">{evidence.where.panelCode}</span> &bull; Epicenter:{' '}
              <span className="font-semibold">{evidence.where.epicenterNode || 'None'}</span> &bull; Affected:{' '}
              {evidence.where.affectedNodes.length > 0
                ? evidence.where.affectedNodes.join(', ')
                : 'None (Nominal)'}
            </p>
          </div>

          <div className="space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              Persistence & Duration
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              {evidence.howPersistent}
            </p>
          </div>

          <div className="space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <FileText className="h-3 w-3 text-emerald-500" />
              Recommended Operational Action
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              {evidence.whatActionRecommended}
            </p>
          </div>
        </div>

        {/* Dual Correlation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs mb-1 font-mono">
              <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                <Radio className="h-3 w-3 text-indigo-500" />
                Cross-Modality Agreement:
              </span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {(evidence.modalityAgreementScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${
                  evidence.modalityAgreementScore >= 0.7
                    ? 'bg-rose-500'
                    : evidence.modalityAgreementScore >= 0.4
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(evidence.modalityAgreementScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
              <span>Isolated Channel (Noise)</span>
              <span>Multi-Modal Concordance</span>
            </div>
          </div>

          <div className="p-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs mb-1 font-mono">
              <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                <MapPin className="h-3 w-3 text-purple-500" />
                Spatial Topology Correlation:
              </span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {(evidence.spatialCorrelationScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${
                  evidence.spatialCorrelationScore >= 0.7
                    ? 'bg-rose-500'
                    : evidence.spatialCorrelationScore >= 0.3
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(evidence.spatialCorrelationScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
              <span>Single Station (Local)</span>
              <span>Multi-Node Basin (P-101)</span>
            </div>
          </div>
        </div>

        {/* Contributing Factors Matrix */}
        <div className="space-y-1.5 pt-0.5">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Contributing Geotechnical Factors (Ensemble Weights)
          </div>
          <div className="border border-slate-200 dark:border-slate-800 rounded-sm divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {evidence.contributingFactors.map((f, idx) => (
              <div key={idx} className="p-2 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-xs shrink-0 ${
                      f.state === 'critical' ? 'bg-rose-500' : f.state === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-[11px]">
                    {f.factor}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    {f.evidence}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono py-0 px-1 rounded-xs uppercase ${
                      f.state === 'critical'
                        ? 'border-rose-300 text-rose-700 dark:text-rose-400'
                        : f.state === 'elevated'
                        ? 'border-amber-300 text-amber-700 dark:text-amber-400'
                        : 'border-emerald-300 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {f.state} [{(f.weight * 100).toFixed(0)}%]
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Anomalies Count & Principle Note */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Operational Integrity: Anomaly &ne; Risk</span>
          </div>
          <div>
            Active Channel Anomalies: <span className="font-semibold">{activeAnomalies.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
