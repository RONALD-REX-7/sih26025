'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEMO_COMPLIANCE_REPORTS } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const handleExportCsv = (reportNum: string) => {
    alert(`Exporting official DGMS telemetry audit report for ${reportNum} (CSV format).`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Regulatory Traceability & Compliance
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            DGMS Statutory Reports & Shift Handover Logs
          </h1>
          <p className="text-xs text-slate-500">
            Official periodic ground stability certificates under DGMS Circular (Coal) No. 04 of 2017.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExportCsv('ALL')}
          className="text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export All Records (CSV)
        </Button>
      </div>

      {/* Reports Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Generated Statutory Compliance Filings
          </CardTitle>
          <CardDescription className="text-xs">
            Cryptographically signed digital reports prepared for DGMS inspection
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Report Number</TableHead>
                <TableHead>Extraction Panel</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Max Slope (mm/m)</TableHead>
                <TableHead>Max Strain (mm/m)</TableHead>
                <TableHead>Max Disp (mm)</TableHead>
                <TableHead>Signatory Officer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_COMPLIANCE_REPORTS.map((rep) => (
                <TableRow key={rep.id} className="text-xs">
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {rep.reportNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                    {rep.panelCode}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500 text-[11px]">
                    {rep.generationDate}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {rep.maxRecordedSlopeMmPerM.toFixed(1)} / 3.0
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {rep.maxRecordedStrainMmPerM.toFixed(1)} / 2.0
                  </TableCell>
                  <TableCell className="font-mono text-[11px] font-semibold">
                    {rep.maxCumulativeSubsidenceMm.toFixed(1)} mm
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {rep.authorizedSignatory.name} ({rep.authorizedSignatory.role})
                  </TableCell>
                  <TableCell>
                    <RiskBadge state={rep.safetyStatus} size="sm" showLevel={false} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportCsv(rep.reportNumber)}
                      className="h-7 px-2 text-[11px]"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
