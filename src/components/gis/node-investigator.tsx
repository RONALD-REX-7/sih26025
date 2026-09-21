'use client';

import React, { useState } from 'react';
import { SensorNode } from '@/lib/domain/types';
import { RiskState } from '@/lib/domain/risk-states';
import { AnomalyRecord } from '@/lib/ai/types';
import { SubsidenceEventRecord } from '@/lib/domain/gis-types';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { StatusDot } from '@/components/industrial/status-dot';
import { Button } from '@/components/ui/button';
import {
  Cpu,
  Battery,
  Wifi,
  Compass,
  ShieldCheck,
  Play,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface NodeInvestigatorProps {
  node: SensorNode;
  riskState: RiskState;
  activeAnomalies: AnomalyRecord[];
  latestReadings: Record<string, { value: number; unit: string; qualityScore?: number }>;
  associatedEvents: SubsidenceEventRecord[];
  onSelectEvent?: (eventId: string) => void;
  onClose?: () => void;
  className?: string;
}

export function NodeInvestigator({
  node,
  riskState,
  activeAnomalies,
  latestReadings,
  associatedEvents,
  onSelectEvent,
  onClose,
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
    <div className={`bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden flex flex-col shadow-xs ${className || ''}`}>
      {/* Node Identity Header */}
      <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-sm bg-[#EDF1F0] text-[#173B57]">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold font-mono-tech flex items-center gap-2 text-[#173B57]">
                {node.node_code}
                <RiskBadge state={riskState} size="sm" showIcon={false} />
              </div>
              <p className="text-xs text-[#52606D]">
                {node.panel?.name || 'Panel P-101'} &bull; Seam VII/VIII
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusDot status={node.status === 'online' ? 'online' : 'offline'} label={node.status.toUpperCase()} />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#74808A] hover:text-[#1D2933] p-1 rounded-sm cursor-pointer"
                title="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Edge Hardware Vitals */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 mt-2 border-t border-[#D7DEDC] text-xs font-mono-tech text-[#52606D]">
          <div className="flex items-center gap-1">
            <Battery className="h-3.5 w-3.5 text-[#173B57]" />
            <span>{node.battery_level.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-[#173B57]" />
            <span>-88 dBm</span>
          </div>
          <div className="flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-[#173B57]" />
            <span>{node.elevation_m}m</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#D7DEDC] px-3 bg-[#FFFFFF]">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`py-2 px-2.5 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'telemetry'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Telemetry
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={`py-2 px-2.5 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1 ${
            activeTab === 'anomalies'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Anomalies
          {activeAnomalies.length > 0 && (
            <span className="h-4 w-4 rounded-full bg-[#B42318] text-[#FFFFFF] text-xs flex items-center justify-center font-bold">
              {activeAnomalies.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-2 px-2.5 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Evidence
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2 px-2.5 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === 'events'
              ? 'border-[#173B57] text-[#173B57] font-semibold'
              : 'border-transparent text-[#52606D] hover:text-[#1D2933]'
          }`}
        >
          Events ({associatedEvents.length})
        </button>
      </div>

      <div className="p-3.5 flex-1 text-xs space-y-3">
        {/* TAB 1: Live Telemetry Streams */}
        {activeTab === 'telemetry' && (
          <div className="space-y-2">
            <div className="border border-[#D7DEDC] rounded-sm overflow-hidden">
              <table className="w-full text-left table-industrial">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th className="text-right">Reading</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="font-semibold text-[#1D2933]">Extensometer (DISP_Z)</div>
                      <div className="text-xs text-[#52606D]">Baseline: 18.5 mm &bull; Limit: 30 mm</div>
                    </td>
                    <td className="text-right font-mono-tech font-bold">
                      <span className={disp > 30 ? 'text-[#B42318]' : 'text-[#1D2933]'}>
                        {disp.toFixed(2)} mm
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-[#1D2933]">Biaxial Tilt X (TILT_X)</div>
                      <div className="text-xs text-[#52606D]">Pitch Gradient &bull; Arcseconds</div>
                    </td>
                    <td className="text-right font-mono-tech font-bold text-[#1D2933]">
                      {tiltX.toFixed(2)} arcsec
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-[#1D2933]">Biaxial Tilt Y (TILT_Y)</div>
                      <div className="text-xs text-[#52606D]">Roll Gradient &bull; Arcseconds</div>
                    </td>
                    <td className="text-right font-mono-tech font-bold text-[#1D2933]">
                      {tiltY.toFixed(2)} arcsec
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-[#1D2933]">Microseismic (VIB_RMS)</div>
                      <div className="text-xs text-[#52606D]">Acoustic Velocity Limit: 5.0 mm/s</div>
                    </td>
                    <td className="text-right font-mono-tech font-bold">
                      <span className={vib > 4.0 ? 'text-[#A85A00]' : 'text-[#1D2933]'}>
                        {vib.toFixed(2)} mm/s
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="font-semibold text-[#1D2933]">Pillar Strain (STRAIN)</div>
                      <div className="text-xs text-[#52606D]">Pillar Flexure (µε)</div>
                    </td>
                    <td className="text-right font-mono-tech font-bold">
                      <span className={strain > 600 ? 'text-[#B42318]' : 'text-[#1D2933]'}>
                        {strain.toFixed(1)} µε
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Anomaly History */}
        {activeTab === 'anomalies' && (
          <div className="space-y-2">
            {activeAnomalies.length > 0 ? (
              <div className="space-y-2">
                {activeAnomalies.map((ano) => (
                  <div
                    key={ano.id}
                    className="p-3 rounded-sm border border-[#B42318]/30 bg-[#FDF0ED] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#B42318] font-mono-tech text-xs">
                        {ano.sensorCode}
                      </span>
                      <span className="text-xs font-mono-tech font-bold text-[#B42318] uppercase">
                        {ano.anomalyType} [{ano.severity}]
                      </span>
                    </div>
                    <p className="text-xs text-[#1D2933] font-mono-tech">
                      Z-Score: <strong>{ano.zScore.toFixed(2)}</strong> &bull; Rate of Change:{' '}
                      <strong>{ano.rateOfChange.toFixed(3)} {ano.unit}/s</strong>
                    </p>
                    <div className="text-xs text-[#52606D] font-mono-tech">
                      Persistence: {ano.persistenceSec}s &bull; Confidence: {(ano.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[#52606D] text-xs space-y-1">
                <ShieldCheck className="h-6 w-6 text-[#2F6B4F] mx-auto mb-1" />
                <div className="font-semibold text-[#1D2933]">No Active Anomalies</div>
                <p className="text-xs text-[#52606D]">
                  All 5 channels on {node.node_code} are operating within baseline bounds (|z| &lt; 2.5).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Evidence */}
        {activeTab === 'evidence' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-1.5">
              <div className="text-[11px] uppercase font-semibold text-[#74808A]">
                Calculated Local Tilt Slope Vector
              </div>
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-[#52606D]">Resultant Slope:</span>
                <strong className={tiltSlopeMmPerM > 2.0 ? 'text-[#A85A00]' : 'text-[#2F6B4F]'}>
                  {tiltSlopeMmPerM} mm/m
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs text-[#52606D] font-mono-tech">
                <span>DGMS Advisory Limit:</span>
                <span>3.00 mm/m</span>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] space-y-1.5">
              <div className="text-[11px] uppercase font-semibold text-[#74808A]">
                Strata &amp; InSAR Context
              </div>
              <div className="space-y-1 text-[#52606D] text-xs">
                <div>&bull; Seam: VII/VIII (Thickness: 4.2m)</div>
                <div>&bull; Panel: {node.panel?.code} (Depth: {node.panel?.depth_m}m)</div>
                <div>&bull; Infrastructure: Railway Siding (~65m)</div>
                <div>&bull; Coherence Score: 0.94 (Optimal LoRaWAN Link)</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Events */}
        {activeTab === 'events' && (
          <div className="space-y-2">
            {associatedEvents.length > 0 ? (
              associatedEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                  className="p-2.5 rounded-sm border border-[#D7DEDC] hover:border-[#173B57] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1D2933] font-mono-tech text-xs">
                      {evt.title}
                    </span>
                    <RiskBadge state={evt.riskState} size="sm" showIcon={false} />
                  </div>
                  <p className="text-xs text-[#52606D] font-mono-tech">
                    Detected: {new Date(evt.detectedAt).toLocaleTimeString()} &bull; Max Disp: {evt.maxDisplacementMm}mm
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#52606D] text-xs">
                No historical events recorded for this station.
              </div>
            )}
          </div>
        )}

        {/* Footer Link */}
        <div className="pt-2 border-t border-[#D7DEDC] flex justify-between items-center text-xs">
          <span className="text-xs text-[#74808A] font-mono-tech">
            {node.latitude.toFixed(4)}°N, {node.longitude.toFixed(4)}°E
          </span>
          <Link href="/simulator">
            <Button size="sm" variant="outline" className="text-xs h-7 font-mono-tech border-[#D7DEDC]">
              <Play className="h-3 w-3 mr-1" />
              Simulate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
