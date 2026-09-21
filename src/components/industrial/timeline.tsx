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
      <div className="text-center py-10 text-xs text-[#52606D] font-mono-tech">
        No chronological events recorded in current monitoring window.
      </div>
    );
  }

  const getDotColor = (state: RiskState) => {
    switch (state) {
      case 'Critical':
        return 'bg-[#91180E] ring-[#FBEBE9]';
      case 'Warning':
        return 'bg-[#B42318] ring-[#FDF0ED]';
      case 'Watch':
        return 'bg-[#A85A00] ring-[#FCF2E9]';
      case 'Advisory':
        return 'bg-[#9A6A00] ring-[#FBF6E9]';
      default:
        return 'bg-[#2F6B4F] ring-[#EAF2ED]';
    }
  };

  return (
    <div className={cn('relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D7DEDC]', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative">
          {/* Dot Indicator */}
          <span className={cn('absolute -left-6 top-3 h-3 w-3 rounded-full ring-4 shadow-xs', getDotColor(item.riskState))} />

          {/* Timeline Entry Row */}
          <div className="p-4 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech text-[#52606D] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#173B57]" />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {item.location && (
                  <span className="text-xs font-semibold text-[#173B57] font-mono-tech">
                    &bull; {item.location}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ProvenanceBadge provenance={item.provenance} size="sm" />
                <RiskBadge state={item.riskState} size="sm" showLevel={false} />
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#1D2933]">
              {item.title}
            </h4>

            <p className="text-xs text-[#52606D] leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
