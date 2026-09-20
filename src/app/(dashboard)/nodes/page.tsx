'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SensorNode, NodeStatus } from '@/lib/domain/types';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Battery,
  RefreshCw,
  Cpu,
  Radio,
  Wrench,
  Wifi,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';

export default function NodesPage() {
  const { recordAudit, initAlertEngine } = useAlertStore();
  const [nodes, setNodes] = useState<SensorNode[]>(DEMO_NODES);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const fetchNodes = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('sensor_nodes')
        .select('*, panel:panels(name, code)')
        .order('node_code', { ascending: true });

      if (queryError || !data || data.length === 0) {
        setNodes(DEMO_NODES);
        setIsLiveSupabase(false);
      } else {
        setNodes((data as unknown as SensorNode[]) || []);
        setIsLiveSupabase(true);
      }
    } catch {
      setNodes(DEMO_NODES);
      setIsLiveSupabase(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const { data, error: queryError } = await createClient()
          .from('sensor_nodes')
          .select('*, panel:panels(name, code)')
          .order('node_code', { ascending: true });
        if (!isMounted) return;
        if (!queryError && data && data.length > 0) {
          setNodes(data as unknown as SensorNode[]);
          setIsLiveSupabase(true);
        }
      } catch {
        // Fallback to demo nodes
      }
    }
    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleMaintenance = (nodeCode: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.node_code === nodeCode) {
          const nextStatus: NodeStatus = n.status === 'maintenance' ? 'online' : 'maintenance';
          recordAudit({
            action: nextStatus === 'maintenance' ? 'NODE_MAINTENANCE_ENTER' : 'NODE_MAINTENANCE_EXIT',
            entity_type: 'sensor_node',
            entity_id: nodeCode,
            user_role: 'Engineer',
            payload_before: { status: n.status },
            payload_after: { status: nextStatus, operator: 'Duty Geotechnical Engineer' },
          });
          return { ...n, status: nextStatus };
        }
        return n;
      })
    );
    setNotice(`Maintenance status updated for ${nodeCode}. Audit entry committed.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredNodes = useMemo(() => {
    if (selectedPanel === 'ALL') return nodes;
    return nodes.filter((n) => n.panel_id?.toLowerCase() === selectedPanel.toLowerCase());
  }, [nodes, selectedPanel]);

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const maintenanceCount = nodes.filter((n) => n.status === 'maintenance').length;
  const avgBattery = (nodes.reduce((acc, n) => acc + (n.battery_level || 100), 0) / (nodes.length || 1)).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-sky-600" />
              EDGE HARDWARE OPERATIONS &bull; CMR 2017 REG 112
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sensor Node Fleet &amp; Hardware Inventory
          </h1>
          <p className="text-xs text-slate-500">
            ESP32-S3 edge controllers with SX1262 LoRaWAN wireless telemetry deployed across underground Panels P-101 to P-104.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNodes}
            disabled={isLoading}
            className="text-xs font-mono"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Fleet
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 rounded flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Fleet Telemetry Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Total Deployed Stations"
          channelCode="FLEET-STN-TOT"
          value={nodes.length}
          unit="nodes"
          nominalRange={[16, 16]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Active Transmitting"
          channelCode="FLEET-TX-ACT"
          value={onlineCount}
          unit="online"
          nominalRange={[14, 16]}
          riskState={onlineCount < 14 ? 'Advisory' : 'Normal'}
          provenance="DEMO"
        />
        <MetricBlock
          label="Maintenance Bay"
          channelCode="FLEET-MAINT"
          value={maintenanceCount}
          unit="nodes"
          nominalRange={[0, 2]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Fleet Mean Battery"
          channelCode="FLEET-BAT-AVG"
          value={parseFloat(avgBattery)}
          unit="%"
          nominalRange={[80, 100]}
          riskState={parseFloat(avgBattery) < 70 ? 'Watch' : 'Normal'}
          provenance="DEMO"
        />
      </div>

      {/* Panel Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Radio className="h-3.5 w-3.5 text-slate-400" />
            <span>Filter District Panel:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'p-101', 'p-102', 'p-103', 'p-104'].map((p) => (
              <Button
                key={p}
                variant={selectedPanel === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPanel(p)}
                className={`text-[11px] h-7 px-2.5 font-mono uppercase ${
                  selectedPanel === p
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Fleet Inventory Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-600" />
              ESP32 Edge Node Hardware Fleet ({filteredNodes.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Microcontroller firmware versions, battery telemetry, LoRaWAN backhaul signal, and calibration status
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {isLiveSupabase ? 'Supabase Sync' : 'Local Deterministic Fleet'}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead>Node Code</TableHead>
                <TableHead>Panel Location</TableHead>
                <TableHead>Hardware &amp; Firmware</TableHead>
                <TableHead>Battery Status</TableHead>
                <TableHead>Wireless Link</TableHead>
                <TableHead>Last Heartbeat</TableHead>
                <TableHead>Operational State</TableHead>
                <TableHead className="text-right">Maintenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map((node) => {
                const isMaintenance = node.status === 'maintenance';
                return (
                  <TableRow key={node.id} className="text-xs font-mono hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {node.node_code}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold uppercase">{node.panel?.code || node.panel_id || 'General'}</span>
                      <p className="text-[10px] text-slate-400">
                        {node.latitude.toFixed(4)}&deg;N, {node.longitude.toFixed(4)}&deg;E
                      </p>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold">{node.hardware_version || 'ESP32-S3-WROOM-1'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{node.firmware_version || 'v1.0.4-dgms'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Battery className={`h-4 w-4 ${node.battery_level < 50 ? 'text-rose-500' : 'text-emerald-600'}`} />
                        <span className="font-semibold">{node.battery_level ? node.battery_level.toFixed(1) : '95.0'}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400">LiFePO4 Solar</p>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Wifi className="h-3 w-3 text-emerald-600" />
                        <span>-68 dBm</span>
                      </div>
                      <p className="text-[10px] text-slate-400">SNR: +8.4 dB &bull; 0.1% loss</p>
                    </TableCell>
                    <TableCell className="text-slate-500 text-[11px] whitespace-nowrap">
                      12s ago
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono capitalize ${
                          node.status === 'online'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : node.status === 'maintenance'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {node.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isMaintenance ? 'default' : 'outline'}
                        onClick={() => handleToggleMaintenance(node.node_code)}
                        className={`h-6 text-[10px] font-mono px-2 cursor-pointer ${
                          isMaintenance
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        {isMaintenance ? 'Exit Maint' : 'Set Maint'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
