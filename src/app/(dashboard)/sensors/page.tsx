'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import {
  Sliders,
  CheckCircle2,
  Filter,
  X,
  Search,
} from 'lucide-react';

interface TransducerRecord {
  id: string;
  sensorCode: string;
  nodeCode: string;
  panelCode: string;
  transducerType: 'TILT_X' | 'TILT_Y' | 'DISP_Z' | 'VIB_RMS' | 'STRAIN';
  transducerModel: string;
  unit: string;
  nominalValue: number;
  currentReading: number;
  calibrationFactor: number;
  zeroOffset: number;
  lastCalibratedDate: string;
  healthScore: number;
  status: 'nominal' | 'calibrated' | 'drift_detected';
}

const TRANSDUCER_CONFIGS: Array<{
  type: TransducerRecord['transducerType'];
  model: string;
  unit: string;
  nominal: number;
}> = [
  { type: 'TILT_X', model: 'SCA103T Dual-Axis MEMS Inclinometer', unit: 'arcsec', nominal: 12.4 },
  { type: 'TILT_Y', model: 'SCA103T Dual-Axis MEMS Inclinometer', unit: 'arcsec', nominal: -8.2 },
  { type: 'DISP_Z', model: 'LVDT Borehole Rod Extensometer', unit: 'mm', nominal: 18.5 },
  { type: 'VIB_RMS', model: 'GS-14-L3 14Hz Velocity Geophone', unit: 'mm/s', nominal: 1.2 },
  { type: 'STRAIN', model: 'Vibrating Wire Embedment Gauge 4000', unit: 'microstrain', nominal: 420.0 },
];

export default function SensorsPage() {
  const { recordAudit, initAlertEngine } = useAlertStore();
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPanel, setSelectedPanel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [calibratingSensor, setCalibratingSensor] = useState<TransducerRecord | null>(null);
  const [tareOffset, setTareOffset] = useState('0.00');
  const [signatoryName, setSignatoryName] = useState('Dr. A. K. Sengupta');
  const [notice, setNotice] = useState<string | null>(null);

  // Generate 80 physical transducers across 16 nodes (5 per node)
  const [transducers, setTransducers] = useState<TransducerRecord[]>(() => {
    const list: TransducerRecord[] = [];
    for (const node of DEMO_NODES) {
      for (const config of TRANSDUCER_CONFIGS) {
        list.push({
          id: `${node.node_code}-${config.type}`,
          sensorCode: `${node.node_code}-${config.type}`,
          nodeCode: node.node_code,
          panelCode: node.panel?.code || 'P-101',
          transducerType: config.type,
          transducerModel: config.model,
          unit: config.unit,
          nominalValue: config.nominal,
          currentReading: config.nominal,
          calibrationFactor: 1.0,
          zeroOffset: 0.0,
          lastCalibratedDate: '2026-09-15',
          healthScore: 99.2,
          status: 'nominal',
        });
      }
    }
    return list;
  });

  React.useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const handleOpenCalibration = (transducer: TransducerRecord) => {
    setCalibratingSensor(transducer);
    setTareOffset('0.00');
  };

  const handleCommitCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calibratingSensor) return;

    const parsedOffset = parseFloat(tareOffset) || 0;

    setTransducers((prev) =>
      prev.map((t) => {
        if (t.id === calibratingSensor.id) {
          return {
            ...t,
            zeroOffset: parsedOffset,
            status: 'calibrated',
            lastCalibratedDate: new Date().toISOString().slice(0, 10),
          };
        }
        return t;
      })
    );

    // Record immutable audit entry
    recordAudit({
      action: 'SENSOR_ZERO_CALIBRATION',
      entity_type: 'sensor_transducer',
      entity_id: calibratingSensor.sensorCode,
      user_role: 'Engineer',
      payload_before: {
        zero_offset: calibratingSensor.zeroOffset,
        calibration_factor: calibratingSensor.calibrationFactor,
      },
      payload_after: {
        zero_offset: parsedOffset,
        calibrated_by: signatoryName,
        standard: 'DGMS Geotechnical Compliance Circular 04/2017',
      },
    });

    setNotice(`Transducer ${calibratingSensor.sensorCode} zero calibrated. Audit entry recorded.`);
    setTimeout(() => setNotice(null), 4000);
    setCalibratingSensor(null);
  };

  const filteredTransducers = useMemo(() => {
    return transducers.filter((t) => {
      const matchesType = selectedType === 'ALL' || t.transducerType === selectedType;
      const matchesPanel = selectedPanel === 'ALL' || t.panelCode.toLowerCase() === selectedPanel.toLowerCase();
      const matchesSearch =
        t.sensorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nodeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.transducerModel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesPanel && matchesSearch;
    });
  }, [transducers, selectedType, selectedPanel, searchQuery]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-sky-600" />
              Transducer Analytics &bull; DGMS CMR 2017 Reg. 112
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sensor Transducer Analytics &amp; Metrology Registry
          </h1>
          <p className="text-xs text-slate-500">
            Multi-modal strata instrumentation: MEMS dual-axis inclinometers, borehole extensometers, geophones, and vibrating wire strain gauges.
          </p>
        </div>

        <span className="px-2 py-0.5 rounded-xs border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-xs">
          80 / 80 Channels Nominal
        </span>
      </div>

      {notice && (
        <div className="p-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Summary Metrology Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Total Channels</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            80 <span className="text-[10px] font-normal text-slate-500">transducers</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Inclinometer Axes</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            32 <span className="text-[10px] font-normal text-slate-500">Tilt X/Y</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Borehole Anchors</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            16 <span className="text-[10px] font-normal text-slate-500">Extensometers</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Strain &amp; Vibration</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            32 <span className="text-[10px] font-normal text-slate-500">Geophones &amp; Gauges</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search channel, station, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500">Panel:</span>
            {['ALL', 'P-101', 'P-102', 'P-103', 'P-104'].map((panel) => (
              <button
                key={panel}
                type="button"
                onClick={() => setSelectedPanel(panel)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs border cursor-pointer ${
                  selectedPanel.toUpperCase() === panel
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500">Type:</span>
            {['ALL', 'TILT_X', 'DISP_Z', 'VIB_RMS', 'STRAIN'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs border cursor-pointer ${
                  selectedType === type
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transducer Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left">Channel Code</th>
                <th className="py-2.5 px-3 text-left">Station</th>
                <th className="py-2.5 px-3 text-left">Transducer Hardware</th>
                <th className="py-2.5 px-3 text-right">Nominal Value</th>
                <th className="py-2.5 px-3 text-right">Tare Offset</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
              {filteredTransducers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {t.sensorCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {t.nodeCode} ({t.panelCode})
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                    {t.transducerModel}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                    {t.nominalValue} {t.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                    {t.zeroOffset.toFixed(2)} {t.unit}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-1.5 py-0.2 rounded-xs text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase font-bold">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenCalibration(t)}
                      className="px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Tare Re-Zero
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tare Calibration Dialog */}
      {calibratingSensor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4 w-full max-w-md space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                TARE ZERO CALIBRATION: {calibratingSensor.sensorCode}
              </span>
              <button onClick={() => setCalibratingSensor(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCommitCalibration} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Tare Offset ({calibratingSensor.unit})</label>
                <Input
                  value={tareOffset}
                  onChange={(e) => setTareOffset(e.target.value)}
                  className="h-8 text-xs font-mono mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Certified Geotechnical Signatory</label>
                <Input
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setCalibratingSensor(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
                  Commit Tare Calibration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
