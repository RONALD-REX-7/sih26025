'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { FilterToolbar } from '@/components/industrial/filter-toolbar';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { Cpu, Battery, Radio } from 'lucide-react';

export default function SensorsPage() {
  const [selectedPanel, setSelectedPanel] = useState('ALL');

  const filteredNodes = DEMO_NODES.filter((node) => {
    if (selectedPanel === 'ALL') return true;
    if (selectedPanel.includes('P-101') && node.panel_id === 'p-101') return true;
    if (selectedPanel.includes('P-102') && node.panel_id === 'p-102') return true;
    if (selectedPanel.includes('P-103') && node.panel_id === 'p-103') return true;
    if (selectedPanel.includes('P-104') && node.panel_id === 'p-104') return true;
    return false;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Hardware Fleet Telemetry
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sensor Node Fleet (16 Nodes &bull; 80 Channels)
          </h1>
          <p className="text-xs text-slate-500">
            ESP32-S3 edge controllers with LoRaWAN wireless telemetry deployed across Panels P-101 to P-104.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse" />
            16 / 16 Operational
          </Badge>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        selectedPanel={selectedPanel}
        onSelectPanel={setSelectedPanel}
        totalItemsCount={filteredNodes.length}
      />

      {/* Nodes Fleet Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-600" />
            Edge Sensor Nodes Fleet Registry
          </CardTitle>
          <CardDescription className="text-xs">
            Georeferenced coordinates, hardware firmware versions, power status, and telemetry channels
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Node Code</TableHead>
                <TableHead>Panel Location</TableHead>
                <TableHead>Surface Coordinates</TableHead>
                <TableHead>Elevation</TableHead>
                <TableHead>Hardware / Firmware</TableHead>
                <TableHead>Battery %</TableHead>
                <TableHead>Telemetry Channels</TableHead>
                <TableHead>Link Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map((node) => (
                <TableRow key={node.id} className="text-xs">
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {node.node_code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                    {node.panel?.name}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    {node.latitude.toFixed(4)}° N, {node.longitude.toFixed(4)}° E
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {node.elevation_m.toFixed(1)} m
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-slate-500">
                    {node.hardware_version} ({node.firmware_version})
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Battery className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{node.battery_level}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    Tilt X/Y &bull; Disp &bull; Vib &bull; Strain
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px]">
                      <Radio className="h-2.5 w-2.5 mr-1 inline-block" />
                      {node.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
