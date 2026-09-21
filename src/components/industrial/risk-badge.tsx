import React from 'react';
import { RiskState, getRiskStateConfig } from '@/lib/domain/risk-states';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Info, Eye, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  state: RiskState;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLevel?: boolean;
  className?: string;
}

const RISK_ICONS: Record<RiskState, React.ComponentType<{ className?: string }>> = {
  Normal: ShieldCheck,
  Advisory: Info,
  Watch: Eye,
  Warning: AlertTriangle,
  Critical: AlertOctagon,
};

export function RiskBadge({
  state,
  size = 'md',
  showIcon = true,
  showLevel = true,
  className,
}: RiskBadgeProps) {
  const config = getRiskStateConfig(state);
  const Icon = RISK_ICONS[state];

  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2 gap-1',
    md: 'text-xs py-1 px-2.5 gap-1.5 font-medium',
    lg: 'text-sm py-1.5 px-3 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4.5 w-4.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono-tech uppercase tracking-wide inline-flex items-center font-semibold rounded-sm border',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'shrink-0')} />}
      <span>{config.label}</span>
      {showLevel && (
        <span className="opacity-75 text-xs font-mono-tech font-normal ml-1">
          [L{config.severityLevel}]
        </span>
      )}
    </Badge>
  );
}
