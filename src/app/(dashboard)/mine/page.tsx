'use client';

import React from 'react';
import Link from 'next/link';
import { DEMO_MINE, DEMO_PANELS } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Button } from '@/components/ui/button';
import { Layers, MapPin, ExternalLink } from 'lucide-react';

export default function MinePage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Colliery Site &amp; Panel Stratigraphy
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {DEMO_MINE.name} &bull; Strata Profile
          </h1>
          <p className="text-xs text-slate-500">
            {DEMO_MINE.location_name} &bull; DGMS Dhanbad Central Circle &bull; Seam VII/VIII Combined Working
          </p>
        </div>

        <Link href="/gis">
          <Button size="sm" variant="outline" className="text-xs h-8 font-mono">
            <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Inspect on Underground GIS
          </Button>
        </Link>
      </div>

      {/* Geological & Mining Parameters Grid (No card bloat) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Extraction Method</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Bord &amp; Pillar Depillaring
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            With hydraulic sand stowing in central extraction section.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Working Seam Depth</div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            150m &ndash; 265m Depth
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Barakar formation sandstone, shale, and coal seams.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Regulatory Classification</div>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
            Category-IV Severe
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Mandatory real-time surface &amp; stratum telemetry under Reg. 112.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Surface Sensitivity</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Railway Siding Buffer
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            45m statutory non-subsidence corridor crossing Panel P-101.
          </p>
        </div>
      </div>

      {/* Panels Register */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
              Underground Extraction Panels Register
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{DEMO_PANELS.length} Active Working Districts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left">Code</th>
                <th className="py-2.5 px-3 text-left">Working District</th>
                <th className="py-2.5 px-3 text-right">Seam Depth</th>
                <th className="py-2.5 px-3 text-left">Method</th>
                <th className="py-2.5 px-3 text-left">Status</th>
                <th className="py-2.5 px-3 text-left">Telemetry Cluster</th>
                <th className="py-2.5 px-3 text-center">Risk</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {DEMO_PANELS.map((panel, idx) => (
                <tr key={panel.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {panel.code}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    {panel.name}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                    {panel.depth_m.toFixed(1)} m
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                    {panel.extraction_method}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded-xs border border-slate-200 dark:border-slate-700 text-[10px] capitalize">
                      {panel.extraction_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                    SN-10{idx * 4 + 1} &ndash; SN-10{idx * 4 + 4} (4 nodes)
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <RiskBadge state={idx === 0 ? 'Normal' : idx === 2 ? 'Watch' : 'Normal'} size="sm" showLevel={false} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <Link href={`/gis?panel=${panel.code}`} className="text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5 text-xs">
                      GIS <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
