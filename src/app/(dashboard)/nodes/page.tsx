'use client';

import React, { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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
import { StatusDot } from '@/components/industrial/status-dot';

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
    if (!isSupabaseConfigured()) {
      setNodes(DEMO_NODES);
      setIsLiveSupabase(false);
      return;
    }
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
      if (!isSupabaseConfigured()) {
        if (!isMounted) return;
        setNodes(DEMO_NODES);
        setIsLiveSupabase(false);
        return;
      }
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
    setNotice(`Station ${nodeCode} maintenance toggled. Audit log entry recorded.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredNodes = nodes.filter((n) => {
    if (selectedPanel === 'ALL') return true;
    return (
      n.panel?.code?.toLowerCase() === selectedPanel.toLowerCase() ||
      n.panel_id?.toLowerCase() === selectedPanel.toLowerCase()
    );
  });

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const maintenanceCount = nodes.filter((n) => n.status === 'maintenance').length;
  const avgBattery = (
    nodes.reduce((acc, n) => acc + (n.battery_level ?? 95), 0) / (nodes.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-[#173B57]" />
              Edge hardware operations &bull; CMR 2017 Reg. 112
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Sensor Node Fleet &amp; Hardware Inventory
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            ESP32-S3 edge controllers with SX1262 LoRaWAN wireless telemetry deployed across underground Panels P-101 to P-104.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNodes}
            disabled={isLoading}
            className="text-xs font-mono-tech h-8 border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#1D2933]"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh fleet
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-3 text-xs bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#2F6B4F] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Fleet Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Deployed stations
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            {nodes.length} <span className="text-xs font-normal text-[#52606D]">stations</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Across 4 extraction panels</div>
        </div>

        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Active telemetry
          </div>
          <div className="text-base font-bold text-[#2F6B4F] mt-0.5 font-mono-tech">
            {onlineCount} <span className="text-xs font-normal text-[#52606D]">transmitting</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">LoRa sub-GHz telemetry</div>
        </div>

        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Maintenance bay
          </div>
          <div className="text-base font-bold text-[#9A6A00] mt-0.5 font-mono-tech">
            {maintenanceCount} <span className="text-xs font-normal text-[#52606D]">servicing</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Scheduled transducer tare</div>
        </div>

        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Mean battery level
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            {avgBattery}% <span className="text-xs font-normal text-[#52606D]">LiFePO4</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Underground intrinsic safety</div>
        </div>
      </div>

      {/* District Filter Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-[#52606D] mr-1">District filter:</span>
          {['ALL', 'p-101', 'p-102', 'p-103', 'p-104'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPanel(p)}
              className={`px-2.5 py-1 text-xs font-mono-tech rounded-sm border uppercase cursor-pointer transition-colors ${
                selectedPanel === p
                  ? 'bg-[#173B57] text-[#FFFFFF] font-bold border-transparent'
                  : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono-tech text-[#52606D]">
          {filteredNodes.length} nodes listed
        </span>
      </div>

      {/* Fleet Inventory Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono-tech">
            <thead className="border-b border-[#D7DEDC] bg-[#F8FAF9] text-xs text-[#52606D] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3.5 text-left">Station code</th>
                <th className="py-2.5 px-3.5 text-left">District panel</th>
                <th className="py-2.5 px-3.5 text-left">Coordinates (WGS84)</th>
                <th className="py-2.5 px-3.5 text-right">Battery</th>
                <th className="py-2.5 px-3.5 text-right">LoRa RSSI</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] text-xs">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-[#1D2933]">
                    {node.node_code}
                  </td>
                  <td className="py-2.5 px-3.5 text-[#52606D] font-sans">
                    {node.panel?.name ?? node.panel_id}
                  </td>
                  <td className="py-2.5 px-3.5 text-[#52606D]">
                    {node.latitude.toFixed(4)}&deg;N, {node.longitude.toFixed(4)}&deg;E
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[#2F6B4F] font-semibold">
                      <Battery className="h-3.5 w-3.5" />
                      {node.battery_level ?? 95}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-[#52606D]">
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-[#74808A]" />
                      {node.current_health?.signal_rssi ?? -74} dBm
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs uppercase font-semibold border ${
                        node.status === 'online'
                          ? 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30'
                          : node.status === 'maintenance'
                          ? 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30'
                          : 'bg-[#FBEBE9] text-[#B42318] border-[#B42318]/30'
                      }`}
                    >
                      {node.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleMaintenance(node.node_code)}
                      className="px-2.5 py-1 rounded-sm border border-[#D7DEDC] text-xs hover:bg-[#EDF1F0] cursor-pointer inline-flex items-center gap-1 text-[#52606D]"
                    >
                      <Wrench className="h-3 w-3 text-[#52606D]" />
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
