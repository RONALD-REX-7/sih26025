'use client';

import React from 'react';
import Link from 'next/link';
import { DEMO_MINE, DEMO_PANELS } from '@/lib/data/mock-data';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Button } from '@/components/ui/button';
import { Layers, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function MinePage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#173B57]" />
              Colliery Site &amp; Panel Stratigraphy
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            {DEMO_MINE.name} &bull; Stratigraphic Profile
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            {DEMO_MINE.location_name} &bull; DGMS Dhanbad Central Circle &bull; Seam VII/VIII Combined Working
          </p>
        </div>

        <Link href="/gis">
          <Button size="sm" variant="outline" className="text-xs h-8 font-mono-tech border-[#D7DEDC]">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#173B57]" />
            Inspect on Underground GIS
          </Button>
        </Link>
      </div>

      {/* Geomechanical Stratigraphy & Stowing Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-2 shadow-xs">
          <div className="text-xs font-mono-tech font-semibold uppercase text-[#173B57] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#173B57]" />
            Barakar Geological Formation &amp; Overburden
          </div>
          <p className="text-xs text-[#52606D] leading-relaxed">
            The working coal seam (VII/VIII combined, thickness 4.2m) occurs at depths ranging from 185m to 265m below ground surface. The overburden comprises interbedded medium-to-coarse Barakar sandstones (62%), sandy shales (24%), and carbonaceous shales (14%) with empirical draw angle θ = 32°.
          </p>
          <div className="pt-2 border-t border-[#D7DEDC] grid grid-cols-2 gap-2 text-xs font-mono-tech text-[#52606D]">
            <div>Angle of Draw: <strong className="text-[#1D2933]">32°</strong></div>
            <div>Rock Mass Rating: <strong className="text-[#1D2933]">58 (Fair)</strong></div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-2 shadow-xs">
          <div className="text-xs font-mono-tech font-semibold uppercase text-[#173B57] flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[#173B57]" />
            Extraction Method &amp; Hydraulic Stowing
          </div>
          <p className="text-xs text-[#52606D] leading-relaxed">
            Bord and pillar method with continuous depillaring under hydraulic sand stowing. River sand is pumped underground through 150mm borehole ranges at 1:2.5 solid-to-water ratio to minimize surface trough subsidence beneath the Indian Railways Chandrapura-Adra siding.
          </p>
          <div className="pt-2 border-t border-[#D7DEDC] grid grid-cols-2 gap-2 text-xs font-mono-tech text-[#52606D]">
            <div>Stowing Void Fill: <strong className="text-[#2F6B4F]">92.4%</strong></div>
            <div>Safety Buffer: <strong className="text-[#A85A00]">45m Railway</strong></div>
          </div>
        </div>
      </div>

      {/* Panels Register Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
          <span className="font-semibold text-sm text-[#173B57]">
            Underground Extraction Panels Register ({DEMO_PANELS.length} Active Working Districts)
          </span>
          <span className="text-xs font-mono-tech text-[#74808A]">DGMS Form IV Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-industrial">
            <thead>
              <tr>
                <th>Panel Code</th>
                <th>Working District</th>
                <th className="text-right">Seam Depth</th>
                <th>Extraction Technique</th>
                <th>Telemetry Stations</th>
                <th>Condition</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_PANELS.map((p) => (
                <tr key={p.id} className="transition-colors">
                  <td className="font-mono-tech font-bold text-[#173B57]">{p.code}</td>
                  <td className="font-semibold text-xs text-[#1D2933]">{p.name}</td>
                  <td className="font-mono-tech text-right text-xs text-[#1D2933]">{p.depth_m}m</td>
                  <td className="text-xs text-[#52606D]">{p.extraction_method}</td>
                  <td className="font-mono-tech text-xs text-[#173B57]">
                    {p.code === 'P-101' ? 'SN-101 to SN-104 (4 Nodes)' : p.code === 'P-102' ? 'SN-105 to SN-108 (4 Nodes)' : p.code === 'P-103' ? 'SN-109 to SN-112 (4 Nodes)' : 'SN-113 to SN-116 (4 Nodes)'}
                  </td>
                  <td>
                    <RiskBadge state={p.code === 'P-101' ? 'Advisory' : 'Normal'} size="sm" showIcon={false} />
                  </td>
                  <td className="text-right">
                    <Link href="/gis" className="text-xs font-mono-tech text-[#173B57] hover:underline inline-flex items-center gap-1">
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
