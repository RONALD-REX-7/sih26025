'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskState } from '@/lib/domain/risk-states';

export interface StatusDotProps {
  status?: 'online' | 'offline' | 'degraded' | 'nominal' | 'active' | 'inactive';
  state?: RiskState;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusDot({ status, state, label, size = 'sm', className }: StatusDotProps) {
  let dotColor = 'bg-[#74808A]';

  if (state) {
    dotColor = {
      Normal: 'bg-[#2F6B4F]',
      Advisory: 'bg-[#9A6A00]',
      Watch: 'bg-[#9A6A00]',
      Warning: 'bg-[#A85A00]',
      Critical: 'bg-[#B42318]',
    }[state] ?? 'bg-[#74808A]';
  } else if (status) {
    dotColor = {
      online: 'bg-[#2F6B4F]',
      nominal: 'bg-[#2F6B4F]',
      active: 'bg-[#2F6B4F]',
      degraded: 'bg-[#A85A00]',
      offline: 'bg-[#74808A]',
      inactive: 'bg-[#74808A]',
    }[status] ?? 'bg-[#74808A]';
  }

  const dotSize = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }[size];

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-[#1D2933]', className)}>
      <span className={cn('rounded-full shrink-0', dotSize, dotColor)} />
      {label && <span>{label}</span>}
    </span>
  );
}
