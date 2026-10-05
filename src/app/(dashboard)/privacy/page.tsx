'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Server, Database, Key, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#173B57]" />
              Data Governance &bull; Transparency Declaration
            </span>
            <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30">
              Zero Tracking
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D2933]">
            Privacy Policy &amp; Data Minimization Notice
          </h1>
          <p className="text-xs text-[#52606D] mt-1">
            Last updated: October 2026 &bull; SIH 2026 Engineering Prototype &bull; Problem Statement SIH26025
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono-tech border-[#D7DEDC]">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Command
          </Button>
        </Link>
      </div>

      {/* Core Principle Callout */}
      <div className="p-4 rounded-sm bg-[#FFFFFF] border-l-4 border-l-[#173B57] border border-[#D7DEDC] shadow-xs space-y-2">
        <h2 className="text-sm font-bold text-[#1D2933] flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#173B57]" />
          Data Minimization &amp; Engineering Truth Commitment
        </h2>
        <p className="text-xs text-[#52606D] leading-relaxed">
          MINE GUARD is an academic and engineering prototype developed for Smart India Hackathon 2026. The platform adheres strictly to the principle of <strong>data minimization</strong>. We do NOT harvest, monetize, sell, or profile visitor information. This document discloses only the actual technical data handling implemented in this codebase.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {/* Section 1: Data We Collect */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <span className="h-2 w-2 rounded-full bg-[#173B57]" />
            1. Information Processed by the Platform
          </h2>
          <div className="space-y-3 text-xs text-[#52606D] leading-relaxed">
            <p>
              Depending on whether you access MINE GUARD in <strong>Evaluation Demo Mode</strong> or with <strong>Authorized Colliery Credentials</strong>, data processing is strictly limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>
                <strong>Evaluation Mode (Judges &amp; Evaluators):</strong> No personal data is requested or stored. Selecting an evaluation role (Safety Officer, Mine Manager, Geotechnical Engineer, or Administrator) operates entirely within client-side memory (React state) without creating user records.
              </li>
              <li>
                <strong>Authorized Sign-In (Optional Supabase Backend):</strong> If authenticating with colliery infrastructure credentials, only the official work email and password are submitted directly over TLS 1.3 to the configured Supabase authentication service. No personal tracking profiles are maintained.
              </li>
              <li>
                <strong>Sensor Telemetry Ingestion:</strong> Telemetry received via the API (`/api/telemetry/ingest`) consists exclusively of physical transducer readings (extensometer displacement, biaxial tilt, rockmass strain, vibration velocity PPV, acoustic pulse counts, battery millivolts, and RSSI). Telemetry packets contain zero personal identifiers.
              </li>
              <li>
                <strong>Statutory Shift Sign-Offs:</strong> When an operator acknowledges an alert or signs off on a shift log, the designated role title (e.g., &ldquo;Safety Officer&rdquo;), action summary, and timestamp are committed to the demonstration audit trail to demonstrate compliance with Coal Mines Regulations (CMR) 2017 Reg 112.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Cookies & Browser Storage */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <EyeOff className="h-4 w-4 text-[#173B57]" />
            2. Cookies and Local Browser Storage
          </h2>
          <div className="space-y-3 text-xs text-[#52606D] leading-relaxed">
            <p>
              MINE GUARD operates <strong>without non-essential, tracking, or marketing cookies</strong>. We do not use third-party analytics suites or advertising beacons.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#D7DEDC] rounded-sm">
                <thead className="bg-[#F8FAF9] text-[#52606D] font-mono-tech border-b border-[#D7DEDC]">
                  <tr>
                    <th className="p-2.5">Storage Key / Name</th>
                    <th className="p-2.5">Storage Type</th>
                    <th className="p-2.5">Purpose</th>
                    <th className="p-2.5">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7DEDC] font-mono-tech text-[11px]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1D2933]">sih26025_alarm_muted</td>
                    <td className="p-2.5">localStorage</td>
                    <td className="p-2.5">Stores the user&apos;s preference for muting/unmuting the Web Audio audible siren synthesizer.</td>
                    <td className="p-2.5">Persistent until browser cache cleared</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1D2933]">sidebar_state</td>
                    <td className="p-2.5">HTTP Cookie</td>
                    <td className="p-2.5">Essential UI cookie preserving desktop sidebar open/collapsed state.</td>
                    <td className="p-2.5">7 days</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1D2933]">sb-*-auth-token</td>
                    <td className="p-2.5">HTTP Cookie</td>
                    <td className="p-2.5">Essential session cookie used only when signed in to an authenticated Supabase backend.</td>
                    <td className="p-2.5">Active session duration</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#5B6871]">
              Because only strictly functional storage is utilized, no invasive cookie consent banner is mandated or displayed.
            </p>
          </div>
        </section>

        {/* Section 3: Technical Logs & Infrastructure */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Server className="h-4 w-4 text-[#173B57]" />
            3. Hosting Infrastructure &amp; Technical Logs
          </h2>
          <div className="space-y-3 text-xs text-[#52606D] leading-relaxed">
            <p>
              The web application is hosted on <strong>Vercel</strong> and interacts optionally with <strong>Supabase (Managed PostgreSQL)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>
                <strong>Server Logs:</strong> Standard HTTP edge logs (client IP address, user agent, requested URL, response status code, and latency) are processed by Vercel exclusively for security monitoring, DDoS mitigation, and operational error tracing. These logs are maintained in compliance with Vercel&apos;s infrastructure retention policies.
              </li>
              <li>
                <strong>Self-Hosted Typography:</strong> All fonts (IBM Plex Sans, IBM Plex Mono) are self-hosted via `next/font/google` and bundled into static assets during build time. At runtime, the client browser never connects to Google Font servers or third-party CDNs.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data Retention & Security Practices */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Database className="h-4 w-4 text-[#173B57]" />
            4. Security Architecture &amp; Data Retention
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>
                <strong>Client-Side Demo Isolation:</strong> In demo mode, simulation data is held purely in browser memory (Zustand state store) and resets upon tab closure or page refresh.
              </li>
              <li>
                <strong>Row-Level Security (RLS):</strong> When connected to a live database, all tables enforce PostgreSQL Row-Level Security policies. Anonymous public writes are rejected.
              </li>
              <li>
                <strong>API Key Protection:</strong> Ingestion routes (`/api/telemetry/ingest`) require a secret `x-api-key` header to prevent unauthorized telemetry submission. Service-role secrets are never bundled into client-side code.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: User Rights & Contact */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Key className="h-4 w-4 text-[#173B57]" />
            5. User Rights &amp; Data Subject Requests
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              Because this website functions as an engineering demonstration and collects no personal consumer profiles, consumer data deletion requests are generally not applicable.
            </p>
            <p>
              However, if you have authenticated using colliery test credentials and wish to have your test account removed from the testing Supabase instance, or if you have questions regarding the project&apos;s data governance, please contact the project development team:
            </p>
            <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] font-mono-tech text-xs text-[#1D2933]">
              <strong>SIH 2026 Project Contact:</strong> sih26025.mineguard@gmail.com<br />
              <strong>Institutional Context:</strong> Ministry of Coal &bull; Smart India Hackathon 2026<br />
              <strong>Open Source Repository:</strong> https://github.com/mineguard-sih26025
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
