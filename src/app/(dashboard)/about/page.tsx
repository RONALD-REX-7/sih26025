'use client';

import React from 'react';
import Link from 'next/link';
import { Info, Layers, ShieldCheck, Cpu, Database, Activity, ArrowLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

export default function AboutProjectPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Info className="h-4 w-4 text-[#173B57]" />
              Smart India Hackathon 2026 &bull; Problem Statement SIH26025
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D2933]">
            About MINE GUARD &bull; Project Mission &amp; Scope
          </h1>
          <p className="text-xs text-[#52606D] mt-1">
            AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction &amp; Early Warning System for Indian Underground Coal Mines.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono-tech border-[#D7DEDC]">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Command
          </Button>
        </Link>
      </div>

      {/* SIH 2026 Official Project Attribution */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs shadow-xs">
        <div className="border-b md:border-b-0 md:border-r border-[#D7DEDC] pb-3 md:pb-0 md:pr-3">
          <div className="text-[11px] font-mono-tech text-[#5B6871] uppercase tracking-wider font-semibold">Problem Statement ID</div>
          <div className="text-base font-bold text-[#173B57] font-mono-tech mt-0.5">SIH26025</div>
          <div className="text-[11px] text-[#52606D] mt-0.5">Smart Automation &bull; Hardware / Hybrid</div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-[#D7DEDC] pb-3 md:pb-0 md:pr-3">
          <div className="text-[11px] font-mono-tech text-[#5B6871] uppercase tracking-wider font-semibold">Nodal Ministry</div>
          <div className="text-sm font-bold text-[#1D2933] mt-0.5">Ministry of Coal</div>
          <div className="text-[11px] text-[#52606D] mt-0.5">Coal India Limited (CIL) / BCCL</div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-[#D7DEDC] pb-3 md:pb-0 md:pr-3">
          <div className="text-[11px] font-mono-tech text-[#5B6871] uppercase tracking-wider font-semibold">Benchmark Colliery</div>
          <div className="text-sm font-bold text-[#1D2933] mt-0.5">Bhowra-West / Moonidih</div>
          <div className="text-[11px] text-[#52606D] mt-0.5">Jharia Coalfield, Dhanbad, Jharkhand</div>
        </div>

        <div>
          <div className="text-[11px] font-mono-tech text-[#5B6871] uppercase tracking-wider font-semibold">Regulatory Framework</div>
          <div className="text-sm font-bold text-[#2F6B4F] mt-0.5">DGMS CMR 2017</div>
          <div className="text-[11px] text-[#52606D] mt-0.5">Regulation 112 (SCAMP) &amp; Reg 114</div>
        </div>
      </div>

      {/* Executive Problem Context */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <Activity className="h-4 w-4 text-[#173B57]" />
          1. The Engineering Challenge in Indian Coal Mines
        </h2>
        <div className="space-y-3 text-xs text-[#52606D] leading-relaxed">
          <p>
            Underground coal extraction in India—both mechanized longwall mining and bord-and-pillar depillaring—induces significant subsurface strata movement. Uncontrolled roof sag, goaf falls, and surface subsidence troughs pose catastrophic hazards to underground miners and surface infrastructure (railway sidings, pipelines, roadways, and settlements).
          </p>
          <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <h3 className="font-semibold text-xs text-[#1D2933]">The Critical Economic Barrier:</h3>
            <p className="text-xs text-[#52606D]">
              Existing subsurface strata monitoring stations imported from abroad cost between <strong>₹1,50,000 and ₹4,50,000 per station</strong>. This high capital cost forces collieries to deploy sparse, isolated sensor clusters that fail to provide real-time spatial correlation across active panels.
            </p>
          </div>
        </div>
      </section>

      {/* The 4-Tier Solution */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <Layers className="h-4 w-4 text-[#173B57]" />
          2. The MINE GUARD Open-Architecture Solution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#173B57]" />
              1. Low-Cost Hardware (&asymp; ₹4,850 BOM)
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Engineered with multi-parametric sensors: BNO085 0.01&deg; inclinometer, TI ADS1220 24-bit delta-sigma ADC for vibrating wire strain bridges, and sub-GHz LoRa (IN865 Band). Achieves a <strong>30x cost reduction</strong> over commercial stations.
            </p>
          </div>

          <div className="p-4 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#173B57]" />
              2. On-Device TinyML &amp; Rate-of-Change
            </div>
            <p className="text-[#52606D] leading-relaxed">
              ESP32-S3 firmware maintains circular buffers (N=30) and on-device EWMA / Z-score filters. Automatically escalates telemetry transmission from 300s deep sleep down to 10s emergency burst upon detecting anomalous strata acceleration.
            </p>
          </div>

          <div className="p-4 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Database className="h-4 w-4 text-[#173B57]" />
              3. Spatial Correlation &amp; Multi-Sensor Fusion
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Drastically suppresses false alarms by requiring Pearson correlation agreement (r &gt; +0.75) across adjacent sensor stations and multi-modal consistency between tilt slope, extensometer displacement, strain, and acoustic emissions.
            </p>
          </div>

          <div className="p-4 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#173B57]" />
              4. DGMS CMR 2017 Statutory Compliance
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Built directly around mandatory Coal Mines Regulations 2017 Regulation 112 (Strata Control and Monitoring Plan - SCAMP). Features digital shift handovers, immutable SHA-256 audit trails, and Form IV reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Status Matrix */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <Award className="h-4 w-4 text-[#173B57]" />
          3. Implementation Status &amp; Engineering Truth Matrix
        </h2>
        <p className="text-xs text-[#52606D]">
          To maintain strict scientific credibility, MINE GUARD clearly distinguishes what is implemented in code from proposed future field work:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#D7DEDC] rounded-sm">
            <thead className="bg-[#F8FAF9] text-[#52606D] font-mono-tech border-b border-[#D7DEDC]">
              <tr>
                <th className="p-2.5">Subsystem Capability</th>
                <th className="p-2.5">Engineering Status</th>
                <th className="p-2.5">Verification Method / Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] text-xs">
              <tr>
                <td className="p-2.5 font-semibold text-[#1D2933]">Next.js 16 Digital Platform (14 Operational Views)</td>
                <td className="p-2.5"><span className="px-2 py-0.5 rounded-sm bg-[#EAF2ED] text-[#2F6B4F] font-mono-tech text-[11px] font-bold">IMPLEMENTED</span></td>
                <td className="p-2.5 text-[#52606D]">21 pre-rendered routes, Vitest suite (42 tests passing), Turbopack/Webpack production build.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#1D2933]">Deterministic Strata Event Simulator (16 Nodes)</td>
                <td className="p-2.5"><span className="px-2 py-0.5 rounded-sm bg-[#EAF2ED] text-[#2F6B4F] font-mono-tech text-[11px] font-bold">IMPLEMENTED</span></td>
                <td className="p-2.5 text-[#52606D]">Mulberry32 PRNG seed engine with 8 realistic strata failure progression scenarios.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#1D2933]">Hybrid Statistical Risk Engine &amp; Anomaly Detection</td>
                <td className="p-2.5"><span className="px-2 py-0.5 rounded-sm bg-[#EAF2ED] text-[#2F6B4F] font-mono-tech text-[11px] font-bold">IMPLEMENTED</span></td>
                <td className="p-2.5 text-[#52606D]">Running MAD, robust Z-scores, EWMA rate-of-change, and Pearson cross-node correlation.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#1D2933]">ESP32-S3 Firmware &amp; Ingestion Pipeline</td>
                <td className="p-2.5"><span className="px-2 py-0.5 rounded-sm bg-[#FCF2E9] text-[#A85A00] font-mono-tech text-[11px] font-bold">BENCH-TESTED</span></td>
                <td className="p-2.5 text-[#52606D]">PlatformIO firmware with circular buffers, compact 20-byte serializer, verified via Postman collection.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#1D2933]">Intrinsically Safe Ex &apos;i&apos; Physical Colliery Deployment</td>
                <td className="p-2.5"><span className="px-2 py-0.5 rounded-sm bg-[#EDF1F0] text-[#52606D] font-mono-tech text-[11px] font-bold">PROPOSED</span></td>
                <td className="p-2.5 text-[#52606D]">Designed under IS/IEC 60079-11; formal CIMFR Dhanbad / DGMS certification required prior to coal-face deployment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Navigation CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-sm bg-[#FFFFFF] border border-[#D7DEDC]">
        <div className="text-xs text-[#52606D]">
          Inspect live data streams, GIS vectors, and compliance logs in the command console.
        </div>
        <div className="flex items-center gap-2">
          <Link href="/transparency">
            <Button size="sm" variant="outline" className="h-8 text-xs font-mono-tech border-[#D7DEDC]">
              View BOM &amp; Licenses
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-8 text-xs font-mono-tech bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF]">
              Enter Command Console
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
