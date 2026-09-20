import React from 'react';
import { DataProvenance, getProvenanceConfig } from '@/lib/domain/provenance';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProvenanceBadgeProps {
  provenance: DataProvenance;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProvenanceBadge({
  provenance,
  size = 'md',
  className,
}: ProvenanceBadgeProps) {
  const config = getProvenanceConfig(provenance);

  const sizeClasses = {
    sm: 'text-[9px] py-0 px-1 font-mono tracking-wider',
    md: 'text-[10px] py-0.5 px-1.5 font-mono tracking-wider font-semibold',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'uppercase border rounded shadow-none inline-flex items-center gap-1',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      <span className="h-1 w-1 rounded-full bg-white/70 inline-block shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}
