import React from 'react';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskBadge } from './risk-badge';
import { ProvenanceBadge } from './provenance-badge';
import { DataProvenance } from '@/lib/domain/provenance';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface TimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  riskState: RiskState;
  provenance: DataProvenance;
  location?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-slate-500 font-mono">
        No chronological events recorded in current monitoring window.
      </div>
    );
  }

  return (
    <div className={cn('relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Dot Indicator */}
          <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 bg-slate-900 dark:bg-slate-100 shadow-xs" />

          {/* Timeline Card */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {item.location && (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
                    &bull; {item.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <ProvenanceBadge provenance={item.provenance} size="sm" />
                <RiskBadge state={item.riskState} size="sm" showLevel={false} />
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {item.title}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
