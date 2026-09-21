'use client';

import React from 'react';
import { TopHeader } from '@/components/layout/top-header';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Left Operational Sidebar (hidden on < lg) */}
      <SidebarNav className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto bg-slate-100/70 dark:bg-slate-900/40">
          {children}
        </main>
      </div>
    </div>
  );
}
