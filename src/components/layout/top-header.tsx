'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  LogOut,
  Radio,
} from 'lucide-react';

export function TopHeader() {
  const { profile, role, signOut } = useAuth();
  const { currentRiskState, latestHealths } = useSimulatorStore();

  const offlineNodesCount = Object.values(latestHealths).filter((h) => h.status === 'offline').length;
  const onlineCount = 16 - offlineNodesCount;

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Colliery Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center font-bold font-mono text-sm border border-slate-700">
            BW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Bhowra-West Colliery
              </h2>
              <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono text-slate-500 border-slate-300 dark:border-slate-700">
                JHR-001
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Jharia Coalfield &bull; Dhanbad Central DGMS Circle
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Operational Telemetry Pulse */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <Radio className={`h-3.5 w-3.5 ${offlineNodesCount > 0 ? 'text-amber-500' : 'text-emerald-500'} animate-pulse`} />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Edge Telemetry:</span>
          <span className={`font-mono font-semibold ${offlineNodesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {onlineCount}/16 Nodes Online
          </span>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1 rounded border ${
          currentRiskState === 'Critical'
            ? 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400'
            : currentRiskState === 'Warning'
            ? 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400'
            : currentRiskState === 'Watch'
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
            : currentRiskState === 'Advisory'
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400'
            : 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              currentRiskState === 'Critical' || currentRiskState === 'Warning' ? 'bg-rose-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              currentRiskState === 'Critical' || currentRiskState === 'Warning' ? 'bg-rose-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">Mine Risk State:</span>
          <span className="font-semibold uppercase tracking-wider font-mono">
            {currentRiskState}
          </span>
        </div>
      </div>

      {/* Right: User Role & Actions */}
      <div className="flex items-center gap-2">
        <Link href="/alerts">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative text-slate-600 dark:text-slate-300">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-slate-400" />
          </Button>
        </Link>

        <div className="hidden sm:flex flex-col items-end text-right mr-1">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {profile?.full_name ?? 'Operational User'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {role}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="h-8 text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-red-600"
          title="Sign out or reset persona"
        >
          <LogOut className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </header>
  );
}
