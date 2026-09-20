'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import {
  Sliders,
  CheckCircle2,
  Filter,
  X,
  Radio,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-600" />
              TRANSDUCER METROLOGY &bull; DGMS CMR 2017 REG 112
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sensor Transducer Registry (80 Physical Channels)
          </h1>
          <p className="text-xs text-slate-500">
            Multi-modal strata instrumentation: MEMS dual-axis inclinometers, borehole extensometers, geophones, and vibrating wire strain gauges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-mono">
            80 / 80 Calibrated Nominal
          </Badge>
        </div>
      </div>

      {notice && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Total Active Channels"
          channelCode="MET-CHN-TOT"
          value={80}
          unit="channels"
          nominalRange={[80, 80]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Inclinometer Channels"
          channelCode="MET-TILT-CHN"
          value={32}
          unit="axes"
          nominalRange={[32, 32]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Extensometer Channels"
          channelCode="MET-DISP-CHN"
          value={16}
          unit="boreholes"
          nominalRange={[16, 16]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Strain & Geophone"
          channelCode="MET-STRN-CHN"
          value={32}
          unit="elements"
          nominalRange={[32, 32]}
          riskState="Normal"
          provenance="DEMO"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search channel code, station, or transducer model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs font-mono bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-500">Panel:</span>
              {['ALL', 'P-101', 'P-102', 'P-103', 'P-104'].map((panel) => (
                <Button
                  key={panel}
                  variant={selectedPanel.toUpperCase() === panel ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPanel(panel)}
                  className={`text-[10px] h-6 px-1.5 font-mono ${
                    selectedPanel.toUpperCase() === panel
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {panel}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500">Transducer:</span>
              {['ALL', 'TILT_X', 'TILT_Y', 'DISP_Z', 'VIB_RMS', 'STRAIN'].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={`text-[10px] h-6 px-1.5 font-mono ${
                    selectedType === type
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transducer Metrology Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-indigo-600" />
              Strata Transducer Fleet Metrology ({filteredTransducers.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Hardware models, measurement engineering units, baseline calibration factors, and zero offsets
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            80 Monitored Points
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead>Channel Code</TableHead>
                <TableHead>Station / Panel</TableHead>
                <TableHead>Transducer Instrument Model</TableHead>
                <TableHead>Nominal Baseline</TableHead>
                <TableHead>Gauge Factor</TableHead>
                <TableHead>Zero Tare Offset</TableHead>
                <TableHead>Calibration Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransducers.map((t) => (
                <TableRow key={t.id} className="text-xs font-mono hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {t.sensorCode}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">{t.nodeCode}</span> &bull; {t.panelCode}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-64 truncate">
                    {t.transducerModel}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                    {t.nominalValue.toFixed(1)} {t.unit}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {t.calibrationFactor.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {t.zeroOffset.toFixed(2)} {t.unit}
                  </TableCell>
                  <TableCell className="text-slate-400 text-[11px]">
                    {t.lastCalibratedDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenCalibration(t)}
                      className="h-6 text-[10px] font-mono px-2 text-indigo-700 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer"
                    >
                      <Sliders className="h-3 w-3 mr-1" />
                      Re-Zero
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zero Calibration Modal */}
      {calibratingSensor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-md border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-900 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  Transducer Re-Zeroing &amp; Calibration
                </CardTitle>
                <CardDescription className="text-xs font-mono text-slate-500">
                  Channel: {calibratingSensor.sensorCode} ({calibratingSensor.transducerType})
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCalibratingSensor(null)} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCommitCalibration}>
              <CardContent className="p-4 space-y-3.5 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transducer:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{calibratingSensor.transducerModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nominal Baseline:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{calibratingSensor.nominalValue} {calibratingSensor.unit}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    New Zero Tare Offset ({calibratingSensor.unit}):
                  </label>
                  <Input
                    value={tareOffset}
                    onChange={(e) => setTareOffset(e.target.value)}
                    required
                    type="number"
                    step="0.01"
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    Offset will be subtracted from raw transducer ADC counts.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Certified Geotechnical Engineer:
                  </label>
                  <Input
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    required
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-900">
                  <Button type="button" variant="outline" size="sm" onClick={() => setCalibratingSensor(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                    Commit Calibration Audit
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
