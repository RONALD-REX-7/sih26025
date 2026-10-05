'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { usePerspective, ViewPerspective } from '@/lib/auth/perspective-context';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { useOfflineStore } from '@/lib/offline/offline-store';
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
import { JudgeDemoModal } from '@/components/demo/judge-demo-modal';
import {
  Volume2,
  VolumeX,
  Menu,
  User,
  ChevronDown,
  Play,
  Wifi,
  WifiOff,
  Sparkles,
  Eye,
  RefreshCw,
} from 'lucide-react';

export function TopHeader() {
  const { role, setDemoRole } = useAuth();
  const { perspective, setPerspective } = usePerspective();
  const { currentRiskState, latestHealths, state: simState } = useSimulatorStore();
  const { activeCount, criticalCount, isAlarmMuted, toggleMuteAlarm, initAlertEngine } = useAlertStore();
  const {
    isBrowserOnline,
    isSimulatedOffline,
    syncState,
    pendingQueueCount,
    toggleSimulatedNetworkLoss,
  } = useOfflineStore();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);

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
    <>
      <header className="h-12 border-b border-[#D7DEDC] bg-[#FFFFFF] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none overflow-x-hidden">
        {/* 1. Mine Identity, Mobile Hamburger, & Context */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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

          <div className="flex items-baseline gap-1.5 sm:gap-2.5 min-w-0">
            <span className="font-bold text-xs sm:text-sm text-[#173B57] tracking-tight shrink-0">
              MineGuard
            </span>
            <span className="text-xs text-[#52606D] hidden md:inline truncate">
              &bull; Bhowra-West Colliery (Seam VII/VIII)
            </span>
          </div>

          {/* Condition Badge (Visible at ALL screen sizes including 375px) */}
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-sm text-[11px] sm:text-xs font-semibold border ${getRiskStyle(
              currentRiskState
            )}`}
            title={`Current Geotechnical Risk State: ${currentRiskState}`}
          >
            {currentRiskState.toUpperCase()}
          </span>
        </div>

        {/* 2. Operational Vitals (Mid Screens+) */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs">
          {/* Mode Tag */}
          <span className="font-mono-tech text-[11px] uppercase px-2 py-0.5 rounded-sm border border-[#D7DEDC] bg-[#EDF1F0] text-[#52606D] font-medium">
            {isSimActive ? `SIM: ${simState.speed}x` : 'DEMO MODE'}
          </span>

          <span className="text-[#D7DEDC]">|</span>

          {/* Fleet Health */}
          <div className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="h-2 w-2 rounded-full bg-[#2F6B4F]" />
            <span>Fleet:</span>
            <span className="font-mono-tech text-xs font-semibold text-[#1D2933]">{onlineCount}/16</span>
          </div>

          {/* Offline / Sync State Pill */}
          <span className="text-[#D7DEDC]">|</span>
          <div className="flex items-center gap-1.5">
            {isSimulatedOffline ? (
              <span className="px-1.5 py-0.5 rounded-sm bg-[#FBEBE9] text-[#91180E] font-mono-tech text-[10px] font-bold border border-[#B42318] flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                OFFLINE
              </span>
            ) : syncState === 'SYNCING' ? (
              <span className="px-1.5 py-0.5 rounded-sm bg-[#FCF2E9] text-[#A85A00] font-mono-tech text-[10px] font-bold border border-[#A85A00] flex items-center gap-1 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                SYNCING
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-sm bg-[#EAF2ED] text-[#2F6B4F] font-mono-tech text-[10px] font-bold border border-[#2F6B4F] flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                ONLINE
              </span>
            )}

            {pendingQueueCount > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-sm bg-[#FBF6E9] text-[#9A6A00] font-mono-tech text-[10px] font-semibold border border-[#9A6A00]"
                title="Pending local offline action queue"
              >
                Q:{pendingQueueCount}
              </span>
            )}
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Judge Demo Quick Launcher */}
          <Button
            size="sm"
            onClick={() => setIsJudgeModalOpen(true)}
            className="h-7 px-2 text-[11px] sm:text-xs bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-semibold rounded-sm flex items-center gap-1 cursor-pointer"
            title="Launch 60-second guided Judge Demonstration"
          >
            <Sparkles className="h-3 w-3 text-[#FDF0ED] fill-current" />
            <span className="hidden sm:inline">Judge Demo</span>
          </Button>

          {/* Network Loss Simulator Toggle */}
          <button
            type="button"
            onClick={toggleSimulatedNetworkLoss}
            aria-label={isSimulatedOffline ? 'Restore Network Connection' : 'Simulate Network Loss (Offline Test)'}
            className={`h-7 px-2 text-[11px] font-medium rounded-sm border flex items-center gap-1 transition-colors cursor-pointer ${
              isSimulatedOffline
                ? 'border-[#B42318] bg-[#FBEBE9] text-[#91180E] hover:bg-[#FDF0ED]'
                : 'border-[#D7DEDC] bg-[#FFFFFF] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
            title={isSimulatedOffline ? 'Restore Connection (Triggers Sync)' : 'Simulate Network Loss (Offline Demonstration)'}
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="h-3 w-3 text-[#B42318]" />
                <span className="hidden md:inline">Offline (Sim)</span>
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 text-[#2F6B4F]" />
                <span className="hidden md:inline">Sim Net Loss</span>
              </>
            )}
          </button>

          {/* Perspective View Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-7 px-2 text-xs font-medium rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-[#1D2933] hover:bg-[#EDF1F0] flex items-center gap-1 cursor-pointer"
              aria-label={`View perspective: ${perspective}`}
            >
              <Eye className="h-3.5 w-3.5 text-[#173B57]" aria-hidden="true" />
              <span className="hidden xl:inline">{perspective}</span>
              <ChevronDown className="h-3 w-3 text-[#5B6871]" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs bg-[#FFFFFF] border-[#D7DEDC] text-[#1D2933]">
              <DropdownMenuLabel className="text-xs text-[#5B6871]">Judge View Perspective</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#D7DEDC]" />
              <DropdownMenuItem
                onClick={() => setPerspective('OPERATOR')}
                className={`cursor-pointer text-xs ${perspective === 'OPERATOR' ? 'bg-[#EDF1F0] font-bold text-[#173B57]' : ''}`}
              >
                Operator (Live Telemetry & Alerts)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPerspective('PLANNER')}
                className={`cursor-pointer text-xs ${perspective === 'PLANNER' ? 'bg-[#EDF1F0] font-bold text-[#173B57]' : ''}`}
              >
                Planner (Forecast & Subsidence Basin)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPerspective('REGULATOR')}
                className={`cursor-pointer text-xs ${perspective === 'REGULATOR' ? 'bg-[#EDF1F0] font-bold text-[#173B57]' : ''}`}
              >
                Regulator (Audit & CMR 112 Evidence)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Audible Siren Toggle */}
          <button
            type="button"
            onClick={toggleMuteAlarm}
            aria-label={isAlarmMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
            className={`h-7 px-2 text-xs font-medium rounded-sm border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAlarmMuted
                ? 'border-[#D7DEDC] bg-[#EDF1F0] text-[#5B6871] hover:bg-[#D7DEDC]'
                : 'border-[#173B57] bg-[#FFFFFF] text-[#173B57] hover:bg-[#EDF1F0]'
            }`}
            title={isAlarmMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
          >
            {isAlarmMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Siren Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#173B57]" aria-hidden="true" />
                <span className="hidden lg:inline">Siren Ready</span>
              </>
            )}
          </button>

          {/* Persona Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-7 px-2 text-xs font-medium rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-[#1D2933] hover:bg-[#EDF1F0] flex items-center gap-1.5 cursor-pointer"
              aria-label={`Switch persona. Current persona: ${role}`}
            >
              <User className="h-3.5 w-3.5 text-[#173B57]" aria-hidden="true" />
              <span className="hidden sm:inline">{role}</span>
              <ChevronDown className="h-3 w-3 text-[#5B6871]" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs bg-[#FFFFFF] border-[#D7DEDC] text-[#1D2933]">
              <DropdownMenuLabel className="text-xs text-[#5B6871]">Operational Persona</DropdownMenuLabel>
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

          {/* Simulator Quick Link */}
          <Link href="/simulator">
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-medium rounded-sm"
            >
              <Play className="h-3 w-3 mr-1 fill-current" aria-hidden="true" />
              <span className="hidden sm:inline">Simulator</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Interactive Judge Demo Modal */}
      <JudgeDemoModal open={isJudgeModalOpen} onOpenChange={setIsJudgeModalOpen} />
    </>
  );
}
