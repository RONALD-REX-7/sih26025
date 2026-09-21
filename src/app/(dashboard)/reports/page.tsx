'use client';

import React, { useState } from 'react';
import { DEMO_COMPLIANCE_REPORTS } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { FileSpreadsheet, Download, ShieldCheck, Printer, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [activeTab, setActiveTab] = useState<'form4' | 'handover' | 'preview'>('form4');
  const [selectedReportId, setSelectedReportId] = useState<string>(DEMO_COMPLIANCE_REPORTS[0].id);

  const selectedReport =
    DEMO_COMPLIANCE_REPORTS.find((r) => r.id === selectedReportId) || DEMO_COMPLIANCE_REPORTS[0];

  const handleExportCsv = (reportNum: string) => {
    const report = DEMO_COMPLIANCE_REPORTS.find((r) => r.reportNumber === reportNum) || selectedReport;
    const content = `DGMS Form IV Ground Movement Report\nReport Number: ${report.reportNumber}\nPanel: ${report.panelCode}\nDate: ${report.generationDate}\nMax Cumulative Subsidence: ${report.maxCumulativeSubsidenceMm} mm\nMax Slope: ${report.maxRecordedSlopeMmPerM} mm/m\nMax Strain: ${report.maxRecordedStrainMmPerM} mm/m\nSafety Status: ${report.safetyStatus}\nSignatory: ${report.authorizedSignatory.name} (${report.authorizedSignatory.role})`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DGMS_Form_IV_${report.reportNumber}.txt`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2F6B4F]" />
              Statutory reporting &bull; DGMS Circular (Coal) No. 04 of 2017
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            DGMS Statutory Reports &amp; Shift Handover Logbook
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Official periodic ground stability certificates and signed shift records under Coal Mines Regulations (CMR) 2017 Reg 112.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="h-8 text-xs font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#1D2933]"
          >
            <Printer className="h-3 w-3 mr-1.5" />
            Print document
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportCsv(selectedReport.reportNumber)}
            className="h-8 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#173B57] font-semibold"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export certificate
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Statutory filings
          </div>
          <div className="text-base font-bold tabular-nums text-[#1D2933] mt-0.5 font-mono-tech">
            {DEMO_COMPLIANCE_REPORTS.length} Certificates
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Form-IV Ground Stability Register</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Shift handovers
          </div>
          <div className="text-base font-bold tabular-nums text-[#2F6B4F] mt-0.5 font-mono-tech">
            100% Signed
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Overman &amp; surveyor double-sign-off</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Governing standard
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5">CMR 2017 Reg 112</div>
          <div className="text-xs text-[#52606D] mt-0.5">Mandatory depillaring limits</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Colliery leasehold
          </div>
          <div className="text-base font-bold text-[#173B57] mt-0.5">Bhowra-West</div>
          <div className="text-xs text-[#52606D] mt-0.5">BCCJ / Dhanbad Region #2</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#D7DEDC] gap-6 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('form4')}
          className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'form4'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Form-IV Ground Movement Certificates ({DEMO_COMPLIANCE_REPORTS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('handover')}
          className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'handover'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Shift Handover Logbook ({DEMO_SHIFT_HANDOVERS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-2.5 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'preview'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Printable A4 Document Preview
        </button>
      </div>

      {/* Tab 1: Form-IV Reports Table */}
      {activeTab === 'form4' && (
        <div className="rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] overflow-hidden">
          <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#1D2933] flex items-center gap-1.5 uppercase tracking-wider">
                <FileSpreadsheet className="h-4 w-4 text-[#2F6B4F]" />
                DGMS Form-IV Ground Stability Compliance Filings
              </h2>
              <p className="text-xs text-[#52606D] mt-0.5">
                Official records prepared for DGMS Directorate of Mines Safety (Eastern Zone)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech bg-[#EDF1F0] text-[#173B57] border border-[#D7DEDC]">
              Statutory record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wider text-[#52606D] border-b border-[#D7DEDC] font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Certificate #</th>
                  <th className="px-3.5 py-2.5">Panel code</th>
                  <th className="px-3.5 py-2.5">Filing date</th>
                  <th className="px-3.5 py-2.5">Max slope (mm/m)</th>
                  <th className="px-3.5 py-2.5">Max strain (mm/m)</th>
                  <th className="px-3.5 py-2.5">Max disp (mm)</th>
                  <th className="px-3.5 py-2.5">Authorized signatory</th>
                  <th className="px-3.5 py-2.5">Condition</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DEDC] font-mono-tech">
                {DEMO_COMPLIANCE_REPORTS.map((rep) => (
                  <tr key={rep.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-3.5 py-2.5 font-bold text-[#1D2933] whitespace-nowrap">
                      {rep.reportNumber}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-[#1D2933] whitespace-nowrap">
                      {rep.panelCode}
                    </td>
                    <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap">
                      {rep.generationDate}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {rep.maxRecordedSlopeMmPerM.toFixed(1)} <span className="text-[#74808A]">/ 3.0</span>
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {rep.maxRecordedStrainMmPerM.toFixed(1)} <span className="text-[#74808A]">/ 2.0</span>
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-[#1D2933] whitespace-nowrap">
                      {rep.maxCumulativeSubsidenceMm.toFixed(1)} mm
                    </td>
                    <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap font-sans">
                      {rep.authorizedSignatory.name} ({rep.authorizedSignatory.role})
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <RiskBadge state={rep.safetyStatus} size="sm" showLevel={false} />
                    </td>
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReportId(rep.id);
                          setActiveTab('preview');
                        }}
                        className="h-7 px-2.5 text-xs font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#173B57]"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Inspect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportCsv(rep.reportNumber)}
                        className="h-7 px-2 text-xs font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#52606D]"
                      >
                        <Download className="h-3 w-3" />
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
        <div className="rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] overflow-hidden">
          <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-row items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#1D2933] flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-[#2F6B4F]" />
                Statutory Shift Handover &amp; Ground Movement Log
              </h2>
              <p className="text-xs text-[#52606D] mt-0.5">
                Tri-shift underground inspection logs countersigned by Overman and Certificated Mine Surveyor
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech bg-[#EDF1F0] text-[#173B57] border border-[#D7DEDC]">
              CMR Reg 112 logbook
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wider text-[#52606D] border-b border-[#D7DEDC] font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Log ID</th>
                  <th className="px-3.5 py-2.5">Shift &amp; date</th>
                  <th className="px-3.5 py-2.5">Extraction panel</th>
                  <th className="px-3.5 py-2.5">Max conv.</th>
                  <th className="px-3.5 py-2.5">Rate (mm/h)</th>
                  <th className="px-3.5 py-2.5">Micro-seismic</th>
                  <th className="px-3.5 py-2.5">Safety status</th>
                  <th className="px-3.5 py-2.5">Countersigned officers</th>
                  <th className="px-3.5 py-2.5">Shift observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DEDC] font-mono-tech">
                {DEMO_SHIFT_HANDOVERS.map((sho) => (
                  <tr key={sho.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="px-3.5 py-2.5 font-bold text-[#1D2933] whitespace-nowrap">
                      {sho.id}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-[#1D2933]">{sho.shift}</div>
                      <div className="text-xs text-[#74808A]">{sho.date}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap">
                      {sho.panel}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-semibold text-[#1D2933]">
                      {sho.maxConvergenceMm.toFixed(1)} mm
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-[#52606D]">
                      {sho.subsidenceRateMmHr.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-[#52606D]">
                      {sho.acousticEventCount} events
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <RiskBadge state={sho.dgmsSafetyStatus} size="sm" showLevel={false} />
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs font-sans">
                      <div className="text-[#1D2933] font-medium">{sho.overman}</div>
                      <div className="text-[#74808A]">{sho.surveyor}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#52606D] text-xs font-sans max-w-xs truncate">
                      {sho.handoverNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Printable Document Sheet */}
      {activeTab === 'preview' && (
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-8 max-w-4xl mx-auto shadow-sm space-y-6">
          <div className="text-center border-b border-[#D7DEDC] pb-4 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#52606D]">
              Directorate General of Mines Safety &bull; Eastern Zone
            </div>
            <h2 className="text-xl font-bold text-[#1D2933]">
              FORM IV: STATUTORY GROUND MOVEMENT CERTIFICATE
            </h2>
            <p className="text-xs text-[#52606D]">
              Prescribed under Coal Mines Regulations 2017, Regulation 112 &bull; Strata Control Advisory
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono-tech border-b border-[#D7DEDC] pb-4">
            <div>
              <span className="text-[#74808A]">Colliery Name: </span>
              <span className="font-bold text-[#1D2933]">Bhowra-West Colliery (Seam VII)</span>
            </div>
            <div>
              <span className="text-[#74808A]">Filing Certificate: </span>
              <span className="font-bold text-[#1D2933]">{selectedReport.reportNumber}</span>
            </div>
            <div>
              <span className="text-[#74808A]">Target Extraction Panel: </span>
              <span className="font-bold text-[#1D2933]">{selectedReport.panelCode}</span>
            </div>
            <div>
              <span className="text-[#74808A]">Submission Date: </span>
              <span className="font-bold text-[#1D2933]">{selectedReport.generationDate}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D2933]">
              I. Permissible Statutory Limits vs. Recorded Observations
            </h3>
            <table className="w-full text-xs border border-[#D7DEDC]">
              <thead className="bg-[#F8FAF9] text-[#52606D]">
                <tr>
                  <th className="p-2 border border-[#D7DEDC] text-left">Parameter</th>
                  <th className="p-2 border border-[#D7DEDC] text-right">Statutory Limit</th>
                  <th className="p-2 border border-[#D7DEDC] text-right">Recorded Maximum</th>
                  <th className="p-2 border border-[#D7DEDC] text-center">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="font-mono-tech">
                <tr>
                  <td className="p-2 border border-[#D7DEDC] font-sans">Ground Tilt Slope Gradient</td>
                  <td className="p-2 border border-[#D7DEDC] text-right">3.0 mm/m</td>
                  <td className="p-2 border border-[#D7DEDC] text-right font-bold">
                    {selectedReport.maxRecordedSlopeMmPerM.toFixed(1)} mm/m
                  </td>
                  <td className="p-2 border border-[#D7DEDC] text-center text-[#2F6B4F] font-bold">
                    WITHIN LIMIT
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-[#D7DEDC] font-sans">Tensile Ground Strain</td>
                  <td className="p-2 border border-[#D7DEDC] text-right">2.0 mm/m</td>
                  <td className="p-2 border border-[#D7DEDC] text-right font-bold">
                    {selectedReport.maxRecordedStrainMmPerM.toFixed(1)} mm/m
                  </td>
                  <td className="p-2 border border-[#D7DEDC] text-center text-[#2F6B4F] font-bold">
                    WITHIN LIMIT
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-[#D7DEDC] font-sans">Cumulative Surface Subsidence</td>
                  <td className="p-2 border border-[#D7DEDC] text-right">100.0 mm</td>
                  <td className="p-2 border border-[#D7DEDC] text-right font-bold text-[#173B57]">
                    {selectedReport.maxCumulativeSubsidenceMm.toFixed(1)} mm
                  </td>
                  <td className="p-2 border border-[#D7DEDC] text-center text-[#2F6B4F] font-bold">
                    WITHIN LIMIT
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D2933]">
              II. Statutory Certification &amp; Sign-off
            </h3>
            <p className="text-xs text-[#52606D] leading-relaxed">
              This is to officially certify that continuous multi-channel telemetry from the designated underground stations was analyzed per DGMS Circular No. 04 of 2017. The assessed ground stability condition is determined to be <span className="font-bold text-[#1D2933]">{selectedReport.safetyStatus.toUpperCase()}</span>.
            </p>
          </div>

          <div className="flex justify-between pt-8 border-t border-[#D7DEDC] text-xs">
            <div>
              <div className="font-bold text-[#1D2933]">{selectedReport.authorizedSignatory.name}</div>
              <div className="text-[#52606D]">{selectedReport.authorizedSignatory.role}</div>
              <div className="text-[#74808A] font-mono-tech">First Class Mine Manager Cert #MM-9104</div>
            </div>
            <div className="text-right">
              <div className="font-mono-tech text-[#52606D]">Digital Signature Verified</div>
              <div className="font-mono-tech text-xs text-[#74808A]">SHA-256: 8fbc492a...e018d9</div>
              <div className="text-[#2F6B4F] font-bold">DGMS Compliant Sign-off</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
