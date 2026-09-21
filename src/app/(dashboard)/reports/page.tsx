'use client';

import React, { useState } from 'react';
import { DEMO_COMPLIANCE_REPORTS } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { FileSpreadsheet, Download, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ShiftHandoverRecord {
  id: string;
  shift: 'Shift A (06:00 - 14:00)' | 'Shift B (14:00 - 22:00)' | 'Shift C (22:00 - 06:00)';
  date: string;
  panel: string;
  overman: string;
  surveyor: string;
  maxConvergenceMm: number;
  subsidenceRateMmHr: number;
  acousticEventCount: number;
  dgmsSafetyStatus: 'Normal' | 'Advisory' | 'Watch' | 'Warning' | 'Critical';
  handoverNotes: string;
  isSigned: boolean;
}

const DEMO_SHIFT_HANDOVERS: ShiftHandoverRecord[] = [
  {
    id: 'SHO-2026-0921-A',
    shift: 'Shift A (06:00 - 14:00)',
    date: '2026-09-21',
    panel: 'Panel P-102 (Depillaring)',
    overman: 'S. K. Banerjee (Cert #OM-4412)',
    surveyor: 'P. K. Verma (Cert #MS-8819)',
    maxConvergenceMm: 22.4,
    subsidenceRateMmHr: 0.35,
    acousticEventCount: 3,
    dgmsSafetyStatus: 'Watch',
    handoverNotes: 'Slight rate acceleration on SN-106 extensometer. Goaf edge timber supports inspected and intact.',
    isSigned: true,
  },
  {
    id: 'SHO-2026-0920-C',
    shift: 'Shift C (22:00 - 06:00)',
    date: '2026-09-20',
    panel: 'Panel P-101 (Seam VII)',
    overman: 'R. N. Mishra (Cert #OM-3190)',
    surveyor: 'A. Dutta (Cert #MS-7741)',
    maxConvergenceMm: 14.8,
    subsidenceRateMmHr: 0.12,
    acousticEventCount: 0,
    dgmsSafetyStatus: 'Normal',
    handoverNotes: 'Nominal baseline reading across all 4 nodes. No cracking observed on surface railway line.',
    isSigned: true,
  },
  {
    id: 'SHO-2026-0920-B',
    shift: 'Shift B (14:00 - 22:00)',
    date: '2026-09-20',
    panel: 'Panel P-103 (Development)',
    overman: 'V. S. Chauhan (Cert #OM-5502)',
    surveyor: 'P. K. Verma (Cert #MS-8819)',
    maxConvergenceMm: 18.2,
    subsidenceRateMmHr: 0.20,
    acousticEventCount: 1,
    dgmsSafetyStatus: 'Normal',
    handoverNotes: 'Continuous mining machinery operating. Strain gauge SN-110 stable within normal tolerance envelope.',
    isSigned: true,
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'form4' | 'handover'>('form4');

  const handleExportCsv = (reportNum: string) => {
    alert(`Exporting official DGMS compliance record for ${reportNum} (CSV format).`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-4 rounded-md border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Statutory Reporting &bull; DGMS Circular (Coal) No. 04 of 2017
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            DGMS Statutory Reports & Shift Handover Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official periodic ground stability certificates and signed shift records under Coal Mines Regulations (CMR) 2017 Reg 112.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-8 text-xs font-mono border-slate-300 dark:border-slate-700"
          >
            <Printer className="h-3 w-3 mr-1.5" />
            Print Form
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCsv('ALL')}
            className="h-8 text-xs font-mono bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export All Records (CSV)
          </Button>
        </div>
      </div>

      {/* High-Density Compliance Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Statutory Filings</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {DEMO_COMPLIANCE_REPORTS.length} Certificates
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Form-IV Ground Stability Register
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Shift Handovers</p>
          <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            100% Signed
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Overman & Surveyor double-sign-off
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Governing Standard</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            CMR 2017 Reg 112
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Mandatory depillaring subsidence limits
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Colliery Record</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            Bhowra-West
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            BCCJ / Dhanbad Region #2
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('form4')}
          className={`pb-2 px-1 border-b-2 font-semibold transition-colors ${
            activeTab === 'form4'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Form-IV Ground Movement Certificates ({DEMO_COMPLIANCE_REPORTS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('handover')}
          className={`pb-2 px-1 border-b-2 font-semibold transition-colors ${
            activeTab === 'handover'
              ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Shift Handover Logbook ({DEMO_SHIFT_HANDOVERS.length})
        </button>
      </div>

      {/* Tab 1: Form-IV Reports Table */}
      {activeTab === 'form4' && (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                DGMS Form-IV Ground Stability Compliance Filings
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Cryptographically signed digital reports prepared for DGMS Directorate of Mines Safety (Eastern Zone)
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xs">
              Statutory Record
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                <tr>
                  <th className="px-3.5 py-2 font-medium">Certificate #</th>
                  <th className="px-3.5 py-2 font-medium">Panel Code</th>
                  <th className="px-3.5 py-2 font-medium">Filing Date</th>
                  <th className="px-3.5 py-2 font-medium">Max Slope (mm/m)</th>
                  <th className="px-3.5 py-2 font-medium">Max Strain (mm/m)</th>
                  <th className="px-3.5 py-2 font-medium">Max Disp (mm)</th>
                  <th className="px-3.5 py-2 font-medium">Authorized Signatory</th>
                  <th className="px-3.5 py-2 font-medium">Safety Status</th>
                  <th className="px-3.5 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {DEMO_COMPLIANCE_REPORTS.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {rep.reportNumber}
                    </td>
                    <td className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {rep.panelCode}
                    </td>
                    <td className="px-3.5 py-2 text-slate-500 text-[11px] whitespace-nowrap">
                      {rep.generationDate}
                    </td>
                    <td className="px-3.5 py-2 text-[11px] whitespace-nowrap">
                      {rep.maxRecordedSlopeMmPerM.toFixed(1)} <span className="text-slate-400">/ 3.0</span>
                    </td>
                    <td className="px-3.5 py-2 text-[11px] whitespace-nowrap">
                      {rep.maxRecordedStrainMmPerM.toFixed(1)} <span className="text-slate-400">/ 2.0</span>
                    </td>
                    <td className="px-3.5 py-2 text-[11px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {rep.maxCumulativeSubsidenceMm.toFixed(1)} mm
                    </td>
                    <td className="px-3.5 py-2 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap font-sans">
                      {rep.authorizedSignatory.name} ({rep.authorizedSignatory.role})
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap">
                      <RiskBadge state={rep.safetyStatus} size="sm" showLevel={false} />
                    </td>
                    <td className="px-3.5 py-2 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportCsv(rep.reportNumber)}
                        className="h-6 px-2 text-[11px] font-mono hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Shift Handover Log */}
      {activeTab === 'handover' && (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Statutory Shift Handover & Ground Movement Log
              </h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Tri-shift underground inspection logs countersigned by Overman and Certificated Mine Surveyor
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xs">
              CMR Reg 112 Logbook
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
                <tr>
                  <th className="px-3.5 py-2 font-medium">Log ID</th>
                  <th className="px-3.5 py-2 font-medium">Shift & Date</th>
                  <th className="px-3.5 py-2 font-medium">Extraction Panel</th>
                  <th className="px-3.5 py-2 font-medium">Max Conv.</th>
                  <th className="px-3.5 py-2 font-medium">Rate (mm/h)</th>
                  <th className="px-3.5 py-2 font-medium">Micro-seismic</th>
                  <th className="px-3.5 py-2 font-medium">Safety Status</th>
                  <th className="px-3.5 py-2 font-medium">Countersigned Officers</th>
                  <th className="px-3.5 py-2 font-medium">Shift Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {DEMO_SHIFT_HANDOVERS.map((sho) => (
                  <tr key={sho.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {sho.id}
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{sho.shift}</div>
                      <div className="text-[10px] text-slate-400">{sho.date}</div>
                    </td>
                    <td className="px-3.5 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {sho.panel}
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap font-semibold">
                      {sho.maxConvergenceMm.toFixed(1)} mm
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap text-[11px]">
                      {sho.subsidenceRateMmHr.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap text-[11px]">
                      {sho.acousticEventCount} events
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap">
                      <RiskBadge state={sho.dgmsSafetyStatus} size="sm" showLevel={false} />
                    </td>
                    <td className="px-3.5 py-2 whitespace-nowrap text-[11px] font-sans">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{sho.overman}</div>
                      <div className="text-slate-400">{sho.surveyor}</div>
                    </td>
                    <td className="px-3.5 py-2 text-slate-600 dark:text-slate-300 text-[11px] font-sans max-w-64 truncate">
                      {sho.handoverNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
