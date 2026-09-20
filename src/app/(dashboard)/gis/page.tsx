'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_MINE, DEMO_NODES } from '@/lib/data/mock-data';
import { GIS_LAYERS_CONFIG, GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { GisLayerId } from '@/lib/domain/gis-types';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { StateContainer } from '@/components/industrial/state-container';
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
  Compass,
  Activity,
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
    setSelectedEventId(null); // Switch focus to node investigator
  };

  // Event selection handler
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedNodeCode(null); // Switch focus to event investigator
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
      const nodeTilt = latestReadings[`${node.node_code}-TILT_X`]?.value ?? 12.4;
      const nodeVib = latestReadings[`${node.node_code}-VIB_RMS`]?.value ?? 1.2;

      let r: RiskState = 'Normal';
      if (nodeDisp > 48.0) r = 'Critical';
      else if (nodeDisp > 32.0) r = 'Warning';
      else if (nodeDisp > 22.0) r = 'Watch';
      else if (nodeVib > 4.0 || Math.abs(nodeTilt - 12.4) > 10.0) r = 'Advisory';

      map[node.node_code] = r;
    }
    return map;
  }, [latestReadings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Geospatial Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              GEOSPATIAL INTELLIGENCE &bull; WGS84 EPSG:4326 GRID
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Underground Strata GIS &amp; Spatial Surveillance Canvas
          </h1>
          <p className="text-xs text-slate-500">
            {DEMO_MINE.name} &bull; Jharia Coalfield ({DEMO_MINE.latitude.toFixed(4)}&deg;N, {DEMO_MINE.longitude.toFixed(4)}&deg;E) &bull; Seam VII/VIII Working
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-xs bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-300"
          >
            Scale: 1:5,000 Cadastral
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-xs bg-emerald-50 text-emerald-700 border-emerald-300"
          >
            16 / 16 Nodes Active
          </Badge>
        </div>
      </div>

      {/* Layer Control Bar & Operational Toggles */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="font-semibold">Surveillance Overlays:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GIS_LAYERS_CONFIG.map((layer) => {
              const isVisible = activeLayers[layer.id];

              return (
                <Button
                  key={layer.id}
                  size="sm"
                  variant={isVisible ? 'default' : 'outline'}
                  onClick={() => toggleLayer(layer.id)}
                  className={`text-[11px] h-7.5 px-2.5 font-mono cursor-pointer transition-all ${
                    isVisible
                      ? layer.id === 'insar'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : layer.id === 'geomechanical'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : layer.id === 'events'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : ''
                      : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isVisible ? <Eye className="h-3 w-3 mr-1.5" /> : <EyeOff className="h-3 w-3 mr-1.5" />}
                  {layer.name} {layer.count ? `(${layer.count})` : ''}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Investigation Split: Interactive Canvas (2 cols) & Investigation Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

          {/* Contextual Geomechanical Reference Profile (Collapsible/Conditional) */}
          {activeLayers.geomechanical && (
            <GeomechanicalProfileView
              measuredDispMm={latestReadings['SN-102-DISP_Z']?.value ?? 18.5}
            />
          )}

          {/* Geological & Provenance Distinction Notice */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 text-xs text-slate-500 font-mono space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Safety &amp; Scientific Integrity Standards:</span>
            </div>
            <p className="text-[10.5px] leading-relaxed">
              &bull; <strong>Real Public Context:</strong> Jharia Coalfield leasehold bounds, Indian Railways surface track (45m CMR 2017 buffer), and ventilation shaft.<br />
              &bull; <strong>Prototype Overlays:</strong> Panels P-101 to P-104 and 16 ESP32 monitoring stations are clearly marked prototype deployments.<br />
              &bull; <strong>InSAR Satellite Grid:</strong> Illustrative Sentinel-1 synthetic LOS observation layer (Demo provenance); does not claim live orbital telemetry.<br />
              &bull; <strong>Geomechanical Reference:</strong> Derived from standard CMPDI Indian coalfield empirical subsidence formulations.
            </p>
          </Card>
        </div>

        {/* Operational Investigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Active Mode Switcher Bar */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {selectedEvent ? 'EVENT INVESTIGATION' : selectedNode ? 'NODE INVESTIGATION' : 'INSPECTOR'}
            </span>
            {(selectedNodeCode || selectedEventId) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedNodeCode(null);
                  setSelectedEventId(null);
                }}
                className="h-6 px-2 text-[10px] text-slate-500 hover:text-slate-900 font-mono"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Render Node Investigator */}
          {selectedNode && (
            <NodeInvestigator
              node={selectedNode}
              riskState={liveRiskByNode[selectedNode.node_code] || 'Normal'}
              activeAnomalies={anomaliesForSelectedNode}
              latestReadings={latestReadings}
              associatedEvents={eventsForSelectedNode}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {/* Render Event Investigator */}
          {selectedEvent && (
            <EventInvestigator
              event={selectedEvent}
              onSelectNode={handleSelectNode}
            />
          )}

          {/* Empty State when nothing selected */}
          {!selectedNode && !selectedEvent && (
            <StateContainer
              type="empty"
              title="No Station or Event Selected"
              description="Click any sensor node (SN-101 to SN-116) or subsidence event marker on the georeferenced canvas to initiate a deep geotechnical investigation."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelectNode('SN-102')}
                  className="text-xs font-mono"
                >
                  Select Epicenter Node SN-102
                </Button>
              }
            />
          )}

          {/* Quick Active Events Directory Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-mono font-semibold flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-orange-500" />
                Registered Subsidence Events ({GIS_SUBSIDENCE_EVENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 text-xs">
              {GIS_SUBSIDENCE_EVENTS.map((evt) => {
                const isSelected = selectedEventId === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className={`p-2 rounded border transition-colors cursor-pointer text-[11px] font-mono ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {evt.id}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {evt.riskState}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {evt.title}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
