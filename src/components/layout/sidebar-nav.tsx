'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  MapPin,
  TrendingUp,
  AlertOctagon,
  SlidersHorizontal,
  ClipboardList,
  Settings,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Operations Overview', href: '/', icon: LayoutDashboard },
  { name: 'Telemetry Streams', href: '/telemetry', icon: Activity, badge: 'LIVE' },
  { name: 'Sensor Nodes & Health', href: '/nodes', icon: Cpu, badge: '16' },
  { name: 'Underground GIS', href: '/gis', icon: MapPin },
  { name: 'AI Risk Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Alerts & Evac', href: '/alerts', icon: AlertOctagon },
  { name: 'Event Simulator', href: '/simulator', icon: SlidersHorizontal, badge: 'SIM' },
  { name: 'Audit & Compliance', href: '/audit', icon: ClipboardList },
  { name: 'DGMS Settings', href: '/settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              SIH26025
              <Badge variant="secondary" className="text-[9px] font-mono py-0 px-1 bg-slate-200 dark:bg-slate-800">
                v1.0
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Mine Subsidence Digital Twin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Monitoring & Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 dark:bg-slate-200 dark:text-amber-700'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* DGMS Standards Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-semibold text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            DGMS Compliant Architecture
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Complies with Circular (Coal) No. 04/2017 standards for bord & pillar extraction.
          </p>
        </div>
      </div>
    </aside>
  );
}
