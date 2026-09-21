'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { USER_ROLES } from '@/lib/domain/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Bell,
  LogOut,
  Radio,
  Volume2,
  VolumeX,
  PlayCircle,
  Menu,
  User,
  ChevronDown,
  Play,
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
  const onlineCount = 16 - offlineNodesCount;
  const isSimActive = simState.status === 'running';

  return (
    <header className="h-13 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle + Colliery Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger
            className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 max-w-xs border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <SidebarNav onItemClick={() => setIsMobileOpen(false)} className="w-full h-full border-r-0" />
          </SheetContent>
        </Sheet>

        {/* Colliery Identity */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center font-bold font-mono text-xs border border-slate-700 shrink-0">
            BW
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100">
                Bhowra-West
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">JHR-001</span>
              <Badge
                variant="outline"
                className={`text-[9px] font-mono py-0 px-1 rounded-xs hidden sm:inline-flex ${
                  isSimActive
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200'
                }`}
              >
                {isSimActive ? 'SIM ACTIVE' : 'DEMO'}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              Jharia Coalfield &bull; DGMS Dhanbad Circle
            </p>
          </div>
        </div>
      </div>

      {/* Center: Operational Telemetry & Risk Pulse (hidden on small mobile, visible sm+) */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        {isSimActive && (
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-mono hover:bg-amber-500/20 transition-colors"
          >
            <PlayCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 animate-spin" />
            <span className="truncate max-w-[130px]">{simState.scenarioId}</span>
            <span>({simState.speed}x)</span>
          </Link>
        )}

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px]">
          <Radio className={`h-3 w-3 ${offlineNodesCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-slate-500 font-medium hidden lg:inline">Telemetry:</span>
          <span className={`font-mono font-semibold ${offlineNodesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {onlineCount}/16 Online
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[11px] font-mono ${
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
          <span className="relative flex h-1.5 w-1.5">
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              currentRiskState === 'Critical' || currentRiskState === 'Warning' ? 'bg-rose-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="text-slate-500 font-sans font-medium hidden lg:inline">Risk:</span>
          <span className="font-semibold uppercase tracking-wide">
            {currentRiskState}
          </span>
        </div>
      </div>

      {/* Right: Evaluator Persona Switcher, Audio, Bell, Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick link to simulator */}
        <Link href="/simulator">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[11px] font-medium border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Play className="h-2.5 w-2.5 mr-1 text-amber-500 fill-amber-500" />
            <span className="hidden sm:inline">Simulator</span>
          </Button>
        </Link>

        {/* Siren Mute Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMuteAlarm}
          className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={isAlarmMuted ? 'Unmute Audio Alarm Siren' : 'Mute Audio Alarm Siren'}
        >
          {isAlarmMuted ? (
            <VolumeX className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
          )}
        </Button>

        {/* Live Notification Bell with Active Count */}
        <Link href="/alerts">
          <Button variant="ghost" size="icon" className="h-7 w-7 relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-3.5 w-3.5" />
            {activeCount > 0 ? (
              <span className={`absolute -top-0.5 -right-0.5 h-3.5 min-w-[0.875rem] px-0.5 rounded-xs text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
              }`}>
                {activeCount}
              </span>
            ) : null}
          </Button>
        </Link>

        {/* Persona Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 px-1.5 inline-flex items-center justify-center rounded-sm text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1 font-normal cursor-pointer">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold hidden sm:inline max-w-[100px] truncate">{role}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DropdownMenuLabel className="text-[11px] text-slate-500 font-mono">
              Evaluator Persona ({profile?.full_name ?? 'Operator'})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USER_ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setDemoRole(r)}
                className={`cursor-pointer text-xs py-1.5 ${role === r ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-amber-600 dark:text-amber-400' : ''}`}
              >
                {r === 'SafetyOfficer' && '🛡️ Safety Officer (Evacuation & Alerts)'}
                {r === 'MineManager' && '👷 Mine Manager (Panels & Operations)'}
                {r === 'Engineer' && '🔬 Geotech Engineer (Telemetry & InSAR)'}
                {r === 'Administrator' && '⚙️ Administrator (Audit & System)'}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-xs text-red-600 py-1.5">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Reset Session Persona
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
