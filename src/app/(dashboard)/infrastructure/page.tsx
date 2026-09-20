'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEMO_INFRASTRUCTURE } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Building2, TrainTrack, Fan, Compass } from 'lucide-react';

export default function InfrastructurePage() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SURFACE_RAILWAY':
        return <TrainTrack className="h-4 w-4 text-blue-600" />;
      case 'VENTILATION_SHAFT':
        return <Fan className="h-4 w-4 text-emerald-600" />;
      case 'MAIN_HAULAGE_ROADWAY':
        return <Compass className="h-4 w-4 text-amber-600" />;
      default:
        return <Building2 className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Structural Integrity & Surface Protection
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Critical Infrastructure Surveillance
          </h1>
          <p className="text-xs text-slate-500">
            DGMS safety perimeters, railway siding overlays, and underground ventilation shaft protection barriers.
          </p>
        </div>

        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900 text-xs font-mono">
          3 Assets Monitored
        </Badge>
      </div>

      {/* Infrastructure Registry Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            Protected Assets & Regulatory Buffer Zones
          </CardTitle>
          <CardDescription className="text-xs">
            Ground movement tolerance limits specified under Coal Mines Regulations (CMR 2017)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Asset Code</TableHead>
                <TableHead>Structure Name</TableHead>
                <TableHead>Spatial Location</TableHead>
                <TableHead>DGMS Buffer Margin</TableHead>
                <TableHead>Max Strain Limit</TableHead>
                <TableHead>Assigned Sensors</TableHead>
                <TableHead>Stability Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_INFRASTRUCTURE.map((asset) => (
                <TableRow key={asset.id} className="text-xs">
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {asset.code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {getCategoryIcon(asset.category)}
                    <span>{asset.name}</span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-[11px]">
                    {asset.location}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {asset.regulatoryBufferDistanceMeters} meters
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                    {asset.criticalStrainLimitMmPerM} mm/m
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    {asset.monitoringNodeCodes.join(', ')}
                  </TableCell>
                  <TableCell>
                    <RiskBadge state={asset.currentRiskState} size="sm" showLevel={false} />
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
