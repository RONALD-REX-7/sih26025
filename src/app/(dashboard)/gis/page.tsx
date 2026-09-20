'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_MINE, DEMO_PANELS, DEMO_NODES } from '@/lib/data/mock-data';
import { SensorNode, Panel } from '@/lib/domain/types';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { StateContainer } from '@/components/industrial/state-container';
import {
  Layers,
  Eye,
  EyeOff,
  Cpu,
  Compass,
} from 'lucide-react';

export default function GisPage() {
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(DEMO_NODES[1]); // Default SN-102
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(DEMO_PANELS[0]); // Default P-101
  const [showPanels, setShowPanels] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showInSar, setShowInSar] = useState(false);
  const [showGoaf, setShowGoaf] = useState(true);

  // Normalization bounding box for Bhowra-West Colliery
  // Lat: 23.6820 to 23.6890, Lon: 86.3950 to 86.4020
  const minLat = 23.6820;
  const maxLat = 23.6890;
  const minLon = 86.3950;
  const maxLon = 86.4020;

  const latToY = (lat: number) => {
    const norm = (lat - minLat) / (maxLat - minLat);
    return (1 - norm) * 440 + 30; // SVG canvas height 500, padding 30
  };

  const lonToX = (lon: number) => {
    const norm = (lon - minLon) / (maxLon - minLon);
    return norm * 640 + 30; // SVG canvas width 700, padding 30
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Spatial Intelligence &bull; Georeferenced Grid
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Underground Strata GIS & Spatial Surveillance
          </h1>
          <p className="text-xs text-slate-500">
            Bhowra-West Colliery (Jharia Coalfield) &bull; Coordinates: {DEMO_MINE.latitude}&deg;N, {DEMO_MINE.longitude}&deg;E &bull; Seam VII/VIII
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-300">
            WGS84 / EPSG:4326 Datum
          </Badge>
        </div>
      </div>

      {/* Layer Control Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="font-semibold">Surveillance Layers:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={showPanels ? 'default' : 'outline'}
              onClick={() => setShowPanels(!showPanels)}
              className="text-[11px] h-7 px-2 font-mono"
            >
              {showPanels ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Underground Panels (4)
            </Button>

            <Button
              size="sm"
              variant={showNodes ? 'default' : 'outline'}
              onClick={() => setShowNodes(!showNodes)}
              className="text-[11px] h-7 px-2 font-mono"
            >
              {showNodes ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Sensor Fleet (16 Nodes)
            </Button>

            <Button
              size="sm"
              variant={showInfrastructure ? 'default' : 'outline'}
              onClick={() => setShowInfrastructure(!showInfrastructure)}
              className="text-[11px] h-7 px-2 font-mono"
            >
              {showInfrastructure ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Surface Assets (Rail &amp; Shafts)
            </Button>

            <Button
              size="sm"
              variant={showGoaf ? 'default' : 'outline'}
              onClick={() => setShowGoaf(!showGoaf)}
              className="text-[11px] h-7 px-2 font-mono"
            >
              {showGoaf ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Goaf Hazard Contours
            </Button>

            <Button
              size="sm"
              variant={showInSar ? 'default' : 'outline'}
              onClick={() => setShowInSar(!showInSar)}
              className={`text-[11px] h-7 px-2 font-mono ${
                showInSar ? 'bg-indigo-600 text-white' : ''
              }`}
            >
              {showInSar ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              InSAR Contours (Demo Synthetic)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: SVG Georeferenced Map & Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Georeferenced Map Canvas (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-100 shadow-md">
            <CardHeader className="p-3 border-b border-slate-800/80 bg-slate-900/90 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-xs font-mono font-semibold tracking-wide text-slate-200">
                  BHOWRA-WEST COLLIERY SPATIAL GRID &bull; 1:5,000 SCALE
                </CardTitle>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Lat: {minLat}&deg; &ndash; {maxLat}&deg;N</span>
                <span>Lon: {minLon}&deg; &ndash; {maxLon}&deg;E</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex items-center justify-center bg-slate-950 relative select-none">
              {/* Map Canvas SVG */}
              <svg
                viewBox="0 0 700 500"
                className="w-full h-auto max-h-[520px] rounded border border-slate-800 bg-[#080c14]"
              >
                {/* Geodetic Grid Lines */}
                <defs>
                  <pattern id="grid" width="70" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 70 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                  </pattern>
                </defs>
                <rect width="700" height="500" fill="url(#grid)" />

                {/* Outer Mine Boundary */}
                <polygon
                  points="50,40 650,40 660,460 40,460"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <text x="60" y="60" fill="#64748b" fontSize="10" fontFamily="monospace">
                  COLLIERY LEASEHOLD BOUNDARY (CMR 2017)
                </text>

                {/* Synthetic InSAR Deformation Layer */}
                {showInSar && (
                  <g opacity="0.45">
                    <ellipse cx="280" cy="210" rx="140" ry="100" fill="#6366f1" />
                    <ellipse cx="280" cy="210" rx="90" ry="65" fill="#4f46e5" />
                    <ellipse cx="280" cy="210" rx="45" ry="35" fill="#4338ca" />
                    <text x="220" y="195" fill="#c7d2fe" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      InSAR SYNTHETIC DISP: -28mm
                    </text>
                  </g>
                )}

                {/* Goaf Subsidence Hazard Zones */}
                {showGoaf && (
                  <g>
                    <ellipse cx="260" cy="200" rx="110" ry="75" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="210" y="145" fill="#f87171" fontSize="9" fontFamily="monospace">
                      ACTIVE GOAF DEPILLARING ZONE
                    </text>
                  </g>
                )}

                {/* Surface Infrastructure Layers */}
                {showInfrastructure && (
                  <g>
                    {/* Railway Siding Overlay */}
                    <path
                      d="M 50,110 Q 350,135 650,105"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                    />
                    <path
                      d="M 50,110 Q 350,135 650,105"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1"
                    />
                    <text x="70" y="100" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      INDIAN RAILWAYS SURFACE SIDING (45m DGMS BUFFER)
                    </text>

                    {/* Upcast Ventilation Shaft #2 */}
                    <circle cx="560" cy="380" r="14" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="560" cy="380" r="4" fill="#38bdf8" />
                    <text x="500" y="410" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                      VENTILATION SHAFT #2
                    </text>
                  </g>
                )}

                {/* Underground Panels Polygons */}
                {showPanels && (
                  <g>
                    {DEMO_PANELS.map((p, idx) => {
                      // Layout panels across SVG coordinates
                      const coords = [
                        { x: 120, y: 160, w: 220, h: 100 }, // P-101
                        { x: 380, y: 160, w: 230, h: 100 }, // P-102
                        { x: 120, y: 290, w: 220, h: 110 }, // P-103
                        { x: 380, y: 290, w: 230, h: 110 }, // P-104
                      ][idx] || { x: 100, y: 100, w: 100, h: 100 };

                      const isSelected = selectedPanel?.id === p.id;

                      return (
                        <g
                          key={p.id}
                          onClick={() => setSelectedPanel(p)}
                          className="cursor-pointer group"
                        >
                          <rect
                            x={coords.x}
                            y={coords.y}
                            width={coords.w}
                            height={coords.h}
                            fill={isSelected ? '#1e293b' : '#0f172a'}
                            fillOpacity="0.85"
                            stroke={isSelected ? '#10b981' : '#475569'}
                            strokeWidth={isSelected ? 2 : 1}
                            rx="3"
                          />
                          <text
                            x={coords.x + 8}
                            y={coords.y + 18}
                            fill={isSelected ? '#34d399' : '#cbd5e1'}
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {p.code} &bull; Depth: {p.depth_m}m
                          </text>
                          <text
                            x={coords.x + 8}
                            y={coords.y + 32}
                            fill="#94a3b8"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {p.extraction_method.slice(0, 30)}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Sensor Fleet Nodes (16 Nodes) */}
                {showNodes && (
                  <g>
                    {DEMO_NODES.map((node) => {
                      const cx = lonToX(node.longitude);
                      const cy = latToY(node.latitude);
                      const isSelected = selectedNode?.id === node.id;

                      return (
                        <g
                          key={node.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                          }}
                          className="cursor-pointer"
                        >
                          {/* Pulsing halo on selected */}
                          {isSelected && (
                            <circle cx={cx} cy={cy} r="14" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="1" className="animate-pulse" />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 6 : 4.5}
                            fill={isSelected ? '#10b981' : '#38bdf8'}
                            stroke="#ffffff"
                            strokeWidth={isSelected ? 1.5 : 1}
                          />
                          <text
                            x={cx + 7}
                            y={cy + 3}
                            fill={isSelected ? '#34d399' : '#94a3b8'}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                          >
                            {node.node_code}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Spatial Inspector & Node Detail (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Selected Node Card */}
          {selectedNode ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm font-semibold font-mono">
                      {selectedNode.node_code}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border-emerald-300">
                    ONLINE &bull; {selectedNode.battery_level}%
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  ESP32 Edge Node &bull; Panel {selectedNode.panel?.code ?? 'P-101'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latitude</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedNode.latitude.toFixed(4)}&deg;N</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Longitude</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedNode.longitude.toFixed(4)}&deg;E</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Elevation</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedNode.elevation_m}m MSL</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Firmware</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedNode.firmware_version}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Modality Telemetry Snapshot
                  </h4>
                  <div className="flex justify-between p-2 rounded bg-slate-100/60 dark:bg-slate-800/60 text-[11px] font-mono">
                    <span className="text-slate-500">Biaxial Tilt Slope</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">0.82 mm/m</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-100/60 dark:bg-slate-800/60 text-[11px] font-mono">
                    <span className="text-slate-500">Borehole Disp</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">12.4 mm</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-100/60 dark:bg-slate-800/60 text-[11px] font-mono">
                    <span className="text-slate-500">Vibration PPV</span>
                    <span className="font-semibold text-emerald-600">1.8 mm/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <StateContainer
              type="empty"
              title="No Node Selected"
              description="Click any sensor node on the map canvas to view real-time telemetry."
            />
          )}

          {/* Selected Panel Card */}
          {selectedPanel && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold font-mono">
                    {selectedPanel.code} Profile
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {selectedPanel.extraction_status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{selectedPanel.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 text-xs space-y-2">
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Method:</strong> {selectedPanel.extraction_method}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <strong>Working Depth:</strong> {selectedPanel.depth_m} meters below surface
                </p>
                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200">
                  Surface railway buffer: 45 meters restriction enforced under CMR 2017 Reg 112.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
