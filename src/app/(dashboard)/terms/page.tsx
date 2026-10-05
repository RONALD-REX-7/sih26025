'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, AlertTriangle, ShieldCheck, FileCheck, ArrowLeft, BookOpen, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfUsePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-[#173B57]" />
              Engineering Governance &bull; Prototype Framework
            </span>
            <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold bg-[#FCF2E9] text-[#A85A00] border border-[#A85A00]/30">
              Prototype Scope
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D2933]">
            Terms of Use &amp; Evaluation Conditions
          </h1>
          <p className="text-xs text-[#52606D] mt-1">
            Effective: October 2026 &bull; Smart India Hackathon 2026 &bull; Problem Statement SIH26025
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono-tech border-[#D7DEDC]">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Command
          </Button>
        </Link>
      </div>

      {/* Critical Statutory Boundary Callout */}
      <div className="p-4 rounded-sm bg-[#FFFFFF] border-l-4 border-l-[#B42318] border border-[#D7DEDC] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#B42318] font-bold text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Statutory Safety Notice &amp; Regulatory Boundary</span>
        </div>
        <p className="text-xs text-[#52606D] leading-relaxed">
          MINE GUARD is a student engineering and research prototype developed for the Smart India Hackathon 2026. This platform is <strong>NOT</strong> a certified underground colliery monitoring system and is <strong>NOT</strong> a substitute for official statutory mine safety procedures, mandatory geotechnical inspections by DGMS certified officials, or established Strata Control and Monitoring Plans (SCAMP) under the Coal Mines Regulations (CMR) 2017.
        </p>
      </div>

      {/* Structured Terms */}
      <div className="space-y-6">
        {/* Section 1: Nature of Platform */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Construction className="h-4 w-4 text-[#173B57]" />
            1. Scope and Purpose of the Demonstration Platform
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              The MINE GUARD web platform, API endpoints, firmware codebases, machine learning models, and simulated datasets are provided solely for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>Demonstration and technical evaluation by Smart India Hackathon (SIH 2026) judges, mentors, and organizing committees.</li>
              <li>Academic research and peer review in the fields of mine subsidence monitoring, edge computing (TinyML), and multi-sensor fusion.</li>
              <li>Exploration of low-cost open-hardware telemetry architectures for Indian underground coal mining conditions.</li>
            </ul>
            <p>
              This website is an engineering demonstration platform, not a commercial software-as-a-service (SaaS) product. There are no fees, subscriptions, or commercial transactions.
            </p>
          </div>
        </section>

        {/* Section 2: Non-Reliance for Real-World Safety Decisions */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <ShieldCheck className="h-4 w-4 text-[#173B57]" />
            2. Operational Non-Reliance &amp; Statutory Disclaimer
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              Underground coal mining involves complex geotechnical dynamics, hydrostatic pressures, tectonic stress fields, and high-risk strata behavior. Users, colliery managers, mining engineers, and third parties must NOT rely on the telemetry, anomaly scores, or risk classifications presented on this website for operational decisions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>
                <strong>No Guaranteed Collapse Foresight:</strong> The platform implements statistical anomaly detection (running MAD, robust Z-scores, and EWMA rate-of-change filters). It does <em>not</em> claim deterministic prediction of the exact time, location, or probability of roof falls or surface trough collapse.
              </li>
              <li>
                <strong>No Certification Implied:</strong> Transducer specifications, LoRa range figures, and unit costs reflect laboratory bench tests and prototype design criteria. Physical deployment in active Indian underground mines requires formal intrinsic safety (Ex &apos;i&apos; / IS/IEC 60079-11) testing and statutory approval by the Central Institute of Mining and Fuel Research (CIMFR) and DGMS.
              </li>
              <li>
                <strong>Statutory Precedence:</strong> Final operational decisions, including workforce withdrawal, support intensification, and barricading, remain the sole statutory prerogative of the certified Colliery Manager and Safety Officer under DGMS CMR 2017 Regulation 112.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Permissible Use */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <BookOpen className="h-4 w-4 text-[#173B57]" />
            3. Permissible Evaluation &amp; Academic Use
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              Evaluators are permitted and encouraged to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#1D2933]">
              <li>Navigate all 14 operational views, GIS vectors, and compliance registers.</li>
              <li>Operate the Strata Event Simulator across baseline, machinery vibration, sensor drift, gradual deformation, and catastrophic progression scenarios.</li>
              <li>Inspect mathematical anomaly models, source code, and API contracts.</li>
              <li>Simulate shift handover approvals and statutory audit trail generations.</li>
            </ul>
            <p>
              Automated denial-of-service testing, unauthorized injection of malicious payloads into the ingestion API, or tampering with live backend telemetry feeds without prior authorization is strictly prohibited.
            </p>
          </div>
        </section>

        {/* Section 4: Limitation of Liability */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Scale className="h-4 w-4 text-[#173B57]" />
            4. Prototype Warranty Disclaimer
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              This software and documentation are provided &ldquo;as is&rdquo;, without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular colliery purpose, or geotechnical accuracy. In no event shall the student engineering authors, mentors, or supporting institutions be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this prototype platform.
            </p>
          </div>
        </section>

        {/* Section 5: Hackathon Governance */}
        <section className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-5 space-y-3 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <FileCheck className="h-4 w-4 text-[#173B57]" />
            5. Hackathon Attribution &amp; Governance
          </h2>
          <div className="space-y-2 text-xs text-[#52606D] leading-relaxed">
            <p>
              This project is submitted in fulfillment of the guidelines established by the Smart India Hackathon 2026 (Ministry of Education&apos;s Innovation Cell and AICTE).
            </p>
            <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] font-mono-tech text-xs text-[#1D2933]">
              <strong>Problem Statement ID:</strong> SIH26025<br />
              <strong>Problem Title:</strong> Development of an AI-enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India.<br />
              <strong>Nodal Organization:</strong> Ministry of Coal / Coal India Limited (CIL)
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
