import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterToolbarProps {
  selectedPanel: string;
  onSelectPanel: (panel: string) => void;
  panels?: string[];
  totalItemsCount?: number;
  className?: string;
}

const DEFAULT_PANELS = ['ALL', 'P-101 (North)', 'P-102 (East)', 'P-103 (Central)', 'P-104 (South)'];

export function FilterToolbar({
  selectedPanel,
  onSelectPanel,
  panels = DEFAULT_PANELS,
  totalItemsCount,
  className,
}: FilterToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="flex items-center gap-1 text-slate-500 mr-1 font-mono text-[11px]">
          <Layers className="h-3.5 w-3.5" />
          Panel Filter:
        </span>
        {panels.map((p) => {
          const isSelected = selectedPanel === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onSelectPanel(p)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border',
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      {totalItemsCount !== undefined && (
        <Badge variant="outline" className="text-[11px] font-mono py-0.5 px-2 bg-slate-50 dark:bg-slate-900">
          Showing {totalItemsCount} Nodes
        </Badge>
      )}
    </div>
  );
}
