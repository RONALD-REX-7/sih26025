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
    sm: 'text-xs py-0.5 px-1.5 font-mono-tech tracking-wider',
    md: 'text-xs py-0.5 px-2 font-mono-tech tracking-wider font-semibold',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'uppercase border rounded-sm shadow-none inline-flex items-center',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      <span>{config.label}</span>
    </Badge>
  );
}
