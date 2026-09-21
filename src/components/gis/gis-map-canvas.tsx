'use client';

import React, { useState } from 'react';
import { GisLayerId, GisInSarPoint } from '@/lib/domain/gis-types';
import { GIS_BOUNDS, GIS_INSAR_POINTS, GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { DEMO_PANELS, DEMO_NODES } from '@/lib/data/mock-data';
import { RiskState } from '@/lib/domain/risk-states';
import { Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GisMapCanvasProps {
  activeLayers: Record<GisLayerId, boolean>;
  selectedNodeCode: string | null;
  selectedEventId: string | null;
  onSelectNode: (nodeCode: string) => void;
  onSelectEvent: (eventId: string) => void;
  liveRiskByNode?: Record<string, RiskState>;
  className?: string;
}

export function GisMapCanvas({
  activeLayers,
  selectedNodeCode,
  selectedEventId,
  onSelectNode,
  onSelectEvent,
  liveRiskByNode = {},
  className,
}: GisMapCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredInSar, setHoveredInSar] = useState<GisInSarPoint | null>(null);

  // Geographic WGS84 to SVG Canvas transformation
  const width = 800;
  const height = 560;
  const pad = 40;

  const latToY = (lat: number) => {
    const norm = (lat - GIS_BOUNDS.minLat) / (GIS_BOUNDS.maxLat - GIS_BOUNDS.minLat);
    return (1 - norm) * (height - pad * 2) + pad;
  };

  const lonToX = (lon: number) => {
    const norm = (lon - GIS_BOUNDS.minLon) / (GIS_BOUNDS.maxLon - GIS_BOUNDS.minLon);
    return norm * (width - pad * 2) + pad;
  };

  // Color mapper for InSAR Line-of-Sight Displacement
  const getInSarColor = (dispMm: number) => {
    if (dispMm <= -25) return '#ef4444'; // severe subsidence
    if (dispMm <= -15) return '#f97316'; // moderate
    if (dispMm <= -5) return '#eab308'; // mild
    if (dispMm <= 0) return '#6366f1'; // slight settlement
    return '#10b981'; // stable / slight heave
  };

  return (
    <div className={`relative bg-[#0F1E2E] rounded-sm border border-[#D7DEDC] overflow-hidden select-none ${className || ''}`}>
      {/* Top Map HUD Header */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2 bg-[#FFFFFF]/95 backdrop-blur border border-[#D7DEDC] rounded-sm px-3 py-1 text-xs font-mono-tech text-[#1D2933] shadow-xs">
        <Compass className="h-4 w-4 text-[#173B57]" />
        <span className="font-semibold text-[#173B57]">BHOWRA-WEST COLLIERY</span>
        <span className="text-[#D7DEDC]">&bull;</span>
        <span className="text-[#52606D]">Seam VII/VIII</span>
        <span className="text-[#D7DEDC]">&bull;</span>
        <span className="text-[#74808A]">WGS84 EPSG:4326</span>
      </div>

      {/* Top Right Zoom Controls */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-[#FFFFFF]/95 backdrop-blur border border-[#D7DEDC] rounded-sm p-1 shadow-xs">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.0))}
          className="h-7 w-7 text-[#1D2933] hover:bg-[#EDF1F0]"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs font-mono-tech text-[#52606D] px-1.5 font-semibold">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
          className="h-7 w-7 text-[#1D2933] hover:bg-[#EDF1F0]"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setZoom(1)}
          className="h-7 w-7 text-[#1D2933] hover:bg-[#EDF1F0]"
          title="Reset Zoom"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* SVG Canvas with Zoom scale transform */}
      <div className="overflow-auto max-h-150 flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
          className="w-full h-auto min-w-175"
        >
          {/* Geodetic Coordinate Grid */}
          <defs>
            <pattern id="gis-grid" width="80" height="56" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 56" fill="none" stroke="#1c3347" strokeWidth="0.5" strokeDasharray="2,2" />
            </pattern>
            {/* InSAR gradient */}
            <radialGradient id="insar-heat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={width} height={height} fill="#0F1E2E" />
          <rect width={width} height={height} fill="url(#gis-grid)" />

          {/* Coordinate Graticules - 11px Monospace */}
          <g fontSize="11" fontFamily="monospace" fill="#74808A">
            <text x="45" y="24">86°23&apos;40&quot;E</text>
            <text x="240" y="24">86°23&apos;50&quot;E</text>
            <text x="440" y="24">86°24&apos;00&quot;E</text>
            <text x="640" y="24">86°24&apos;10&quot;E</text>
            <text x="10" y="55">23°41&apos;20&quot;N</text>
            <text x="10" y="200">23°41&apos;10&quot;N</text>
            <text x="10" y="360">23°41&apos;00&quot;N</text>
            <text x="10" y="520">23°40&apos;50&quot;N</text>
          </g>

          {/* Colliery Leasehold Boundary (Real Context) */}
          <polygon
            points="60,45 740,45 755,515 50,515"
            fill="none"
            stroke="#3a5a78"
            strokeWidth="1.5"
            strokeDasharray="5,4"
          />
          <text x="70" y="60" fill="#8caec9" fontSize="11" fontFamily="monospace" fontWeight="bold">
            BHOWRA-WEST LEASEHOLD BOUNDARY &bull; DGMS DHANBAD CENTRAL CIRCLE
          </text>

          {/* Geomechanical Reference Layer (CMPDI Empirical Subsidence Boundary) */}
          {activeLayers.geomechanical && (
            <g>
              {/* Subsidence basin boundary at angle of draw ~32° */}
              <ellipse
                cx="310"
                cy="235"
                rx="210"
                ry="140"
                fill="#a855f7"
                fillOpacity="0.08"
                stroke="#c084fc"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              {/* Inflection point margin (max tensile strain zone) */}
              <ellipse
                cx="310"
                cy="235"
                rx="140"
                ry="95"
                fill="none"
                stroke="#e879f9"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text x="150" y="115" fill="#e879f9" fontSize="9" fontFamily="monospace">
                CMPDI EMPIRICAL DRAW ANGLE (θ=32°) &bull; LIMIT ANGLE BOUNDARY
              </text>
              <text x="180" y="130" fill="#c084fc" fontSize="8" fontFamily="monospace">
                Maximum Tensile Strain Zone (Inflection Point ~74m from rib)
              </text>
            </g>
          )}

          {/* InSAR Satellite Observation Layer (Demo Synthetic) */}
          {activeLayers.insar && (
            <g>
              {/* Diffuse regional settlement envelope */}
              <ellipse cx="310" cy="235" rx="170" ry="120" fill="url(#insar-heat)" />

              {/* InSAR Persistent Scatterer Points */}
              {GIS_INSAR_POINTS.map((pt) => {
                const cx = lonToX(pt.longitude);
                const cy = latToY(pt.latitude);
                const color = getInSarColor(pt.displacementMm);
                const isHovered = hoveredInSar?.id === pt.id;

                return (
                  <g
                    key={pt.id}
                    onMouseEnter={() => setHoveredInSar(pt)}
                    onMouseLeave={() => setHoveredInSar(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 4}
                      fill={color}
                      fillOpacity="0.85"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 1.5 : 0.8}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={cx + 8}
                          y={cy - 24}
                          width="165"
                          height="36"
                          fill="#0f172a"
                          stroke="#6366f1"
                          strokeWidth="1"
                          rx="3"
                        />
                        <text x={cx + 14} y={cy - 12} fill="#e2e8f0" fontSize="11" fontFamily="monospace" fontWeight="bold">
                          {pt.id} &bull; DISP: {pt.displacementMm.toFixed(1)}mm
                        </text>
                        <text x={cx + 14} y={cy - 1} fill="#94a3b8" fontSize="11" fontFamily="monospace">
                          {pt.satelliteTrack.slice(0, 24)} (DEMO)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              <text x="490" y="60" fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SENTINEL-1 InSAR LOS DEFORMATION (SYNTHETIC DEMO)
              </text>
            </g>
          )}

          {/* Goaf Depillaring Hazard Contours */}
          {activeLayers.goaf && (
            <g>
              <ellipse
                cx="290"
                cy="225"
                rx="115"
                ry="75"
                fill="#ef4444"
                fillOpacity="0.12"
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeDasharray="4,3"
              />
              <text x="215" y="165" fill="#f87171" fontSize="11" fontFamily="monospace" fontWeight="bold">
                ACTIVE GOAF DEPILLARING CAVING MARGIN (P-101)
              </text>
            </g>
          )}

          {/* Surface Infrastructure & Railways (Public Geographic Context) */}
          {activeLayers.infrastructure && (
            <g>
              {/* Indian Railways surface siding with 45m buffer */}
              {/* Buffer envelope */}
              <path
                d="M 60,115 Q 380,145 740,110"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="32"
                strokeOpacity="0.12"
              />
              {/* Railway track centerline */}
              <path
                d="M 60,115 Q 380,145 740,110"
                fill="none"
                stroke="#d97706"
                strokeWidth="3.5"
                strokeDasharray="7,4"
              />
              <path
                d="M 60,115 Q 380,145 740,110"
                fill="none"
                stroke="#fef08a"
                strokeWidth="1"
              />
              <text x="75" y="105" fill="#fde047" fontSize="11" fontFamily="monospace" fontWeight="bold">
                INDIAN RAILWAYS CHANDRAPURA-ADRA LINE (45m DGMS RESTRICTION BUFFER)
              </text>

              {/* Ventilation Shaft #2 */}
              <circle cx="660" cy="430" r="16" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="660" cy="430" r="5" fill="#38bdf8" />
              <text x="595" y="460" fill="#38bdf8" fontSize="11" fontFamily="monospace">
                VENTILATION SHAFT #2 (UPCAST)
              </text>

              {/* Main Incline Entry #1 */}
              <rect x="110" y="80" width="22" height="14" fill="#059669" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" />
              <text x="90" y="75" fill="#34d399" fontSize="11" fontFamily="monospace">
                MAIN INCLINE #1
              </text>
            </g>
          )}

          {/* Underground Extraction Panels (Prototype Overlay) */}
          {activeLayers.panels && (
            <g>
              {DEMO_PANELS.map((panel, idx) => {
                const coords = [
                  { x: 130, y: 175, w: 250, h: 120 }, // P-101
                  { x: 420, y: 175, w: 260, h: 120 }, // P-102
                  { x: 130, y: 330, w: 250, h: 135 }, // P-103
                  { x: 420, y: 330, w: 260, h: 135 }, // P-104
                ][idx] || { x: 100, y: 100, w: 100, h: 100 };

                return (
                  <g key={panel.id} className="cursor-pointer">
                    <rect
                      x={coords.x}
                      y={coords.y}
                      width={coords.w}
                      height={coords.h}
                      fill="#0f172a"
                      fillOpacity="0.8"
                      stroke="#334155"
                      strokeWidth="1"
                      rx="4"
                    />
                    <text
                      x={coords.x + 10}
                      y={coords.y + 18}
                      fill="#f1f5f9"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {panel.code} &bull; Seam Depth: {panel.depth_m}m
                    </text>
                    <text
                      x={coords.x + 10}
                      y={coords.y + 32}
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {panel.name} ({panel.extraction_method.slice(0, 30)})
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Subsidence Event Epicenter Markers */}
          {activeLayers.events && (
            <g>
              {GIS_SUBSIDENCE_EVENTS.map((evt) => {
                const epicenterNode = DEMO_NODES.find((n) => n.node_code === evt.epicenterNodeCode);
                if (!epicenterNode) return null;
                const cx = lonToX(epicenterNode.longitude);
                const cy = latToY(epicenterNode.latitude);
                const isSelected = selectedEventId === evt.id;

                const color =
                  evt.riskState === 'Critical'
                    ? '#ef4444'
                    : evt.riskState === 'Warning'
                    ? '#f97316'
                    : evt.riskState === 'Watch'
                    ? '#eab308'
                    : '#3b82f6';

                return (
                  <g
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="18"
                      fill={color}
                      fillOpacity="0.2"
                      stroke={color}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray="3,2"
                      className="animate-pulse"
                    />
                    {/* Diamond event marker */}
                    <polygon
                      points={`${cx},${cy - 8} ${cx + 8},${cy} ${cx},${cy + 8} ${cx - 8},${cy}`}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                    <text
                      x={cx + 12}
                      y={cy - 8}
                      fill={color}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {evt.id} [{evt.riskState.toUpperCase()}]
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Sensor Fleet Nodes (16 Nodes) */}
          {activeLayers.nodes && (
            <g>
              {DEMO_NODES.map((node) => {
                const cx = lonToX(node.longitude);
                const cy = latToY(node.latitude);
                const isSelected = selectedNodeCode === node.node_code;
                const isHovered = hoveredNode === node.node_code;
                const nodeRisk = liveRiskByNode[node.node_code] || 'Normal';

                let dotColor = '#38bdf8'; // Normal sky blue
                if (nodeRisk === 'Critical') dotColor = '#ef4444';
                else if (nodeRisk === 'Warning') dotColor = '#f97316';
                else if (nodeRisk === 'Watch') dotColor = '#eab308';
                else if (nodeRisk === 'Advisory') dotColor = '#3b82f6';

                return (
                  <g
                    key={node.id}
                    onClick={() => onSelectNode(node.node_code)}
                    onMouseEnter={() => setHoveredNode(node.node_code)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {/* Selected Halo */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="16"
                        fill="#10b981"
                        fillOpacity="0.25"
                        stroke="#34d399"
                        strokeWidth="1.5"
                        className="animate-pulse"
                      />
                    )}

                    {/* Sensor Node Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected || isHovered ? 6.5 : 5}
                      fill={dotColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1}
                    />

                    {/* Node Code Label */}
                    <text
                      x={cx + 9}
                      y={cy + 4}
                      fill={isSelected ? '#34d399' : isHovered ? '#ffffff' : '#cbd5e1'}
                      fontSize="11"
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

          {/* Scale Bar & Compass Rose in Bottom Corner */}
          <g transform="translate(630, 505)">
            <rect x="0" y="0" width="130" height="28" fill="#0F1E2E" fillOpacity="0.95" stroke="#3a5a78" strokeWidth="0.8" rx="2" />
            <line x1="15" y1="18" x2="115" y2="18" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="15" y1="13" x2="15" y2="23" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="65" y1="15" x2="65" y2="21" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="115" y1="13" x2="115" y2="23" stroke="#e2e8f0" strokeWidth="2" />
            <text x="65" y="11" fill="#e2e8f0" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              100 METERS
            </text>
          </g>
        </svg>
      </div>

      {/* Map Legend Bar at Bottom */}
      <div className="px-3 py-2 border-t border-[#D7DEDC] bg-[#F8FAF9] text-xs font-mono-tech text-[#1D2933] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#173B57]">STATUS:</span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F6B4F] inline-block" />
            Normal
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9A6A00] inline-block" />
            Advisory
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A85A00] inline-block" />
            Watch
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B42318] inline-block" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#91180E] inline-block" />
            Critical
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#52606D]">
            <span className="w-3.5 h-1 bg-[#A85A00] inline-block" />
            Railway 45m Reserve
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#74808A]">
          <span>Click any station or event marker to inspect</span>
        </div>
      </div>
    </div>
  );
}
