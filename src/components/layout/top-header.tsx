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
  Volume2,
  VolumeX,
  Menu,
  User,
  ChevronDown,
  Play,
} from 'lucide-react';

export function TopHeader() {
  const { role, setDemoRole } = useAuth();
  const { currentRiskState, latestHealths, state: simState } = useSimulatorStore();
  const { activeCount, criticalCount, isAlarmMuted, toggleMuteAlarm, initAlertEngine } = useAlertStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const offlineNodesCount = Object.values(latestHealths).filter((h) => h.status === 'offline').length;
  const onlineCount = Math.max(16 - offlineNodesCount, 0);
  const isSimActive = simState.status === 'running';

  const getRiskStyle = (state: string) => {
    switch (state) {
      case 'Critical':
        return 'bg-[#FBEBE9] text-[#91180E] border-[#B42318]';
      case 'Warning':
        return 'bg-[#FDF0ED] text-[#B42318] border-[#A85A00]';
      case 'Watch':
        return 'bg-[#FCF2E9] text-[#A85A00] border-[#A85A00]';
      case 'Advisory':
        return 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]';
      default:
        return 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]';
    }
  };

  return (
    <header className="h-12 border-b border-[#D7DEDC] bg-[#FFFFFF] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* 1. Mine Identity & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger
            className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-sm text-[#1D2933] hover:bg-[#EDF1F0] cursor-pointer shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 max-w-xs border-r border-[#D7DEDC] bg-[#FFFFFF]">
            <SidebarNav onItemClick={() => setIsMobileOpen(false)} className="w-full h-full border-r-0" />
          </SheetContent>
        </Sheet>

        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="font-semibold text-sm text-[#1D2933] tracking-tight shrink-0">
            Bhowra-West Colliery
          </span>
          <span className="text-xs text-[#52606D] hidden md:inline truncate">
            Jharia Coalfield &bull; Seam VII/VIII (185m–265m)
          </span>
        </div>
      </div>

      {/* 2. Operational Vitals */}
      <div className="hidden sm:flex items-center gap-3 text-xs">
        {/* Mode Tag */}
        <span className="font-mono-tech text-xs uppercase px-2 py-0.5 rounded-sm border border-[#D7DEDC] bg-[#EDF1F0] text-[#52606D] font-medium">
          {isSimActive ? `SIM: ${simState.speed}x` : 'DEMO MODE'}
        </span>

        <span className="text-[#D7DEDC]">|</span>

        {/* Global Condition */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#52606D]">Condition:</span>
          <span className={`px-2 py-0.5 rounded-sm text-xs font-semibold border ${getRiskStyle(currentRiskState)}`}>
            {currentRiskState.toUpperCase()}
          </span>
        </div>

        <span className="text-[#D7DEDC]">|</span>

        {/* Telemetry Health */}
        <div className="flex items-center gap-1.5 text-xs text-[#52606D]">
          <span className="h-2 w-2 rounded-full bg-[#2F6B4F]" />
          <span>Fleet:</span>
          <span className="font-mono-tech text-xs font-semibold text-[#1D2933]">{onlineCount}/16</span>
        </div>

        {activeCount > 0 && (
          <>
            <span className="text-[#D7DEDC]">|</span>
            <Link
              href="/alerts"
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold ${
                criticalCount > 0
                  ? 'bg-[#FBEBE9] text-[#B42318]'
                  : 'bg-[#FBF6E9] text-[#9A6A00]'
              }`}
            >
              <span>{activeCount} {activeCount === 1 ? 'Alert' : 'Alerts'}</span>
            </Link>
          </>
        )}
      </div>

      {/* 3. Operational Controls */}
      <div className="flex items-center gap-2">
        {/* Audible Siren Toggle */}
        <button
          onClick={toggleMuteAlarm}
          className={`h-7 px-2 text-xs font-medium rounded-sm border flex items-center gap-1.5 transition-colors cursor-pointer ${
            isAlarmMuted
              ? 'border-[#D7DEDC] bg-[#EDF1F0] text-[#74808A] hover:bg-[#D7DEDC]'
              : 'border-[#173B57] bg-[#FFFFFF] text-[#173B57] hover:bg-[#EDF1F0]'
          }`}
          title={isAlarmMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
        >
          {isAlarmMuted ? (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Siren Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5 text-[#173B57]" />
              <span className="hidden md:inline">Siren Ready</span>
            </>
          )}
        </button>

        {/* Persona Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 px-2 text-xs font-medium rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-[#1D2933] hover:bg-[#EDF1F0] flex items-center gap-1.5 cursor-pointer">
            <User className="h-3.5 w-3.5 text-[#173B57]" />
            <span className="hidden sm:inline">{role}</span>
            <ChevronDown className="h-3 w-3 text-[#74808A]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs bg-[#FFFFFF] border-[#D7DEDC] text-[#1D2933]">
            <DropdownMenuLabel className="text-xs text-[#74808A]">Operational Persona</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#D7DEDC]" />
            {USER_ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setDemoRole(r)}
                className={`cursor-pointer text-xs ${
                  role === r ? 'bg-[#EDF1F0] font-semibold text-[#173B57]' : 'hover:bg-[#EDF1F0]'
                }`}
              >
                {r === 'SafetyOfficer' && 'Safety Officer (CMR 112)'}
                {r === 'MineManager' && 'Mine Manager (Operations)'}
                {r === 'Engineer' && 'Geotech Engineer (Sensors)'}
                {r === 'Administrator' && 'Administrator (Audit)'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Simulator Link */}
        <Link href="/simulator">
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-medium rounded-sm"
          >
            <Play className="h-3 w-3 mr-1 fill-current" />
            <span className="hidden sm:inline">Simulator</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
