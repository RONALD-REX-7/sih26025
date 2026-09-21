'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { USER_ROLES } from '@/lib/domain/constants';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import {
  LogOut,
  Volume2,
  VolumeX,
  Menu,
  User,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

export function TopHeader() {
  const { profile, role, setDemoRole, signOut } = useAuth();
  const { currentRiskState, latestHealths, state: simState } = useSimulatorStore();
  const { activeCount, criticalCount, isAlarmMuted, toggleMuteAlarm, initAlertEngine } = useAlertStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const offlineNodesCount = Object.values(latestHealths).filter((h) => h.status === 'offline').length;
  const onlineCount = Math.max(16 - offlineNodesCount, 0);
  const isSimActive = simState.status === 'running';

  const getRiskColor = (state: string) => {
    switch (state) {
      case 'Critical':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
      case 'Warning':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      case 'Watch':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'Advisory':
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* 1. Mine Identity & Context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger
            className="lg:hidden h-7 w-7 inline-flex items-center justify-center rounded-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 max-w-xs border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <SidebarNav onItemClick={() => setIsMobileOpen(false)} className="w-full h-full border-r-0" />
          </SheetContent>
        </Sheet>

        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-slate-950 dark:text-slate-50 tracking-tight shrink-0">
            Bhowra-West Colliery
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline truncate">
            Jharia Coalfield &bull; Seam VII/VIII
          </span>
        </div>
      </div>

      {/* 2. Operational State (Mode, System Status, Global Risk) */}
      <div className="hidden sm:flex items-center gap-2 text-xs">
        {/* Mode Tag */}
        <span
          className={`font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm border ${
            isSimActive
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
          }`}
        >
          {isSimActive ? `SIM: ${simState.speed}x` : 'DEMO MODE'}
        </span>

        {/* Telemetry Node Status */}
        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <span className="text-slate-400 font-sans mr-1">Fleet:</span>
          <strong className={offlineNodesCount > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}>
            {onlineCount}/16
          </strong> Online
        </span>

        {/* Global Risk State */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[11px] font-mono font-medium ${getRiskColor(currentRiskState)}`}>
          <span className="text-[10px] font-sans font-normal opacity-75">Risk:</span>
          <span className="font-semibold uppercase tracking-wider">{currentRiskState}</span>
        </div>
      </div>

      {/* 3. Alert State & Evaluator User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Active Alert Priority Callout */}
        {activeCount > 0 ? (
          <Link href="/alerts">
            <button
              type="button"
              className={`h-7 px-2 rounded-sm inline-flex items-center gap-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer text-white ${
                criticalCount > 0
                  ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{criticalCount > 0 ? `${criticalCount} CRITICAL` : `${activeCount} ALERT`}</span>
            </button>
          </Link>
        ) : (
          <Link href="/alerts" className="hidden md:inline-flex">
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-2 py-1 rounded-sm">
              0 Active Alerts
            </span>
          </Link>
        )}

        {/* Audio Siren Mute Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMuteAlarm}
          className="h-7 w-7 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isAlarmMuted ? 'Unmute Industrial Siren' : 'Mute Industrial Siren'}
        >
          {isAlarmMuted ? (
            <VolumeX className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Persona Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 px-2 inline-flex items-center justify-center rounded-sm text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 font-normal border border-slate-200 dark:border-slate-800 cursor-pointer">
            <User className="h-3 w-3 text-slate-500" />
            <span className="font-medium hidden sm:inline max-w-[110px] truncate">{role}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md">
            <DropdownMenuLabel className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Evaluator Persona ({profile?.full_name ?? 'Operator'})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USER_ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setDemoRole(r)}
                className={`cursor-pointer text-xs py-1.5 ${role === r ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-sky-700 dark:text-sky-400' : ''}`}
              >
                {r === 'SafetyOfficer' && '🛡️ Safety Officer'}
                {r === 'MineManager' && '👷 Mine Manager'}
                {r === 'Engineer' && '🔬 Geotechnical Engineer'}
                {r === 'Administrator' && '⚙️ System Administrator'}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-xs text-rose-600 py-1.5">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Reset Persona Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
