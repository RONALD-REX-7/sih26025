'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SensorNode } from '@/lib/domain/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Battery, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NodesPage() {
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('sensor_nodes')
        .select('*, panel:panels(name, code)')
        .order('node_code', { ascending: true });

      if (queryError) {
        throw queryError;
      }
      setNodes((data as unknown as SensorNode[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query nodes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('sensor_nodes')
          .select('*, panel:panels(name, code)')
          .order('node_code', { ascending: true });

        if (!isMounted) return;
        if (queryError) throw queryError;
        setNodes((data as unknown as SensorNode[]) || []);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to query nodes';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Hardware Fleet Management
            </span>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-300">
              16 NODES SEEDED
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sensor Nodes & Hardware Health</h1>
          <p className="text-xs text-slate-500">
            ESP32 edge nodes deployed across Panels P-101 to P-104 with LoRaWAN telemetry backhaul.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchNodes}
          disabled={isLoading}
          className="text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Nodes
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
          Failed to load sensor nodes: {error}
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Active Sensor Fleet (Supabase Live Query)</CardTitle>
          <CardDescription className="text-xs">
            Directly queried from Supabase PostgreSQL &bull; Table <code className="font-mono text-[11px]">sensor_nodes</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Node Code</TableHead>
                <TableHead>Panel Location</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Elevation</TableHead>
                <TableHead>Hardware</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Provenance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-xs text-slate-500">
                    Querying Supabase database...
                  </TableCell>
                </TableRow>
              ) : nodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-xs text-slate-500">
                    No sensor nodes found.
                  </TableCell>
                </TableRow>
              ) : (
                nodes.map((node) => (
                  <TableRow key={node.id} className="text-xs">
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {node.node_code}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      {node.panel?.name ?? 'General Grid'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-500">
                      {node.latitude.toFixed(4)}° N, {node.longitude.toFixed(4)}° E
                    </TableCell>
                    <TableCell className="font-mono text-[11px]">
                      {node.elevation_m.toFixed(1)} m
                    </TableCell>
                    <TableCell className="text-[11px] text-slate-500 font-mono">
                      {node.hardware_version}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Battery className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{node.battery_level}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono py-0 px-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                        {node.provenance}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                        {node.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
