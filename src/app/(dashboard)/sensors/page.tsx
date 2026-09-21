'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/industrial/status-dot';
import {
  CheckCircle2,
  Filter,
  X,
  Search,
  Cpu,
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
  { type: 'STRAIN', model: 'Vibrating Wire Embedment Gauge 4000', unit: 'µε', nominal: 420.0 },
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

  // 80 physical transducers across 16 nodes
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
            lastCalibratedDate: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    recordAudit({
      action: 'SENSOR_CALIBRATION_UPDATE',
      entity_type: 'sensor_transducer',
      entity_id: calibratingSensor.sensorCode,
      user_role: 'Engineer',
      payload_before: { zeroOffset: calibratingSensor.zeroOffset, status: calibratingSensor.status },
      payload_after: {
        zeroOffset: parsedOffset,
        status: 'calibrated',
        signatory: signatoryName,
        notes: `Manual zero-offset tare applied by certified signatory ${signatoryName} per DGMS TC 4/2017.`
      },
    });

    setNotice(`Transducer ${calibratingSensor.sensorCode} tare offset updated to ${parsedOffset} ${calibratingSensor.unit}.`);
    setCalibratingSensor(null);
    setTimeout(() => setNotice(null), 5000);
  };

  const filteredTransducers = useMemo(() => {
    return transducers.filter((t) => {
      const matchQuery =
        searchQuery === '' ||
        t.sensorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nodeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.transducerModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPanel = selectedPanel === 'ALL' || t.panelCode.toUpperCase() === selectedPanel.toUpperCase();
      const matchType = selectedType === 'ALL' || t.transducerType === selectedType;

      return matchQuery && matchPanel && matchType;
    });
  }, [transducers, searchQuery, selectedPanel, selectedType]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-[#173B57]" />
              Transducer Surveillance &bull; DGMS TC 4/2017
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Transducer Metrology & Calibration Matrix
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Surveillance of 80 geotechnical transducers across 16 telemetry stations in Bhowra-West Colliery.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 text-xs bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#2F6B4F] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Summary Metrology Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Total Channels</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            80 <span className="text-xs font-normal text-[#52606D]">channels</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Inclinometer Axes</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            32 <span className="text-xs font-normal text-[#52606D]">Tilt X/Y</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Borehole Anchors</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            16 <span className="text-xs font-normal text-[#52606D]">Extensometers</span>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-[#74808A] uppercase tracking-wider">Strain &amp; Vibration</div>
          <div className="text-lg font-bold text-[#1D2933] mt-0.5">
            32 <span className="text-xs font-normal text-[#52606D]">Gauges/Geophones</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#74808A]" />
          <Input
            placeholder="Search channel code, station, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs font-mono-tech bg-[#F8FAF9] border-[#D7DEDC] text-[#1D2933]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#74808A] shrink-0" />
            <span className="text-xs font-mono-tech text-[#52606D]">Panel:</span>
            {['ALL', 'P-101', 'P-102', 'P-103', 'P-104'].map((panel) => (
              <button
                key={panel}
                type="button"
                onClick={() => setSelectedPanel(panel)}
                className={`px-2 py-0.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
                  selectedPanel.toUpperCase() === panel
                    ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                    : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono-tech text-[#52606D]">Type:</span>
            {['ALL', 'TILT_X', 'DISP_Z', 'VIB_RMS', 'STRAIN'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-2 py-0.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
                  selectedType === type
                    ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                    : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transducer High-Density Matrix Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-industrial">
            <thead>
              <tr>
                <th>Channel Code</th>
                <th>Station</th>
                <th>Transducer Hardware</th>
                <th className="text-right">Nominal Value</th>
                <th className="text-right">Tare Offset</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransducers.map((t) => (
                <tr key={t.id} className="transition-colors">
                  <td className="font-mono-tech font-bold text-[#173B57]">
                    {t.sensorCode}
                  </td>
                  <td className="font-mono-tech text-[#52606D]">
                    {t.nodeCode} ({t.panelCode})
                  </td>
                  <td className="text-xs text-[#1D2933]">
                    {t.transducerModel}
                  </td>
                  <td className="font-mono-tech text-right font-bold text-[#1D2933]">
                    {t.nominalValue} {t.unit}
                  </td>
                  <td className="font-mono-tech text-right text-[#52606D]">
                    {t.zeroOffset.toFixed(2)} {t.unit}
                  </td>
                  <td>
                    <StatusDot
                      status={t.status === 'nominal' ? 'nominal' : 'active'}
                      label={t.status.toUpperCase()}
                    />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenCalibration(t)}
                      className="px-2 py-1 rounded-sm border border-[#D7DEDC] text-xs font-mono-tech text-[#173B57] hover:bg-[#EDF1F0] cursor-pointer"
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 w-full max-w-md space-y-3 font-mono-tech text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-[#D7DEDC] pb-2">
              <span className="font-bold text-sm text-[#1D2933]">
                TARE ZERO CALIBRATION: {calibratingSensor.sensorCode}
              </span>
              <button onClick={() => setCalibratingSensor(null)} className="text-[#74808A] hover:text-[#1D2933] cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCommitCalibration} className="space-y-3 font-sans">
              <div>
                <label className="text-xs font-semibold text-[#52606D] uppercase font-mono-tech">Tare Offset ({calibratingSensor.unit})</label>
                <Input
                  value={tareOffset}
                  onChange={(e) => setTareOffset(e.target.value)}
                  className="h-8 text-xs font-mono-tech mt-1 border-[#D7DEDC]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#52606D] uppercase font-mono-tech">Certified Geotechnical Signatory</label>
                <Input
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="h-8 text-xs font-mono-tech mt-1 border-[#D7DEDC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D7DEDC]">
                <Button type="button" variant="outline" size="sm" onClick={() => setCalibratingSensor(null)} className="text-xs border-[#D7DEDC]">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] text-xs">
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
