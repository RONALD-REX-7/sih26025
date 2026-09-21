'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_MINE, DEMO_NODES } from '@/lib/data/mock-data';
import { GIS_LAYERS_CONFIG, GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { GisLayerId } from '@/lib/domain/gis-types';
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
  MapPin,
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

  const handleSelectNode = (nodeCode: string) => {
    setSelectedNodeCode(nodeCode);
    setSelectedEventId(null);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedNodeCode(null);
  };

  const selectedNode = useMemo(() => {
    if (!selectedNodeCode) return null;
    return DEMO_NODES.find((n) => n.node_code === selectedNodeCode) || null;
  }, [selectedNodeCode]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return GIS_SUBSIDENCE_EVENTS.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId]);

  const anomaliesForSelectedNode = useMemo(() => {
    if (!selectedNodeCode) return [];
    return activeAnomalies.filter((a) => a.nodeCode === selectedNodeCode);
  }, [selectedNodeCode, activeAnomalies]);

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
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#173B57]" />
              Spatial Geospatial Surveillance Workstation
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Underground Strata GIS &amp; Spatial Surveillance Canvas
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            {DEMO_MINE.name} &bull; Jharia Coalfield ({DEMO_MINE.latitude.toFixed(4)}&deg;N, {DEMO_MINE.longitude.toFixed(4)}&deg;E) &bull; Seam VII/VIII Working
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span className="px-2.5 py-1 rounded-sm border border-[#D7DEDC] bg-[#EDF1F0] text-[#52606D]">
            Scale: 1:5,000 WGS84
          </span>
          <span className="px-2.5 py-1 rounded-sm border border-[#2F6B4F]/30 bg-[#EAF2ED] text-[#2F6B4F] font-semibold">
            16 / 16 Stations Active
          </span>
        </div>
      </div>

      {/* Layer Control Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#52606D]">
          <Layers className="h-4 w-4 text-[#173B57]" />
          <span className="font-semibold uppercase tracking-wider text-xs">Surveillance Layers:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {GIS_LAYERS_CONFIG.map((layer) => {
            const isVisible = activeLayers[layer.id];

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                className={`text-xs h-7 px-2.5 font-mono-tech rounded-sm border cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
                  isVisible
                    ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                    : 'text-[#52606D] border-[#D7DEDC] bg-[#FFFFFF] hover:bg-[#EDF1F0]'
                }`}
              >
                {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 opacity-60" />}
                <span>{layer.name}</span>
                {layer.count ? <span className="opacity-75 text-xs">({layer.count})</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Investigation Split: Interactive Canvas (2 cols) & Investigation Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Spatial Surveillance Canvas (8 cols / ~67%) */}
        <div className="lg:col-span-8 space-y-4">
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
          <div className="border border-[#D7DEDC] bg-[#FFFFFF] rounded-sm p-3.5 text-xs text-[#52606D] space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-semibold text-[#173B57] text-xs">
              <CheckCircle2 className="h-4 w-4 text-[#2F6B4F]" />
              <span>Scientific &amp; Regulatory Integrity Standards:</span>
            </div>
            <p className="text-xs leading-relaxed">
              &bull; <strong>Cadastral Infrastructure:</strong> Jharia Coalfield leasehold bounds, Railway siding 45m statutory non-subsidence reserve, ventilation shaft.<br />
              &bull; <strong>InSAR Satellite Grid:</strong> Illustrative Sentinel-1 synthetic LOS observation layer (DEMO); does not claim live orbital telemetry.<br />
              &bull; <strong>Geomechanical Reference:</strong> Standard CMPDI empirical hyperbolic tangent subsidence limit trough formulations.
            </p>
          </div>
        </div>

        {/* Right: Operational Investigation Sidebar (4 cols / ~33%) */}
        <div className="lg:col-span-4 space-y-4">
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
            <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-6 text-center text-xs text-[#52606D] font-mono-tech space-y-2 shadow-xs">
              <RotateCcw className="h-5 w-5 mx-auto text-[#74808A]" />
              <p>Select any monitoring station node or subsidence event polygon on the map canvas to open deep telemetry metrology.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
