import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProvenanceBadge } from './provenance-badge';
import { DataProvenance } from '@/lib/domain/provenance';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from './risk-badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricBlockProps {
  label: string;
  channelCode: string;
  value: number;
  unit: string;
  nominalRange: [number, number];
  riskState?: RiskState;
  rateOfChange?: number; // per minute
  provenance?: DataProvenance;
  className?: string;
}

export function MetricBlock({
  label,
  channelCode,
  value,
  unit,
  nominalRange,
  riskState = 'Normal',
  rateOfChange,
  provenance = 'DEMO',
  className,
}: MetricBlockProps) {
  const [minNominal, maxNominal] = nominalRange;
  const isOutOfNominal = value < minNominal || value > maxNominal;

  // Percentage within nominal span for visual bar
  const span = Math.max(maxNominal - minNominal, 1);
  const clampedPct = Math.min(Math.max(((value - minNominal) / span) * 100, 0), 100);

  return (
    <Card className={cn('border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5', className)}>
      <CardContent className="p-0 space-y-2.5">
        {/* Header: Label & Provenance */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{label}</span>
            <span className="font-mono text-[10px] text-slate-400">({channelCode})</span>
          </div>
          <ProvenanceBadge provenance={provenance} size="sm" />
        </div>

        {/* Big Reading Value */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-2xl font-black font-mono tracking-tight', isOutOfNominal ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100')}>
              {value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">{unit}</span>
          </div>
          <RiskBadge state={riskState} size="sm" showLevel={false} />
        </div>

        {/* Range Bar Indicator */}
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                riskState === 'Critical' ? 'bg-red-500' : riskState === 'Warning' ? 'bg-orange-500' : 'bg-emerald-500'
              )}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>Min {minNominal}</span>
            <span>Nominal Range</span>
            <span>Max {maxNominal}</span>
          </div>
        </div>

        {/* Rate of Change Footer */}
        {rateOfChange !== undefined && (
          <div className="pt-1 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Rate of Change:</span>
            <span className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300">
              {rateOfChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-amber-500" />
              ) : rateOfChange < 0 ? (
                <TrendingDown className="h-3 w-3 text-blue-500" />
              ) : (
                <Minus className="h-3 w-3 text-slate-400" />
              )}
              {rateOfChange.toFixed(2)} {unit}/min
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
