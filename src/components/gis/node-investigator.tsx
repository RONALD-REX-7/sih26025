'use client';

import React, { useState } from 'react';
import { SensorNode } from '@/lib/domain/types';
import { RiskState } from '@/lib/domain/risk-states';
import { AnomalyRecord } from '@/lib/ai/types';
import { SubsidenceEventRecord } from '@/lib/domain/gis-types';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Battery,
  Wifi,
  Compass,
  ShieldCheck,
  Play,
} from 'lucide-react';
import Link from 'next/link';

interface NodeInvestigatorProps {
  node: SensorNode;
  riskState: RiskState;
  activeAnomalies: AnomalyRecord[];
  latestReadings: Record<string, { value: number; unit: string; qualityScore?: number }>;
  associatedEvents: SubsidenceEventRecord[];
  onSelectEvent?: (eventId: string) => void;
  className?: string;
}

export function NodeInvestigator({
  node,
  riskState,
  activeAnomalies,
  latestReadings,
  associatedEvents,
  onSelectEvent,
  className,
}: NodeInvestigatorProps) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'anomalies' | 'evidence' | 'events'>('telemetry');

  // Read latest transducer channels
  const disp = latestReadings[`${node.node_code}-DISP_Z`]?.value ?? 18.5;
  const tiltX = latestReadings[`${node.node_code}-TILT_X`]?.value ?? 12.4;
  const tiltY = latestReadings[`${node.node_code}-TILT_Y`]?.value ?? -8.2;
  const vib = latestReadings[`${node.node_code}-VIB_RMS`]?.value ?? 1.2;
  const strain = latestReadings[`${node.node_code}-STRAIN`]?.value ?? 420.0;

  // Local Tilt Vector magnitude in mm/m (1 arcsec ≈ 0.00485 mm/m)
  const tiltMagnitudeArcsec = Math.sqrt(tiltX * tiltX + tiltY * tiltY);
  const tiltSlopeMmPerM = parseFloat((tiltMagnitudeArcsec * 0.004848).toFixed(2));

  return (
    <Card className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col ${className || ''}`}>
      {/* Node Identity Header */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2">
                {node.node_code}
                <RiskBadge state={riskState} size="sm" showIcon={false} />
              </CardTitle>
              <CardDescription className="text-[11px] font-mono">
                {node.panel?.name || 'Panel P-101'} &bull; Seam VII/VIII
              </CardDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] font-mono uppercase ${
              node.status === 'online'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-red-50 text-red-700 border-red-300'
            }`}
          >
            {node.status}
          </Badge>
        </div>

        {/* Edge Hardware Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Battery className="h-3 w-3 text-slate-400" />
            <span>Batt: {node.battery_level.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-3 w-3 text-slate-400" />
            <span>RSSI: -88 dBm</span>
          </div>
          <div className="flex items-center gap-1">
            <Compass className="h-3 w-3 text-slate-400" />
            <span>Elev: {node.elevation_m}m</span>
          </div>
        </div>
      </CardHeader>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 bg-slate-50/40 dark:bg-slate-900/40">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Telemetry (5)
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1 ${
            activeTab === 'anomalies'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Anomalies
          {activeAnomalies.length > 0 && (
            <span className="h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
              {activeAnomalies.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Evidence
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 px-2.5 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'events'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Events ({associatedEvents.length})
        </button>
      </div>

      <CardContent className="p-4 flex-1 text-xs space-y-3">
        {/* TAB 1: Live Telemetry Streams */}
        {activeTab === 'telemetry' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Transducer Channel</span>
              <span>Engineering Value</span>
            </div>

            <div className="space-y-1.5">
              {/* Displacement */}
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    Borehole Extensometer (DISP_Z)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Baseline: 18.5 mm &bull; DGMS Crit: 48.0 mm
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold ${disp > 32 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {disp.toFixed(2)} mm
                  </div>
                  <span className="text-[9px] text-slate-400">Δ {(disp - 18.5).toFixed(2)} mm</span>
                </div>
              </div>

              {/* Biaxial Tilt X */}
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    Biaxial Tilt X-Axis (TILT_X)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Pitch Gradient &bull; Arcseconds
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {tiltX.toFixed(2)} arcsec
                  </div>
                  <span className="text-[9px] text-slate-400">Δ {(tiltX - 12.4).toFixed(2)}</span>
                </div>
              </div>

              {/* Biaxial Tilt Y */}
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    Biaxial Tilt Y-Axis (TILT_Y)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Roll Gradient &bull; Arcseconds
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {tiltY.toFixed(2)} arcsec
                  </div>
                  <span className="text-[9px] text-slate-400">Δ {(tiltY - -8.2).toFixed(2)}</span>
                </div>
              </div>

              {/* Vibration RMS */}
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    Microseismic Vibration (VIB_RMS)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Acoustic Velocity &bull; Threshold: 5.0 mm/s
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold ${vib > 4.0 ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {vib.toFixed(2)} mm/s
                  </div>
                  <span className="text-[9px] text-slate-400">Calibrated RMS</span>
                </div>
              </div>

              {/* Rockbolt Strain */}
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    Rockbolt / Pillar Strain (STRAIN)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Pillar Flexure &bull; Microstrain (με)
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold ${strain > 600 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {strain.toFixed(1)} με
                  </div>
                  <span className="text-[9px] text-slate-400">Tensile</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Anomaly History */}
        {activeTab === 'anomalies' && (
          <div className="space-y-3">
            {activeAnomalies.length > 0 ? (
              <div className="space-y-2">
                {activeAnomalies.map((ano) => (
                  <div
                    key={ano.id}
                    className="p-3 rounded border border-red-200/80 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-900 dark:text-red-200 font-mono text-[11px]">
                        {ano.sensorCode}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono border-red-300 text-red-700">
                        {ano.anomalyType} [{ano.severity}]
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                      Z-Score: <strong>{ano.zScore.toFixed(2)}</strong> &bull; Rate of Change:{' '}
                      <strong>{ano.rateOfChange.toFixed(3)} {ano.unit}/s</strong>
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Persistence: {ano.persistenceSec}s &bull; Confidence: {(ano.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-mono text-xs space-y-1">
                <ShieldCheck className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                <div className="font-semibold text-slate-700 dark:text-slate-300">No Active Anomalies</div>
                <p className="text-[11px] text-slate-400">
                  All 5 channels on {node.node_code} are operating within rolling Z-score bounds (|z| &lt; 2.5).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Contributing Evidence & Geotechnical Vector */}
        {activeTab === 'evidence' && (
          <div className="space-y-3 font-mono text-[11px]">
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500">
                Calculated Local Tilt Slope Vector
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Resultant Slope:</span>
                <strong className={tiltSlopeMmPerM > 2.0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {tiltSlopeMmPerM} mm/m
                </strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>DGMS Regulatory Advisory Limit:</span>
                <span>3.00 mm/m</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500">
                Strata & InSAR Georeferenced Context
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[10px]">
                <div>&bull; Seam: VII/VIII (Thickness: 4.2m)</div>
                <div>&bull; Panel: {node.panel?.code} (Depth: {node.panel?.depth_m}m)</div>
                <div>&bull; Nearest Infrastructure: Indian Railways Surface Siding (~65m)</div>
                <div>&bull; Coherence Score: 0.94 (Optimal LoRaWAN LOS Link)</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Event History */}
        {activeTab === 'events' && (
          <div className="space-y-2">
            {associatedEvents.length > 0 ? (
              associatedEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                  className="p-2.5 rounded border border-slate-200 dark:border-slate-800 hover:border-slate-400 cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                      {evt.title}
                    </span>
                    <RiskBadge state={evt.riskState} size="sm" showIcon={false} />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 font-mono">
                    Detected: {new Date(evt.detectedAt).toLocaleTimeString()} &bull; Max Disp: {evt.maxDisplacementMm}mm
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 font-mono text-xs">
                No historical events recorded for this station.
              </div>
            )}
          </div>
        )}

        {/* Quick link to Simulator */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-mono">
            Node Lat: {node.latitude.toFixed(4)}°N
          </span>
          <Link href="/simulator">
            <Button size="sm" variant="outline" className="text-[11px] h-7 font-mono">
              <Play className="h-3 w-3 mr-1" />
              Simulate Node
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
