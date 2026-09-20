'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DGMS_REGULATORY_THRESHOLDS, DEMO_MINE_INFO, SENSOR_METADATA } from '@/lib/domain/constants';
import { ShieldCheck, Scale, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            System Configuration
          </span>
          <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            DGMS CIRCULAR COMPLIANT
          </Badge>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Geotechnical Thresholds & Colliery Profile</h1>
        <p className="text-xs text-slate-500">
          Regulatory ground stability criteria and operational thresholds for Jharia Coalfield.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colliery Baseline */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              Colliery Geological Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Primary location and strata parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Mine Name</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Coalfield & Region</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.coalField}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Target Seam</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.seamName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Depth Range</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.depthRange}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">DGMS Classification</span>
              <span className="font-semibold text-amber-600">{DEMO_MINE_INFO.dgmsClassification}</span>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Thresholds */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600" />
              DGMS Safety Standards
            </CardTitle>
            <CardDescription className="text-xs">
              Permissible subsidence gradient and strain limits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Max Allowable Slope</span>
              <span className="font-mono font-semibold">{DGMS_REGULATORY_THRESHOLDS.maxAllowableSubsidenceSlope} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Critical Slope (Mandatory Evac)</span>
              <span className="font-mono font-semibold text-red-600">{DGMS_REGULATORY_THRESHOLDS.criticalSubsidenceSlope} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500">Max Horizontal Strain</span>
              <span className="font-mono font-semibold">{DGMS_REGULATORY_THRESHOLDS.maxAllowableHorizontalStrain} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Railway Buffer Perimeter</span>
              <span className="font-mono font-semibold">{DGMS_REGULATORY_THRESHOLDS.railwayProtectedMarginMeters} meters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Channel Thresholds */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Sensor Modality Threshold Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            Configured warning and critical cutoffs per physical channel
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Sensor Type</TableHead>
                <TableHead>Channel Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Nominal Range</TableHead>
                <TableHead>Warning Cutoff</TableHead>
                <TableHead>Critical Cutoff</TableHead>
                <TableHead>Max Rate / Min</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(SENSOR_METADATA).map((s) => (
                <TableRow key={s.type} className="text-xs">
                  <TableCell className="font-mono font-bold text-[11px]">
                    {s.type}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {s.displayName}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">
                    {s.unit}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    [{s.nominalRange[0]}, {s.nominalRange[1]}]
                  </TableCell>
                  <TableCell className="font-mono text-amber-600 font-semibold">
                    {s.warningThreshold}
                  </TableCell>
                  <TableCell className="font-mono text-red-600 font-semibold">
                    {s.criticalThreshold}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">
                    {s.rateOfChangeLimitPerMinute} {s.unit}/min
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
