'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_MINE, DEMO_NODES } from '@/lib/data/mock-data';
import { GIS_LAYERS_CONFIG, GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { GisLayerId } from '@/lib/domain/gis-types';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { GisMapCanvas } from '@/components/gis/gis-map-canvas';
import { NodeInvestigator } from '@/components/gis/node-investigator';
import { EventInvestigator } from '@/components/gis/event-investigator';
import { GeomechanicalProfileView } from '@/components/gis/geomechanical-profile-view';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { RiskState } from '@/lib/domain/risk-states';
import {
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function GisPage() {
  const { latestReadings, activeAnomalies } = useSimulatorStore();

  // Layer visibility state
  const [activeLayers, setActiveLayers] = useState<Record<GisLayerId, boolean>>({
    panels: true,
    nodes: true,
    infrastructure: true,
    goaf: true,
    insar: false,
    geomechanical: false,
    events: true,
  });

  // Selected entities for deep investigation
  const [selectedNodeCode, setSelectedNodeCode] = useState<string | null>('SN-102');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Toggle layer visibility
  const toggleLayer = (layerId: GisLayerId) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  // Node selection handler
  const handleSelectNode = (nodeCode: string) => {
    setSelectedNodeCode(nodeCode);
    setSelectedEventId(null);
  };

  // Event selection handler
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedNodeCode(null);
  };

  // Resolve currently selected node object
  const selectedNode = useMemo(() => {
    if (!selectedNodeCode) return null;
    return DEMO_NODES.find((n) => n.node_code === selectedNodeCode) || null;
  }, [selectedNodeCode]);

  // Resolve currently selected event object
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return GIS_SUBSIDENCE_EVENTS.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId]);

  // Map active anomalies by node code
  const anomaliesForSelectedNode = useMemo(() => {
    if (!selectedNodeCode) return [];
    return activeAnomalies.filter((a) => a.nodeCode === selectedNodeCode);
  }, [selectedNodeCode, activeAnomalies]);

  // Events involving selected node
  const eventsForSelectedNode = useMemo(() => {
    if (!selectedNodeCode) return [];
    return GIS_SUBSIDENCE_EVENTS.filter((e) => e.affectedNodeCodes.includes(selectedNodeCode));
  }, [selectedNodeCode]);

  // Derive per-node live risk states from simulator store
  const liveRiskByNode = useMemo(() => {
    const map: Record<string, RiskState> = {};
    for (const node of DEMO_NODES) {
      const nodeDisp = latestReadings[`${node.node_code}-DISP_Z`]?.value ?? 18.5;
      let r: RiskState = 'Normal';
      if (nodeDisp > 48.0) r = 'Critical';
      else if (nodeDisp > 32.0) r = 'Warning';
      else if (nodeDisp > 24.0) r = 'Watch';
      else if (nodeDisp > 20.0) r = 'Advisory';
      map[node.node_code] = r;
    }
    return map;
  }, [latestReadings]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Spatial Geospatial Surveillance Workstation
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Underground Strata GIS &amp; Spatial Surveillance Canvas
          </h1>
          <p className="text-xs text-slate-500">
            {DEMO_MINE.name} &bull; Jharia Coalfield ({DEMO_MINE.latitude.toFixed(4)}&deg;N, {DEMO_MINE.longitude.toFixed(4)}&deg;E) &bull; Seam VII/VIII Working
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            Scale: 1:5,000 WGS84
          </span>
          <span className="px-2 py-0.5 rounded-xs border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            16 / 16 Stations Active
          </span>
        </div>
      </div>

      {/* Layer Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
          <Layers className="h-4 w-4 text-slate-500" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Surveillance Overlays:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {GIS_LAYERS_CONFIG.map((layer) => {
            const isVisible = activeLayers[layer.id];

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className={`text-[11px] h-7 px-2 font-mono rounded-xs border cursor-pointer transition-colors inline-flex items-center gap-1 ${
                  isVisible
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold border-transparent'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-60" />}
                <span>{layer.name}</span> {layer.count ? <span className="opacity-70 text-[9px]">({layer.count})</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Investigation Split: Interactive Canvas (2 cols) & Investigation Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Spatial Surveillance Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <GisMapCanvas
            activeLayers={activeLayers}
            selectedNodeCode={selectedNodeCode}
            selectedEventId={selectedEventId}
            onSelectNode={handleSelectNode}
            onSelectEvent={handleSelectEvent}
            liveRiskByNode={liveRiskByNode}
          />

          {/* Contextual Geomechanical Reference Profile */}
          {activeLayers.geomechanical && (
            <GeomechanicalProfileView
              measuredDispMm={latestReadings['SN-102-DISP_Z']?.value ?? 18.5}
            />
          )}

          {/* Scientific Integrity Standards Notice */}
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-sm p-3 text-xs text-slate-500 font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Scientific &amp; Regulatory Integrity Standards:</span>
            </div>
            <p className="text-[10px] leading-relaxed">
              &bull; <strong>Cadastral Infrastructure:</strong> Jharia Coalfield leasehold bounds, Railway siding 45m statutory non-subsidence corridor, ventilation shaft.<br />
              &bull; <strong>InSAR Satellite Grid:</strong> Illustrative Sentinel-1 synthetic LOS observation layer (DEMO); does not claim live orbital telemetry.<br />
              &bull; <strong>Geomechanical Reference:</strong> Standard CMPDI empirical hyperbolic tangent subsidence limit trough formulations.
            </p>
          </div>
        </div>

        {/* Operational Investigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {selectedEvent ? (
            <EventInvestigator
              event={selectedEvent}
              onClose={() => setSelectedEventId(null)}
              onSelectNode={(code: string) => handleSelectNode(code)}
            />
          ) : selectedNode ? (
            <NodeInvestigator
              node={selectedNode}
              onClose={() => setSelectedNodeCode(null)}
              latestReadings={latestReadings}
              activeAnomalies={anomaliesForSelectedNode}
              associatedEvents={eventsForSelectedNode}
              riskState={liveRiskByNode[selectedNode.node_code] ?? 'Normal'}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-6 text-center text-xs text-slate-500 font-mono space-y-2">
              <RotateCcw className="h-5 w-5 mx-auto text-slate-400" />
              <p>Select any monitoring station node or subsidence event polygon on the map canvas to open deep telemetry metrology.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
