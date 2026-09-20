'use client';

import React from 'react';
import { DemoBanner } from '@/components/layout/demo-banner';
import { TopHeader } from '@/components/layout/top-header';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top persistent evaluation demo banner */}
      <DemoBanner />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Operational Sidebar */}
        <SidebarNav />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopHeader />
          <main className="flex-1 p-6 bg-slate-100/60 dark:bg-slate-900/50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
