'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  MapPin,
  Cpu,
  Activity,
  TrendingUp,
  AlertOctagon,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  Radio,
  Server,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlertStore } from '@/lib/alerts/alert-store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAlert?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'SURVEILLANCE',
    items: [
      { name: 'Command Surface', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Mine & Panels', href: '/mine', icon: Layers },
      { name: 'Underground GIS', href: '/gis', icon: MapPin },
      { name: 'Station Telemetry', href: '/telemetry', icon: Radio },
    ],
  },
  {
    groupName: 'INTELLIGENCE',
    items: [
      { name: 'Node Fleet', href: '/nodes', icon: Server },
      { name: 'Sensor Matrix', href: '/sensors', icon: Cpu },
      { name: 'Event Ledger', href: '/events', icon: Activity },
      { name: 'AI Risk Engine', href: '/analytics', icon: TrendingUp },
      { name: 'Strata Simulator', href: '/simulator', icon: Play },
    ],
  },
  {
    groupName: 'OPERATIONS',
    items: [
      { name: 'Incident Center', href: '/alerts', icon: AlertOctagon, isAlert: true },
      { name: 'Infrastructure', href: '/infrastructure', icon: Building2 },
    ],
  },
  {
    groupName: 'COMPLIANCE',
    items: [
      { name: 'Statutory Audit', href: '/audit', icon: ClipboardList },
      { name: 'Form IV Reports', href: '/reports', icon: FileSpreadsheet },
      { name: 'Safety Thresholds', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarNavProps {
  className?: string;
  onItemClick?: () => void;
}

export function SidebarNav({ className, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { activeCount, criticalCount } = useAlertStore();

  return (
    <aside className={cn('w-60 border-r border-[#D7DEDC] bg-[#FFFFFF] flex flex-col shrink-0 select-none', className)}>
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9]">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-sm bg-[#173B57] text-[#FFFFFF] flex items-center justify-center font-mono-tech font-bold text-xs shrink-0">
            25
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm tracking-tight text-[#173B57]">
              SIH26025 &bull; CMR 112
            </div>
            <p className="text-xs text-[#52606D] truncate">
              Strata Early Warning
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#74808A]">
              {group.groupName}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href === '/dashboard' && pathname === '/');
                const Icon = item.icon;
                const hasAlertBadge = item.isAlert && activeCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 rounded-sm text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-[#173B57] text-[#FFFFFF]'
                        : 'text-[#52606D] hover:bg-[#EDF1F0] hover:text-[#1D2933]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#FFFFFF]' : 'text-[#74808A]')} />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {hasAlertBadge && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-sm text-xs font-mono-tech font-bold',
                          criticalCount > 0 ? 'bg-[#FBEBE9] text-[#B42318]' : 'bg-[#FBF6E9] text-[#9A6A00]'
                        )}
                      >
                        {activeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#D7DEDC] bg-[#F8FAF9] text-xs text-[#74808A] flex items-center justify-between font-mono-tech">
        <span>Bhowra-West</span>
        <span>DGMS v1.0</span>
      </div>
    </aside>
  );
}
