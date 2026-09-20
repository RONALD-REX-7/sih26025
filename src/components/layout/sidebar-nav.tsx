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
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'MONITOR',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Mine & Panels', href: '/mine', icon: Layers },
      { name: 'Underground GIS', href: '/gis', icon: MapPin },
    ],
  },
  {
    groupName: 'INTELLIGENCE',
    items: [
      { name: 'Sensor Fleet', href: '/sensors', icon: Cpu, badge: '16' },
      { name: 'Subsidence Events', href: '/events', icon: Activity },
      { name: 'AI Risk Analytics', href: '/analytics', icon: TrendingUp },
    ],
  },
  {
    groupName: 'RESPONSE',
    items: [
      { name: 'Alerts & Evac', href: '/alerts', icon: AlertOctagon },
      { name: 'Infrastructure', href: '/infrastructure', icon: Building2 },
    ],
  },
  {
    groupName: 'TRACEABILITY',
    items: [
      { name: 'Audit Trail', href: '/audit', icon: ClipboardList },
      { name: 'DGMS Reports', href: '/reports', icon: FileSpreadsheet },
    ],
  },
  {
    groupName: 'SYSTEM',
    items: [
      { name: 'Safety Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              SIH26025
              <Badge variant="secondary" className="text-[9px] font-mono py-0 px-1 bg-slate-100 dark:bg-slate-800">
                v1.0
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-mono leading-tight">
              Mine Subsidence Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.groupName}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href === '/dashboard' && pathname === '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          isActive ? 'text-amber-400 dark:text-amber-600' : 'text-slate-400'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[9px] font-mono px-1 py-0.2 rounded font-semibold',
                          isActive
                            ? 'bg-slate-800 text-amber-300 dark:bg-slate-200 dark:text-amber-700'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* DGMS Standards Box */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800">
        <div className="p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-semibold text-[10px]">
            <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
            DGMS CMR 2017 Reg. 111
          </div>
          <p className="text-[9px] leading-relaxed text-slate-500">
            Coal mine subsidence monitoring standard & Bord & Pillar ground stability.
          </p>
        </div>
      </div>
    </aside>
  );
}
