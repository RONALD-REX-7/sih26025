import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Inbox, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StateContainerProps {
  type: 'empty' | 'loading' | 'offline' | 'error';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function StateContainer({
  type,
  title,
  description,
  action,
  className,
}: StateContainerProps) {
  if (type === 'loading') {
    return (
      <Card className={cn('border-slate-200 dark:border-slate-800 p-6', className)}>
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const icons = {
    empty: Inbox,
    offline: WifiOff,
    error: AlertTriangle,
  };

  const iconColors = {
    empty: 'text-slate-400 bg-slate-100 dark:bg-slate-900',
    offline: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    error: 'text-red-600 bg-red-50 dark:bg-red-950/30',
  };

  const Icon = icons[type];

  return (
    <Card className={cn('border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 p-8 text-center', className)}>
      <CardContent className="p-0 flex flex-col items-center justify-center space-y-3">
        <div className={cn('p-3 rounded-full', iconColors[type])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
