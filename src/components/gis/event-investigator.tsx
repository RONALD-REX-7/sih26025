'use client';

import React from 'react';
import { SubsidenceEventRecord } from '@/lib/domain/gis-types';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  Radio,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface EventInvestigatorProps {
  event: SubsidenceEventRecord;
  onSelectNode: (nodeCode: string) => void;
  className?: string;
}

export function EventInvestigator({
  event,
  onSelectNode,
  className,
}: EventInvestigatorProps) {
  return (
    <Card className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col ${className || ''}`}>
      {/* Event Header */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold font-mono flex items-center gap-2">
                {event.id}
                <RiskBadge state={event.riskState} size="sm" showIcon={false} />
              </CardTitle>
              <CardDescription className="text-[11px] font-mono">
                Panel {event.panelCode} &bull; Detected: {new Date(event.detectedAt).toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono uppercase">
            {event.type.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-2 font-mono">
          {event.title}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 text-xs space-y-4">
        {/* Affected Nodes Matrix */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            Affected Sensor Stations ({event.affectedNodeCodes.length})
          </div>
          <div className="grid grid-cols-3 gap-2">
            {event.affectedNodeCodes.map((nodeCode) => {
              const isEpicenter = nodeCode === event.epicenterNodeCode;
              return (
                <button
                  key={nodeCode}
                  onClick={() => onSelectNode(nodeCode)}
                  className={`p-2 rounded border text-left font-mono cursor-pointer transition-colors ${
                    isEpicenter
                      ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20 text-orange-950 dark:text-orange-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="font-bold text-xs">{nodeCode}</div>
                  <div className="text-[9px] text-slate-400">
                    {isEpicenter ? 'Epicenter' : 'Flanking Node'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Modal Telemetry Envelope */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 flex items-center gap-1">
            <Radio className="h-3.5 w-3.5 text-indigo-500" />
            Cross-Modal Peak Indicators
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Peak Displacement</span>
              <strong className="text-slate-900 dark:text-slate-100">{event.maxDisplacementMm.toFixed(1)} mm</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Peak Tilt Rotation</span>
              <strong className="text-slate-900 dark:text-slate-100">{event.maxTiltArcsec.toFixed(1)} arcsec</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Vibration PPV</span>
              <strong className="text-slate-900 dark:text-slate-100">{event.maxVibrationMmPerS.toFixed(1)} mm/s</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Rockbolt Strain</span>
              <strong className="text-slate-900 dark:text-slate-100">{event.maxStrainMicrostrain.toFixed(0)} με</strong>
            </div>
          </div>
        </div>

        {/* Chronological Progression Timeline */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Risk Escalation Chronology
          </div>
          <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-2 pl-3 space-y-2.5 font-mono text-[11px]">
            {event.timelineSteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-4.75 top-1 h-2 w-2 rounded-full bg-slate-400" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{step.timeLabel}</span>
                  <RiskBadge state={step.riskState} size="sm" showIcon={false} />
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[10px] mt-0.5">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DGMS CMR 2017 Regulatory Mandate */}
        <div className="p-3 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-[11px] font-mono text-amber-950 dark:text-amber-200 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-amber-600" />
            Statutory DGMS Compliance Mandate
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
            CMR 2017 Reg 112: Shift In-Charge and Safety Officer notification logged. Surface railway buffer restriction active (45m safety perimeter).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
