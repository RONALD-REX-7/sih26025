'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DGMS_REGULATORY_THRESHOLDS, DEMO_MINE_INFO, SENSOR_METADATA } from '@/lib/domain/constants';
import { ShieldCheck, Scale, MapPin, Cpu, Sliders } from 'lucide-react';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-4 rounded-md border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-blue-600" />
              System Calibration &amp; Statutory Thresholds
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 rounded-xs">
              CMR 2017 REG 112 COMPLIANT
            </Badge>
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Geotechnical Thresholds &amp; Colliery Stratigraphy Parameters
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational ground stability limit criteria, permissible subsidence gradients, and telemetry transducer calibration matrix for Jharia Coalfield.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-sm">
            CALIBRATION: ACTIVE LOCK
          </Badge>
        </div>
      </div>

      {/* High-Density Parameters Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Regulatory Standard</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            DGMS CMR 2017
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Circular (Coal) No. 04 of 2017
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Critical Evac Slope</p>
          <p className="text-base font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
            {DGMS_REGULATORY_THRESHOLDS.criticalSubsidenceSlope} mm/m
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Mandatory withdrawal threshold
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Seam Classification</p>
          <p className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            Degree III Gassy
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Flameproof Ex d I / Ex ia I required
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Transducer Channels</p>
          <p className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            5 Physical Types
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Tilt, Disp, Vib, Strain, Acoustic
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colliery Baseline */}
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Colliery Geological &amp; Stratigraphic Profile
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DGMS ID: BHW-VII-2026</span>
          </div>
          <div className="p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Mine Name &amp; Area</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-sans">{DEMO_MINE_INFO.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Coalfield &amp; Basin</span>
              <span className="font-medium text-slate-900 dark:text-slate-100 font-sans">{DEMO_MINE_INFO.coalField}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Target Stratum / Seam</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.seamName} (Thick: 6.5m)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Cover Depth Range</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DEMO_MINE_INFO.depthRange}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">DGMS Classification</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{DEMO_MINE_INFO.dgmsClassification}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-sans">Extraction Method</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 font-sans">Bord &amp; Pillar with Hydraulic Sand Stowing</span>
            </div>
          </div>
        </div>

        {/* Regulatory Thresholds */}
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                DGMS Ground Movement Safety Standards
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DGMS Standard CMR 112</span>
          </div>
          <div className="p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Max Permissible Slope</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DGMS_REGULATORY_THRESHOLDS.maxAllowableSubsidenceSlope} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Critical Slope (Mandatory Evac)</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{DGMS_REGULATORY_THRESHOLDS.criticalSubsidenceSlope} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Max Tensile Horizontal Strain</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DGMS_REGULATORY_THRESHOLDS.maxAllowableHorizontalStrain} mm/m</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-sans">Surface Railway Buffer Perimeter</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{DGMS_REGULATORY_THRESHOLDS.railwayProtectedMarginMeters} meters</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-sans">Continuous InSAR Pass Frequency</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">12 days (Sentinel-1 Synthetic Baseline)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Channel Thresholds Table */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Transducer Calibration &amp; Early-Warning Threshold Matrix
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Dual-stage warning and critical trip points enforced by the edge processor and cloud risk engine
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xs">
            ISO 19011 Geotech Standard
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono">
              <tr>
                <th className="px-3.5 py-2 font-medium">Sensor Code</th>
                <th className="px-3.5 py-2 font-medium">Transducer Modality</th>
                <th className="px-3.5 py-2 font-medium">Engineering Unit</th>
                <th className="px-3.5 py-2 font-medium">Nominal Operating Envelope</th>
                <th className="px-3.5 py-2 font-medium">Warning Threshold</th>
                <th className="px-3.5 py-2 font-medium">Critical Cutoff</th>
                <th className="px-3.5 py-2 font-medium">Max Rate of Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {Object.values(SENSOR_METADATA).map((s) => (
                <tr key={s.type} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {s.type}
                  </td>
                  <td className="px-3.5 py-2 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap font-sans">
                    {s.displayName}
                  </td>
                  <td className="px-3.5 py-2 text-slate-500 whitespace-nowrap">
                    {s.unit}
                  </td>
                  <td className="px-3.5 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    [{s.nominalRange[0]}, {s.nominalRange[1]}]
                  </td>
                  <td className="px-3.5 py-2 text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                    {s.warningThreshold}
                  </td>
                  <td className="px-3.5 py-2 text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                    {s.criticalThreshold}
                  </td>
                  <td className="px-3.5 py-2 text-slate-500 whitespace-nowrap">
                    {s.rateOfChangeLimitPerMinute} {s.unit}/min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hardware Architecture Spec */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-indigo-500" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Hardware Architecture &amp; Field Telemetry Ingestion Contract
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-sans mb-3">
          To transition from Simulated/Demo telemetry to Physical Colliery Hardware, flash the ESP32 microcontrollers with firmware matching the typed JSON contract below. Telemetry is delivered via HTTP POST to <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/api/telemetry/ingest</code> or over Modbus RS-485 via Gateway.
        </p>
        <div className="bg-slate-950 p-3 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
          <pre>{`// Hardware Telemetry Payload Schema (POST /api/telemetry/ingest)
{
  "node_id": "SN-102",
  "gateway_id": "GW-BHOWRA-01",
  "timestamp": "2026-09-21T11:30:00Z",
  "battery_voltage": 3.28,
  "signal_rssi_dbm": -74,
  "channels": [
    { "sensor_code": "SN-102-TILT_X", "type": "TILT_X", "value": 1.45, "unit": "arcsec", "raw_adc": 2048, "quality": 0.98 },
    { "sensor_code": "SN-102-TILT_Y", "type": "TILT_Y", "value": -0.82, "unit": "arcsec", "raw_adc": 1980, "quality": 0.99 },
    { "sensor_code": "SN-102-DISP_Z", "type": "DISP_Z", "value": 18.24, "unit": "mm", "raw_adc": 1420, "quality": 0.95 },
    { "sensor_code": "SN-102-VIB_RMS", "type": "VIB_RMS", "value": 0.12, "unit": "mm/s", "raw_adc": 820, "quality": 0.97 },
    { "sensor_code": "SN-102-STRAIN", "type": "STRAIN", "value": 418.0, "unit": "µε", "raw_adc": 2150, "quality": 0.96 }
  ]
}`}</pre>
        </div>
      </div>
    </div>
  );
}
