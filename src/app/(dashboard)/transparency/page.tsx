'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Cpu, Database, Radio, ShieldCheck, FileCode, ArrowLeft, Code2, Scale, GitBranch, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

export default function TransparencyPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-[#173B57]" />
              Engineering Transparency &bull; Open Architecture &bull; SIH26025
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D2933]">
            System Transparency, Data Provenance &amp; Attributions
          </h1>
          <p className="text-xs text-[#52606D] mt-1">
            Complete technical disclosure of 12-stage data pipeline, audited hardware BOM claims, dependency licensing, and defensible regulatory references.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono-tech border-[#D7DEDC]">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Command
          </Button>
        </Link>
      </div>

      {/* Section 1: End-to-End 4-Tier Architecture */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <Layers className="h-4 w-4 text-[#173B57]" />
          1. Four-Tier Engineering Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#173B57]" />
              Tier 1: Subsurface Sensing &amp; Edge Hardware
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Designed around an <strong>ESP32-S3 microcontroller</strong> (dual Xtensa LX7 @ 240MHz) with hardware floating-point acceleration. Integrates a <strong>BNO085 3-axis inclinometer</strong> (0.01&deg; tilt resolution), a <strong>TI ADS1220 24-bit delta-sigma ADC</strong> for vibrating wire strain gauges, and a Murata piezoelectric geophone for microseismic acoustic emissions.
            </p>
            <div className="font-mono-tech text-[11px] text-[#1D2933] pt-1 border-t border-[#D7DEDC]">
              Unit BOM Cost: <strong>₹ 4,850 (~$58 USD)</strong> &bull; Sub-GHz LoRa (IN865 Band)
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#173B57]" />
              Tier 2: Ingestion Backhaul &amp; Validation
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Accepts compact 20-byte binary packets over sub-GHz LoRaWAN gateways forwarded to the Next.js HTTPS ingestion route (`/api/telemetry/ingest`). Uses strict <strong>Zod contract validation</strong>, CRC-16 checksum verification, and idempotent deduplication.
            </p>
            <div className="font-mono-tech text-[11px] text-[#1D2933] pt-1 border-t border-[#D7DEDC]">
              Protocol: HTTPS POST with `x-api-key` &bull; Zero Public Unauthenticated Writes
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <Database className="h-4 w-4 text-[#173B57]" />
              Tier 3: Statistical Risk Engine &amp; Fusion
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Combines running Median Absolute Deviation (MAD), robust Z-scores, and Exponentially Weighted Moving Average (EWMA) filters to eliminate transient blasting vibration false alarms. Applies <strong>Pearson inter-station spatial correlation</strong> across neighboring sensor nodes.
            </p>
            <div className="font-mono-tech text-[11px] text-[#1D2933] pt-1 border-t border-[#D7DEDC]">
              5-State Risk Engine: Normal &rarr; Advisory &rarr; Watch &rarr; Warning &rarr; Critical
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-2">
            <div className="font-bold text-[#173B57] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#173B57]" />
              Tier 4: Statutory Operations &amp; Vector GIS
            </div>
            <p className="text-[#52606D] leading-relaxed">
              Provides 14 operational surveillance views, a Canvas 2D vector GIS displaying cadastral mine panels and surface railways, Web Audio emergency sirens, and statutory shift handover logs aligned with <strong>DGMS CMR 2017 Regulation 112</strong>.
            </p>
            <div className="font-mono-tech text-[11px] text-[#1D2933] pt-1 border-t border-[#D7DEDC]">
              Cryptographic Audit: SHA-256 Hashed Operational Shift Ledger
            </div>
          </div>
        </div>
      </section>

      {/* Section 1B: End-to-End 12-Stage Technical Data Flow Panel (Requirement 18) */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7DEDC] pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#173B57]" />
            1B. Comprehensive 12-Stage Technical Data-Flow Architecture
          </h2>
          <span className="text-[11px] font-mono-tech text-[#52606D]">
            Physical Edge &rarr; Processing &rarr; Decision Support
          </span>
        </div>

        <p className="text-xs text-[#52606D] leading-relaxed">
          The following pipeline describes the complete MineGuard technical data flow. To uphold engineering honesty, each stage is explicitly classified as <strong>IMPLEMENTED</strong> (demonstrated in software/prototype), <strong>SIMULATED</strong>, or <strong>REFERENCE ARCHITECTURE</strong> (planned physical deployment).
        </p>

        <div className="space-y-2 text-xs font-mono-tech">
          {[
            {
              stage: '01. SENSOR NODE',
              desc: 'Subsurface/surface instrument station with ESP32-S3 dual-core microcontroller and sensor power gating.',
              tag: 'PROTOTYPE BENCH TESTED',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '02. DATA ACQUISITION',
              desc: '24-bit delta-sigma ADC (TI ADS1220) for vibrating wire transducers + 0.01° BNO085 biaxial inclinometer.',
              tag: 'VERIFIED DATASHEET',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '03. WIRELESS LINK',
              desc: 'Sub-GHz LoRa (IN865 band, SX1262) point-to-point transmission with experimental multi-hop surface relay.',
              tag: 'SIMULATED IN SOFTWARE (RELAY)',
              tagColor: 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30',
            },
            {
              stage: '04. EDGE GATEWAY',
              desc: 'Colliery surface LoRaWAN concentrator (SX1302) with cellular/Ethernet backhaul connection.',
              tag: 'REFERENCE ARCHITECTURE',
              tagColor: 'bg-[#EDF1F0] text-[#52606D] border-[#D7DEDC]',
            },
            {
              stage: '05. LOCAL BUFFER',
              desc: 'Store-and-forward edge buffer and browser-side IndexedDB local queue for zero-data-loss offline operation.',
              tag: 'IMPLEMENTED (LOCAL-FIRST)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '06. SERVER INGESTION',
              desc: 'Next.js API route handler (/api/telemetry/ingest) with Zod contract validation and CRC-16 checksum verification.',
              tag: 'IMPLEMENTED (HTTPS API)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '07. FEATURE EXTRACTION',
              desc: 'Temporal moving averages, baseline EWMA (α=0.20), and 50-sample rolling median absolute deviation (MAD).',
              tag: 'IMPLEMENTED (EXPLAINABLE)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '08. ANOMALY DETECTION',
              desc: 'Robust Z-score (|z| > 2.5) outlier thresholding and rate-of-change transient blasting spike rejection filter.',
              tag: 'IMPLEMENTED (AI/STAT)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '09. SENSOR FUSION',
              desc: 'Multi-modal concordance (tilt + displacement + vibration + strain + crack) and Pearson bivariate spatial correlation.',
              tag: 'IMPLEMENTED (SPATIAL)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '10. RISK FORECAST',
              desc: 'Short-horizon (+30s / +60s) velocity drift projection providing early warning trend before threshold breach.',
              tag: 'IMPLEMENTED (PROTOTYPE FORECAST)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '11. RISK CLASSIFICATION',
              desc: 'Deterministic 5-state risk categorization (Normal, Advisory, Watch, Warning, Critical) across colliery panels.',
              tag: 'IMPLEMENTED (DETERMINISTIC)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
            {
              stage: '12. ACTION & STATUTORY AUDIT',
              desc: 'In-app notification, Web Audio acoustic sirens, role perspective views, and SHA-256 statutory shift logs.',
              tag: 'IMPLEMENTED (AUDITABLE)',
              tagColor: 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start sm:items-center gap-2">
                <span className="font-bold text-[#173B57] min-w-[140px] shrink-0">{item.stage}</span>
                <span className="text-[#52606D] text-[11px] font-sans">{item.desc}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border shrink-0 ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Strict Data Classification Matrix */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <Scale className="h-4 w-4 text-[#173B57]" />
          2. Data Classification &amp; Truthfulness Matrix
        </h2>
        <p className="text-xs text-[#52606D]">
          To prevent synthetic or demonstrative data from being misinterpreted as physical colliery measurements, every piece of information is strictly classified:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#D7DEDC] rounded-sm">
            <thead className="bg-[#F8FAF9] text-[#52606D] font-mono-tech border-b border-[#D7DEDC]">
              <tr>
                <th className="p-2.5">Classification</th>
                <th className="p-2.5">Badge</th>
                <th className="p-2.5">Definition &amp; Operational Meaning</th>
                <th className="p-2.5">Examples in Current Build</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] text-xs">
              <tr>
                <td className="p-2.5 font-bold font-mono-tech text-[#2F6B4F]">LIVE</td>
                <td className="p-2.5"><ProvenanceBadge provenance="LIVE" size="sm" /></td>
                <td className="p-2.5 text-[#52606D]">Data transmitted directly from physical hardware stations through `/api/telemetry/ingest` in real-time.</td>
                <td className="p-2.5 font-mono-tech text-[11px]">Hardware bench tests &bull; Live ESP32-S3 test link</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold font-mono-tech text-[#173B57]">SIMULATED</td>
                <td className="p-2.5"><ProvenanceBadge provenance="SIMULATED" size="sm" /></td>
                <td className="p-2.5 text-[#52606D]">Deterministic PRNG-generated strata deformation time-series produced by the client-side Strata Event Simulator.</td>
                <td className="p-2.5 font-mono-tech text-[11px]">16-node convergence scenarios &bull; Progressive subsidence events</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold font-mono-tech text-[#9A6A00]">DEMO</td>
                <td className="p-2.5"><ProvenanceBadge provenance="DEMO" size="sm" /></td>
                <td className="p-2.5 text-[#52606D]">Static fixtures, panel boundaries, and shift records modeled to demonstrate colliery operations.</td>
                <td className="p-2.5 font-mono-tech text-[11px]">Bhowra-West demo mine profile &bull; Panels P-101 to P-104 &bull; Form IV preview</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold font-mono-tech text-[#74808A]">EXTERNAL / BENCHMARK</td>
                <td className="p-2.5"><ProvenanceBadge provenance="EXTERNAL" size="sm" /></td>
                <td className="p-2.5 text-[#52606D]">Empirical mathematical curves, cadastral reference coordinates, or statutory threshold standards.</td>
                <td className="p-2.5 font-mono-tech text-[11px]">CMPDI empirical subsidence trough profile &bull; DGMS CMR 112 thresholds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Open-Source Software Dependencies & Licensing */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <FileCode className="h-4 w-4 text-[#173B57]" />
          3. Open-Source Dependencies &amp; Licensing Transparency
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#D7DEDC] rounded-sm font-mono-tech text-[11px]">
            <thead className="bg-[#F8FAF9] text-[#52606D] border-b border-[#D7DEDC]">
              <tr>
                <th className="p-2">Package / Library</th>
                <th className="p-2">Version</th>
                <th className="p-2">License</th>
                <th className="p-2">Role in MINE GUARD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC]">
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">Next.js</td>
                <td className="p-2">16.3.5</td>
                <td className="p-2 text-[#2F6B4F]">MIT</td>
                <td className="p-2 text-[#52606D] font-sans">Full-stack React framework with App Router &amp; Route Handlers</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">React &amp; React DOM</td>
                <td className="p-2">19.2.8</td>
                <td className="p-2 text-[#2F6B4F]">MIT</td>
                <td className="p-2 text-[#52606D] font-sans">Component rendering and client state management</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">Lucide React</td>
                <td className="p-2">1.47.0</td>
                <td className="p-2 text-[#2F6B4F]">ISC</td>
                <td className="p-2 text-[#52606D] font-sans">Industrial iconography and UI status glyphs</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">Tailwind CSS</td>
                <td className="p-2">4.0.0</td>
                <td className="p-2 text-[#2F6B4F]">MIT</td>
                <td className="p-2 text-[#52606D] font-sans">Utility-first styling conforming to industrial color tokens</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">@supabase/supabase-js</td>
                <td className="p-2">2.116.0</td>
                <td className="p-2 text-[#2F6B4F]">Apache 2.0</td>
                <td className="p-2 text-[#52606D] font-sans">PostgreSQL persistence client with Row-Level Security</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-[#1D2933]">Zustand</td>
                <td className="p-2">5.0.15</td>
                <td className="p-2 text-[#2F6B4F]">MIT</td>
                <td className="p-2 text-[#52606D] font-sans">High-performance reactive state store for simulation, offline &amp; alerts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Hardware BOM & Quantitative Claim Sanity Check (Requirement 15) */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7DEDC] pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#173B57]" />
            4. Hardware Bill of Materials (BOM) &amp; Cost Analysis
          </h2>
          <span className="text-[11px] font-mono-tech text-[#52606D]">
            Target Cost: &lt; ₹5,000 / Station
          </span>
        </div>

        <p className="text-xs text-[#52606D] leading-relaxed">
          Commercial imported underground monitoring systems are estimated at <strong>₹1.5L to ₹4.5L per multi-point installation</strong> based on public mining equipment procurement benchmarks. MineGuard achieves an open-architecture fabricated target unit cost of <strong>₹4,850 (~$58 USD)</strong>. Every quantitative claim below has been audited and classified:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#D7DEDC] rounded-sm font-mono-tech text-[11px]">
            <thead className="bg-[#F8FAF9] text-[#52606D] border-b border-[#D7DEDC]">
              <tr>
                <th className="p-2">Subsystem</th>
                <th className="p-2">Component Selection</th>
                <th className="p-2">Claim Classification</th>
                <th className="p-2 text-right">Cost (INR)</th>
                <th className="p-2 text-right">Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC]">
              <tr>
                <td className="p-2 font-semibold text-[#1D2933]">Processing &amp; LoRa RF</td>
                <td className="p-2 text-[#52606D]">ESP32-S3 (16MB Flash) + Semtech SX1262 (IN865)</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#EAF2ED] text-[#2F6B4F] font-bold text-[10px]">
                    VERIFIED DATASHEET
                  </span>
                </td>
                <td className="p-2 text-right font-bold">₹ 1,180</td>
                <td className="p-2 text-right">$ 14.20</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-[#1D2933]">Transducers &amp; 24-Bit ADC</td>
                <td className="p-2 text-[#52606D]">BNO085 0.01&deg; Inclinometer + TI ADS1220 24-bit ADC + Piezo</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#EAF2ED] text-[#2F6B4F] font-bold text-[10px]">
                    VERIFIED DATASHEET
                  </span>
                </td>
                <td className="p-2 text-right font-bold">₹ 1,420</td>
                <td className="p-2 text-right">$ 17.10</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-[#1D2933]">Power Conditioning</td>
                <td className="p-2 text-[#52606D]">3.2V 3200mAh LiFePO4 + TI TPS7A2533 Ultra-low noise LDO</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#FBF6E9] text-[#9A6A00] font-bold text-[10px]">
                    ENGINEERING ASSUMPTION
                  </span>
                </td>
                <td className="p-2 text-right font-bold">₹ 680</td>
                <td className="p-2 text-right">$ 8.20</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-[#1D2933]">Enclosure &amp; Mount</td>
                <td className="p-2 text-[#52606D]">IP68 Die-cast enclosure + SS304 22mm rockbolt bracket clamp</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#EDF1F0] text-[#173B57] font-bold text-[10px]">
                    PROTOTYPE RESULT
                  </span>
                </td>
                <td className="p-2 text-right font-bold">₹ 1,150</td>
                <td className="p-2 text-right">$ 13.85</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold text-[#1D2933]">PCB &amp; Hardware Glands</td>
                <td className="p-2 text-[#52606D]">4-Layer FR4 1.6mm PCB + M12 IP68 brass cable glands</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#EDF1F0] text-[#173B57] font-bold text-[10px]">
                    PROTOTYPE RESULT
                  </span>
                </td>
                <td className="p-2 text-right font-bold">₹ 420</td>
                <td className="p-2 text-right">$ 5.05</td>
              </tr>
              <tr className="bg-[#F8FAF9] font-bold text-xs text-[#173B57]">
                <td className="p-2.5" colSpan={3}>Total Fabricated Unit Production Target</td>
                <td className="p-2.5 text-right font-mono-tech text-sm">₹ 4,850</td>
                <td className="p-2.5 text-right font-mono-tech text-sm">$ 58.40</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Defensible Statutory References & Legal Disclaimer (Requirement 14) */}
      <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
          <FileCode className="h-4 w-4 text-[#173B57]" />
          5. Statutory References &amp; Regulatory Truthfulness
        </h2>

        {/* Defensibility Notice */}
        <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] text-xs text-[#52606D] leading-relaxed">
          <strong className="text-[#1D2933]">Statutory Disclosure:</strong> MineGuard is an engineering prototype developed for Smart India Hackathon 2026 (SIH26025). The software maps operational workflows to selected statutory parameters. This platform does not claim official certification or statutory compliance determinations by the Directorate General of Mines Safety (DGMS). All references below serve as technical baselines:
        </div>

        <ul className="space-y-2 text-xs text-[#52606D]">
          <li className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2F6B4F] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1D2933]">DGMS Coal Mines Regulations (CMR) 2017 &bull; Regulation 112:</strong>{' '}
              Strata Control and Monitoring Plan (SCAMP) guidelines requiring systematic monitoring of roof convergence, pillar strain, and early warning procedures in depillaring districts.
            </div>
          </li>
          <li className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2F6B4F] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1D2933]">DGMS Technical Circular (Coal) No. 04 of 2017:</strong>{' '}
              Instrumental monitoring recommendations for strata behavior in continuous miner and depillaring operations.
            </div>
          </li>
          <li className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2F6B4F] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1D2933]">IS/IEC 60079-11 Standard:</strong>{' '}
              Explosive atmospheres — Equipment protection by intrinsic safety &lsquo;i&rsquo; baseline for underground coal mine telemetry transceivers.
            </div>
          </li>
          <li className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2F6B4F] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1D2933]">CMPDI Subsidence Prediction Reference:</strong>{' '}
              Empirical angle of draw (32&deg;) and trough profile calculations for Jharia Coalfield Barakar measures used as benchmark comparison.
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}

