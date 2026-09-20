'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEMO_MINE, DEMO_PANELS } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Layers, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MinePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Colliery Strata Architecture
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {DEMO_MINE.name}
          </h1>
          <p className="text-xs text-slate-500">
            {DEMO_MINE.location_name} &bull; DGMS Dhanbad Central Circle &bull; Seam VII / VIII Top
          </p>
        </div>

        <Link href="/gis">
          <Button size="sm" variant="outline" className="text-xs">
            <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Inspect on Underground GIS
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-500 font-medium">Extraction Method</span>
            <CardTitle className="text-lg font-bold">Bord & Pillar / Depillaring</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            With hydraulic sand stowing in central seam section.
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-500 font-medium">Depth Range of Workings</span>
            <CardTitle className="text-lg font-bold font-mono">150m &ndash; 265m</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            Overburden comprised of Barakar sandstones and shale beds.
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <span className="text-xs text-slate-500 font-medium">Subsidence Category</span>
            <CardTitle className="text-lg font-bold text-amber-600">Category-IV Severe</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            High extraction ratio requiring continuous telemetry surveillance.
          </CardContent>
        </Card>
      </div>

      {/* Panels Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Underground Extraction Panels
          </CardTitle>
          <CardDescription className="text-xs">
            Active panels with assigned telemetry monitoring nodes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Panel Code</TableHead>
                <TableHead>Working Name</TableHead>
                <TableHead>Seam Depth</TableHead>
                <TableHead>Extraction Method</TableHead>
                <TableHead>Working Status</TableHead>
                <TableHead>Associated Nodes</TableHead>
                <TableHead>Risk State</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_PANELS.map((panel, idx) => (
                <TableRow key={panel.id} className="text-xs">
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {panel.code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                    {panel.name}
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">
                    {panel.depth_m.toFixed(1)} m
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {panel.extraction_method}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono capitalize">
                      {panel.extraction_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    SN-10{idx * 4 + 1} &ndash; SN-10{idx * 4 + 4} (4 nodes)
                  </TableCell>
                  <TableCell>
                    <RiskBadge state={idx === 2 ? 'Watch' : 'Normal'} size="sm" showLevel={false} />
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
