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
    <div className="flex h-screen overflow-hidden bg-[#F4F6F5]">
      {/* Desktop Left Operational Sidebar (hidden on < lg) */}
      <SidebarNav className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#F4F6F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
