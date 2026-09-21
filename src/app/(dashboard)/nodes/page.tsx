'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SensorNode, NodeStatus } from '@/lib/domain/types';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import {
  Battery,
  RefreshCw,
  Cpu,
  Wrench,
  Wifi,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

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
    setNotice(`Station ${nodeCode} toggled. Audit log entry recorded.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredNodes = nodes.filter((n) => {
    if (selectedPanel === 'ALL') return true;
    return n.panel?.code?.toLowerCase() === selectedPanel.toLowerCase() || n.panel_id?.toLowerCase() === selectedPanel.toLowerCase();
  });

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const maintenanceCount = nodes.filter((n) => n.status === 'maintenance').length;
  const avgBattery = (nodes.reduce((acc, n) => acc + (n.battery_level ?? 95), 0) / (nodes.length || 1)).toFixed(1);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-sky-600" />
              Edge Hardware Operations &bull; CMR 2017 Reg. 112
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
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
            className="text-xs font-mono h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Fleet
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Fleet Summary Bar (Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Deployed Stations</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {nodes.length} <span className="text-[10px] font-normal text-slate-500">stations</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Active Telemetry</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {onlineCount} <span className="text-[10px] font-normal text-slate-500">online</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Maintenance Bay</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {maintenanceCount} <span className="text-[10px] font-normal text-slate-500">units</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Mean Battery</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {avgBattery}% <span className="text-[10px] font-normal text-slate-500">LiFePO4</span>
          </div>
        </div>
      </div>

      {/* District Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">District Filter:</span>
          {['ALL', 'p-101', 'p-102', 'p-103', 'p-104'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPanel(p)}
              className={`px-2 py-0.5 text-xs font-mono rounded-xs border uppercase cursor-pointer ${
                selectedPanel === p
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold border-transparent'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-slate-400">{filteredNodes.length} nodes listed</span>
      </div>

      {/* Fleet Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left">Station Code</th>
                <th className="py-2.5 px-3 text-left">District Panel</th>
                <th className="py-2.5 px-3 text-left">Coordinates (WGS84)</th>
                <th className="py-2.5 px-3 text-right">Battery</th>
                <th className="py-2.5 px-3 text-right">LoRa RSSI</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {node.node_code}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans">
                    {node.panel?.name ?? node.panel_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {node.latitude.toFixed(4)}&deg;N, {node.longitude.toFixed(4)}&deg;E
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <Battery className="h-3.5 w-3.5 text-emerald-600" />
                      {node.battery_level ?? 95}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-slate-400" />
                      {node.current_health?.signal_rssi ?? -74} dBm
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-1.5 py-0.2 rounded-xs text-[10px] uppercase font-bold ${
                        node.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : node.status === 'maintenance'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {node.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleMaintenance(node.node_code)}
                      className="px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Wrench className="h-3 w-3 text-slate-500" />
                      {node.status === 'maintenance' ? 'Release' : 'Service'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
