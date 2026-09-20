'use client';

import React from 'react';
import { GEOMECHANICAL_REFERENCE } from '@/lib/data/gis-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Layers } from 'lucide-react';

interface GeomechanicalProfileViewProps {
  measuredDispMm?: number; // e.g. from live sensor SN-102
  className?: string;
}

export function GeomechanicalProfileView({
  measuredDispMm = 18.5,
  className,
}: GeomechanicalProfileViewProps) {
  const profile = GEOMECHANICAL_REFERENCE;

  return (
    <Card className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${className || ''}`}>
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                EMPIRICAL GEOTECHNICAL REFERENCE PROFILE
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-purple-50 text-purple-700 border-purple-200">
                CMPDI / DGMS GUIDELINES
              </Badge>
            </div>
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {profile.title}
            </CardTitle>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>Seam Depth: {profile.extractionDepthM}m</span>
            <span>&bull;</span>
            <span>Angle of Draw: {profile.angleDrawDegrees}&deg;</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Caveat & Safety Notice Banner */}
        <div className="p-3 rounded-md bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 text-purple-950 dark:text-purple-200 text-[11px] font-mono leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
            <div>
              <strong>Methodology &amp; Empirical Standard:</strong> {profile.methodology}
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                {profile.caveatNotice}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Sectional Strata Vector Visualizer */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#0a0f1d] text-slate-100">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>CROSS-SECTION A-A&apos; &bull; SEAM VII EXTRACTION RIB TO SURFACE</span>
            <span className="text-emerald-400">Measured Sensor Disp: {measuredDispMm.toFixed(1)} mm</span>
          </div>

          <svg viewBox="0 0 600 220" className="w-full h-auto">
            {/* Surface Line (y=30) */}
            <line x1="20" y1="30" x2="580" y2="30" stroke="#64748b" strokeWidth="2" />
            <text x="25" y="22" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              ORIGINAL GROUND SURFACE (+175m MSL)
            </text>

            {/* Empirical Subsidence Trough Curve S(x) */}
            <path
              d="M 40,30 C 140,30 200,85 300,85 C 400,85 460,30 560,30"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
            />
            <text x="230" y="105" fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
              EMPIRICAL BASIN TROUGH (Smax = 38.5mm)
            </text>

            {/* Live Sensor Measurement Plot Point */}
            <circle cx="300" cy={30 + (measuredDispMm / 38.5) * 55} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="312" y={32 + (measuredDispMm / 38.5) * 55} fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">
              SN-102: {measuredDispMm.toFixed(1)}mm
            </text>

            {/* Coal Seam VII/VIII (y=180) */}
            <rect x="180" y="175" width="240" height="20" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="240" y="188" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">
              GOAF CAVING ZONE (SEAM VII)
            </text>

            {/* Angle of Draw projection lines (32°) */}
            <line x1="180" y1="175" x2="60" y2="30" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,3" />
            <line x1="420" y1="175" x2="540" y2="30" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,3" />
            <text x="80" y="110" fill="#f59e0b" fontSize="8" fontFamily="monospace">
              Draw Angle θ = 32°
            </text>
            <text x="470" y="110" fill="#f59e0b" fontSize="8" fontFamily="monospace">
              Draw Angle θ = 32°
            </text>

            {/* Inflection points (Critical Tensile Strain Boundary) */}
            <line x1="200" y1="20" x2="200" y2="40" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="400" y1="20" x2="400" y2="40" stroke="#ef4444" strokeWidth="1.5" />
            <text x="135" y="15" fill="#f87171" fontSize="8" fontFamily="monospace">
              Inflection (Max Tension)
            </text>
            <text x="405" y="15" fill="#f87171" fontSize="8" fontFamily="monospace">
              Inflection (Max Tension)
            </text>
          </svg>
        </div>

        {/* Empirical Parameters Reference Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Angle of Draw (θ)</span>
            <strong className="text-slate-900 dark:text-slate-100">{profile.angleDrawDegrees}&deg; (Jharia Basin)</strong>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Inflection Distance</span>
            <strong className="text-slate-900 dark:text-slate-100">{profile.inflectionPointDistanceM} meters</strong>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Subsidence Factor (a)</span>
            <strong className="text-slate-900 dark:text-slate-100">0.65 (Sand Stowing)</strong>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block">Seam Extraction</span>
            <strong className="text-slate-900 dark:text-slate-100">{profile.seamThicknessM}m Thickness</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
