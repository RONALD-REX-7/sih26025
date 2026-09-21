'use client';

import React from 'react';
import { RiskEvidence, AnomalyRecord } from '@/lib/ai/types';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from './risk-badge';
import {
  ShieldAlert,
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
      <div className="rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] p-4 text-[#52606D]">
        <div className="flex items-center gap-2 text-xs font-mono-tech">
          <Activity className="h-4 w-4 animate-spin text-[#173B57]" />
          Computing sensor fusion & risk assessment...
        </div>
      </div>
    );
  }

  const getRiskBannerStyle = (state: RiskState) => {
    switch (state) {
      case 'Critical':
        return 'bg-[#FBEBE9] border-[#91180E] text-[#91180E]';
      case 'Warning':
        return 'bg-[#FDF0ED] border-[#B42318] text-[#B42318]';
      case 'Watch':
        return 'bg-[#FCF2E9] border-[#A85A00] text-[#A85A00]';
      case 'Advisory':
        return 'bg-[#FBF6E9] border-[#9A6A00] text-[#9A6A00]';
      default:
        return 'bg-[#EAF2ED] border-[#2F6B4F] text-[#2F6B4F]';
    }
  };

  return (
    <div className={`rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] overflow-hidden ${className || ''}`}>
      {/* Dossier Header */}
      <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-[#173B57] tracking-tight">
            Explainable Risk Assessment & Evidence Dossier
          </div>
          <p className="text-xs text-[#52606D] font-mono-tech">
            Evaluated: {new Date(evidence.when.lastEvaluatedAt).toLocaleTimeString()} &bull; DGMS Status: {evidence.dgmsComplianceStatus}
          </p>
        </div>

        <RiskBadge state={riskState} size="sm" />
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Why Risk Changed Banner */}
        <div className={`p-3 rounded-sm border ${getRiskBannerStyle(riskState)}`}>
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-sm tracking-tight leading-snug">
                {evidence.summary}
              </div>
              <div className="text-xs leading-relaxed mt-1 opacity-90">
                <span className="font-semibold">Evidence Justification:</span> {evidence.whyRiskChanged}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Part Evidence Grid */}
        <div className="border border-[#D7DEDC] rounded-sm bg-[#FFFFFF] divide-y divide-[#D7DEDC]">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC]">
            <div className="p-3 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#173B57]" />
                What Changed
              </div>
              <p className="text-xs text-[#1D2933] font-mono-tech leading-relaxed">
                {evidence.what}
              </p>
            </div>

            <div className="p-3 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#173B57]" />
                Where (Spatial Location)
              </div>
              <p className="text-xs text-[#1D2933] font-mono-tech leading-relaxed">
                Panel: <span className="font-semibold">{evidence.where.panelCode}</span> &bull; Epicenter:{' '}
                <span className="font-semibold">{evidence.where.epicenterNode || 'None'}</span> &bull; Affected:{' '}
                {evidence.where.affectedNodes.length > 0
                  ? evidence.where.affectedNodes.join(', ')
                  : 'None (Nominal)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC]">
            <div className="p-3 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#173B57]" />
                Persistence & Duration
              </div>
              <p className="text-xs text-[#1D2933] font-mono-tech leading-relaxed">
                {evidence.howPersistent}
              </p>
            </div>

            <div className="p-3 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#173B57]" />
                Statutory Action Recommended
              </div>
              <p className="text-xs text-[#1D2933] font-mono-tech leading-relaxed">
                {evidence.whatActionRecommended}
              </p>
            </div>
          </div>
        </div>

        {/* Dual Correlation Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-sm border border-[#D7DEDC] bg-[#F8FAF9]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono-tech">
              <span className="text-[#52606D] flex items-center gap-1.5 font-sans">
                <Radio className="h-3.5 w-3.5 text-[#173B57]" />
                Sensor Agreement:
              </span>
              <span className="font-bold tabular-nums text-[#1D2933]">
                {(evidence.modalityAgreementScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-[#EDF1F0] h-2 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${
                  evidence.modalityAgreementScore >= 0.7
                    ? 'bg-[#B42318]'
                    : evidence.modalityAgreementScore >= 0.4
                    ? 'bg-[#A85A00]'
                    : 'bg-[#2F6B4F]'
                }`}
                style={{ width: `${Math.max(evidence.modalityAgreementScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#74808A] font-mono-tech mt-1">
              <span>Isolated Channel</span>
              <span>Multi-Transducer</span>
            </div>
          </div>

          <div className="p-3 rounded-sm border border-[#D7DEDC] bg-[#F8FAF9]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono-tech">
              <span className="text-[#52606D] flex items-center gap-1.5 font-sans">
                <MapPin className="h-3.5 w-3.5 text-[#173B57]" />
                Spatial Correlation:
              </span>
              <span className="font-bold tabular-nums text-[#1D2933]">
                {(evidence.spatialCorrelationScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-[#EDF1F0] h-2 rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${
                  evidence.spatialCorrelationScore >= 0.7
                    ? 'bg-[#B42318]'
                    : evidence.spatialCorrelationScore >= 0.3
                    ? 'bg-[#A85A00]'
                    : 'bg-[#2F6B4F]'
                }`}
                style={{ width: `${Math.max(evidence.spatialCorrelationScore * 100, 4)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#74808A] font-mono-tech mt-1">
              <span>Local Point</span>
              <span>Basin-Wide</span>
            </div>
          </div>
        </div>

        {/* Contributing Factors List */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#74808A]">
            Contributing Factors & Weights
          </div>
          <div className="border border-[#D7DEDC] rounded-sm divide-y divide-[#D7DEDC] bg-[#FFFFFF]">
            {evidence.contributingFactors.map((f, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      f.state === 'critical' ? 'bg-[#91180E]' : f.state === 'elevated' ? 'bg-[#A85A00]' : 'bg-[#2F6B4F]'
                    }`}
                  />
                  <span className="font-medium text-[#1D2933] truncate">
                    {f.factor}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[#52606D] font-mono-tech hidden sm:inline">
                    {f.evidence}
                  </span>
                  <span className="text-xs font-mono-tech font-semibold text-[#1D2933]">
                    {(f.weight * 100).toFixed(0)}% weight
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Principle Footer */}
        <div className="flex items-center justify-between text-xs text-[#52606D] font-mono-tech pt-1 border-t border-[#D7DEDC]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B4F]" />
            <span>Principle: Anomaly &ne; Risk</span>
          </div>
          <div>
            Active Anomalies: <span className="font-semibold text-[#1D2933]">{activeAnomalies.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
