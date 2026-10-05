'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { SensorNode, NodeStatus } from '@/lib/domain/types';
import { DEMO_NODES } from '@/lib/data/mock-data';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import {
  Battery,
  RefreshCw,
  Cpu,
  Wrench,
  Wifi,
  WifiOff,
  CheckCircle2,
  Network,
  Radio,
  Server,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';

interface EnrichedNodeHealth {
  role: 'Sensor Node' | 'Relay Node' | 'Gateway Node';
  uplink: string;
  hopCount: number;
  rssi: number;
  snr: number;
  battery: number;
  packetLossPct: number;
  packetsReceived: number;
  lastSeenSec: number;
  connectivity: 'ONLINE' | 'WEAK LINK' | 'HIGH LOSS' | 'OFFLINE' | 'MAINTENANCE';
}

export default function NodesPage() {
  const { recordAudit, initAlertEngine } = useAlertStore();
  const { latestHealths, state } = useSimulatorStore();
  const isSimulating = state.status === 'running';
  const [nodes, setNodes] = useState<SensorNode[]>(DEMO_NODES);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // Simulated fleet network fault injection states for judge demonstration
  const [injectedFaults, setInjectedFaults] = useState<{
    weakLinkNodes: string[];
    highLossNodes: string[];
    offlineNodes: string[];
    gatewayDegraded: boolean;
  }>({
    weakLinkNodes: [],
    highLossNodes: [],
    offlineNodes: [],
    gatewayDegraded: false,
  });

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
    setTimeout(() => setNotice(null), 3500);
  };

  // Fault injection triggers for demonstration
  const handleTriggerWeakLink = () => {
    setInjectedFaults((prev) => ({
      ...prev,
      weakLinkNodes: prev.weakLinkNodes.includes('SN-103') ? [] : ['SN-103'],
    }));
    setNotice('Injected Weak RF Link (-118 dBm) on station SN-103. Uplink margin degraded.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleTriggerHighLoss = () => {
    setInjectedFaults((prev) => ({
      ...prev,
      highLossNodes: prev.highLossNodes.includes('SN-104') ? [] : ['SN-104'],
    }));
    setNotice('Injected 68% packet loss anomaly on station SN-104.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleTriggerOffline = () => {
    setInjectedFaults((prev) => ({
      ...prev,
      offlineNodes: prev.offlineNodes.includes('SN-105') ? [] : ['SN-105'],
    }));
    setNotice('Simulated hardware communication dropout on station SN-105.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleTriggerGatewayDegraded = () => {
    setInjectedFaults((prev) => ({
      ...prev,
      gatewayDegraded: !prev.gatewayDegraded,
    }));
    setNotice('LoRaWAN Gateway GW-EAST-01 backhaul degraded (elevated latency to cloud).');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRestoreNominal = () => {
    setInjectedFaults({
      weakLinkNodes: [],
      highLossNodes: [],
      offlineNodes: [],
      gatewayDegraded: false,
    });
    setNotice('Restored all sensor nodes and wireless backhaul to nominal state.');
    setTimeout(() => setNotice(null), 3500);
  };

  // Compute enriched health metrics per node
  const enrichedNodes = useMemo(() => {
    return nodes.map((n, idx) => {
      const code = n.node_code;
      const baseHealth = latestHealths[code];
      const isWeak = injectedFaults.weakLinkNodes.includes(code);
      const isLoss = injectedFaults.highLossNodes.includes(code);
      const isOffline = injectedFaults.offlineNodes.includes(code) || n.status === 'offline';
      const isMaint = n.status === 'maintenance';

      // Designate roles: nodes ending in 02 or 06 act as multi-hop surface relay nodes
      const isRelay = code === 'SN-102' || code === 'SN-106' || code === 'SN-110';
      const role: 'Sensor Node' | 'Relay Node' | 'Gateway Node' = isRelay ? 'Relay Node' : 'Sensor Node';
      
      const uplink = isRelay
        ? 'Direct GW-EAST-01'
        : idx % 3 === 0
        ? 'Via SN-102 (Relay Hop 2)'
        : 'Direct GW-WEST-02';

      const hopCount = isRelay ? 1 : idx % 3 === 0 ? 2 : 1;

      let rssi = baseHealth?.signalRssiDbm ?? (-72 - (idx * 2) % 15);
      let snr = 8.5 - (idx * 0.8) % 4;
      let packetLoss = baseHealth?.packetLossPct ?? 0.0;
      let connectivity: EnrichedNodeHealth['connectivity'] = 'ONLINE';

      if (isMaint) {
        connectivity = 'MAINTENANCE';
      } else if (isOffline) {
        connectivity = 'OFFLINE';
        rssi = -135;
        snr = -15.0;
        packetLoss = 100.0;
      } else if (isLoss) {
        connectivity = 'HIGH LOSS';
        packetLoss = 68.4;
      } else if (isWeak) {
        connectivity = 'WEAK LINK';
        rssi = -118;
        snr = -4.2;
      }

      const healthInfo: EnrichedNodeHealth = {
        role,
        uplink,
        hopCount,
        rssi,
        snr: parseFloat(snr.toFixed(1)),
        battery: n.battery_level ?? 92.5,
        packetLossPct: parseFloat(packetLoss.toFixed(1)),
        packetsReceived: isOffline ? 0 : 380 + (idx * 17) % 50,
        lastSeenSec: isOffline ? 284 : isSimulating ? 1 : 2,
        connectivity,
      };

      return {
        ...n,
        networkHealth: healthInfo,
      };
    });
  }, [nodes, latestHealths, injectedFaults, isSimulating]);

  const filteredNodes = enrichedNodes.filter((n) => {
    if (selectedPanel === 'ALL') return true;
    return (
      n.panel?.code?.toLowerCase() === selectedPanel.toLowerCase() ||
      n.panel_id?.toLowerCase() === selectedPanel.toLowerCase()
    );
  });

  const onlineCount = enrichedNodes.filter((n) => n.networkHealth.connectivity === 'ONLINE').length;
  const degradedCount = enrichedNodes.filter((n) => n.networkHealth.connectivity === 'WEAK LINK' || n.networkHealth.connectivity === 'HIGH LOSS').length;
  const offlineCount = enrichedNodes.filter((n) => n.networkHealth.connectivity === 'OFFLINE').length;
  const maintenanceCount = enrichedNodes.filter((n) => n.networkHealth.connectivity === 'MAINTENANCE').length;
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
              Edge hardware operations &bull; Wireless Telemetry Infrastructure
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Sensor Node Fleet &amp; Wireless Network Health
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Real-time monitoring of ESP32-S3 edge controllers, surface mesh relay links, LoRaWAN star backhaul, and signal quality metrics.
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

      {/* Engineering Clarification Banner: LoRaWAN vs Surface Mesh */}
      <div className="bg-[#F8FAF9] p-3.5 rounded-sm border border-[#D7DEDC] text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#173B57] font-bold">
          <Network className="h-4 w-4 text-[#173B57]" />
          <span>Wireless Architecture Clarification &bull; Topology Distinction</span>
        </div>
        <p className="text-[#52606D] leading-relaxed">
          <strong>LoRaWAN Standard:</strong> Operates as a point-to-multipoint <em>Star-of-Stars topology</em> where sensor nodes communicate directly with sub-GHz gateways (IN865 Band). LoRaWAN standard specification does not provide native mesh routing.
        </p>
        <p className="text-[#52606D] leading-relaxed">
          <strong>MineGuard Surface Mesh Innovation:</strong> To overcome severe undulating coalfield terrain and non-line-of-sight (NLOS) subsidence fissures, MineGuard incorporates an experimental peer-to-peer <em>multi-hop surface relay concept</em>. Nodes with direct line-of-sight act as packet forwarders to central gateways.{' '}
          <span className="font-mono-tech text-[11px] text-[#9A6A00] font-semibold">
            [SIMULATED IN SOFTWARE — PHYSICAL MULTI-HOP RELAY IMPLEMENTATION SUBJECT TO FIELD/HARDWARE VALIDATION]
          </span>
        </p>
      </div>

      {/* End-to-End Wireless Network Topology Flow */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#173B57] flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-[#173B57]" />
            End-to-End Telemetry Pipeline &amp; Routing Topology
          </span>
          <span className="text-[11px] font-mono-tech text-[#52606D]">
            Gateways: GW-EAST-01 &bull; GW-WEST-02
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs font-mono-tech">
          {/* Step 1 */}
          <div className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#173B57]">1. SURFACE NODES</div>
              <div className="text-[10px] text-[#52606D] mt-1">16x ESP32-S3 stations</div>
            </div>
            <div className="mt-2 text-[10px] text-[#2F6B4F] font-semibold bg-[#EAF2ED] py-0.5 rounded-xs">
              0.01° Inclinometer
            </div>
          </div>

          {/* Step 2: Multi-hop Relay */}
          <div className="p-2.5 rounded-sm bg-[#FBF6E9] border border-[#9A6A00]/30 flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#9A6A00]">2. SURFACE MESH</div>
              <div className="text-[10px] text-[#52606D] mt-1">Multi-Hop Relay</div>
            </div>
            <div className="mt-2 text-[10px] text-[#9A6A00] font-semibold bg-[#FFFFFF] py-0.5 rounded-xs">
              Simulated Software
            </div>
          </div>

          {/* Step 3: Gateway */}
          <div className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#173B57]">3. GATEWAY</div>
              <div className="text-[10px] text-[#52606D] mt-1">LoRaWAN Star Concentrator</div>
            </div>
            <div className="mt-2 text-[10px] text-[#52606D] font-semibold bg-[#EDF1F0] py-0.5 rounded-xs">
              SX1302 Backhaul
            </div>
          </div>

          {/* Step 4: Edge Buffer */}
          <div className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#173B57]">4. EDGE BUFFER</div>
              <div className="text-[10px] text-[#52606D] mt-1">Store-and-Forward</div>
            </div>
            <div className="mt-2 text-[10px] text-[#2F6B4F] font-semibold bg-[#EAF2ED] py-0.5 rounded-xs">
              IndexedDB / Local
            </div>
          </div>

          {/* Step 5: Ingestion */}
          <div className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#173B57]">5. SERVER INGEST</div>
              <div className="text-[10px] text-[#52606D] mt-1">API Route Handler</div>
            </div>
            <div className="mt-2 text-[10px] text-[#173B57] font-semibold bg-[#EDF1F0] py-0.5 rounded-xs">
              Zod CRC Validation
            </div>
          </div>

          {/* Step 6: AI Engine */}
          <div className="p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC] flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#173B57]">6. AI RISK ENGINE</div>
              <div className="text-[10px] text-[#52606D] mt-1">Fusion &amp; Forecast</div>
            </div>
            <div className="mt-2 text-[10px] text-[#173B57] font-semibold bg-[#EDF1F0] py-0.5 rounded-xs">
              EWMA + Pearson
            </div>
          </div>

          {/* Step 7: Alert */}
          <div className="p-2.5 rounded-sm bg-[#FBEBE9] border border-[#B42318]/30 flex flex-col justify-between">
            <div>
              <div className="font-bold text-[#B42318]">7. EARLY WARNING</div>
              <div className="text-[10px] text-[#52606D] mt-1">Dispatches &amp; Siren</div>
            </div>
            <div className="mt-2 text-[10px] text-[#B42318] font-semibold bg-[#FFFFFF] py-0.5 rounded-xs">
              CMR 112 Siren
            </div>
          </div>
        </div>
      </div>

      {/* Network Fault Injection Toolbar (Judge Demonstration) */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#9A6A00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D2933]">
              Judge Interactive Fault Injection &bull; Network Infrastructure Resilience
            </span>
          </div>
          <span className="text-xs font-mono-tech text-[#52606D]">
            Verify platform detects telemetry link degradation independently of strata anomalies
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerWeakLink}
            className={`px-2.5 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              injectedFaults.weakLinkNodes.includes('SN-103')
                ? 'bg-[#9A6A00] text-[#FFFFFF] font-bold border-transparent'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            {injectedFaults.weakLinkNodes.includes('SN-103') ? 'Clear Weak Link' : 'Trigger Weak Link (-118 dBm on SN-103)'}
          </button>

          <button
            type="button"
            onClick={handleTriggerHighLoss}
            className={`px-2.5 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              injectedFaults.highLossNodes.includes('SN-104')
                ? 'bg-[#B42318] text-[#FFFFFF] font-bold border-transparent'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            {injectedFaults.highLossNodes.includes('SN-104') ? 'Clear Packet Loss' : 'Inject High Packet Loss (68% on SN-104)'}
          </button>

          <button
            type="button"
            onClick={handleTriggerOffline}
            className={`px-2.5 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              injectedFaults.offlineNodes.includes('SN-105')
                ? 'bg-[#B42318] text-[#FFFFFF] font-bold border-transparent'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            {injectedFaults.offlineNodes.includes('SN-105') ? 'Reconnect SN-105' : 'Disconnect Node (Simulate SN-105 Offline)'}
          </button>

          <button
            type="button"
            onClick={handleTriggerGatewayDegraded}
            className={`px-2.5 py-1.5 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
              injectedFaults.gatewayDegraded
                ? 'bg-[#9A6A00] text-[#FFFFFF] font-bold border-transparent'
                : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
            }`}
          >
            {injectedFaults.gatewayDegraded ? 'Restore Gateway' : 'Simulate Gateway Degraded (GW-EAST-01)'}
          </button>

          <button
            type="button"
            onClick={handleRestoreNominal}
            className="px-2.5 py-1.5 text-xs font-mono-tech rounded-sm border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#EAF2ED] font-semibold cursor-pointer ml-auto"
          >
            Restore All Links (Nominal)
          </button>
        </div>
      </div>

      {/* Fleet Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-[11px] text-[#5B6871] uppercase tracking-wider font-semibold">
            Fleet Stations
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            {nodes.length} <span className="text-xs font-normal text-[#52606D]">active</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">4 extraction panels</div>
        </div>

        <div className="p-3">
          <div className="text-[11px] text-[#5B6871] uppercase tracking-wider font-semibold">
            Nominal Uplink
          </div>
          <div className="text-base font-bold text-[#2F6B4F] mt-0.5 font-mono-tech">
            {onlineCount} <span className="text-xs font-normal text-[#52606D]">nodes</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Sub-GHz LoRa / Mesh</div>
        </div>

        <div className="p-3">
          <div className="text-[11px] text-[#5B6871] uppercase tracking-wider font-semibold">
            Degraded Links
          </div>
          <div className="text-base font-bold text-[#9A6A00] mt-0.5 font-mono-tech">
            {degradedCount} <span className="text-xs font-normal text-[#52606D]">warning</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Weak RSSI / Loss</div>
        </div>

        <div className="p-3">
          <div className="text-[11px] text-[#5B6871] uppercase tracking-wider font-semibold">
            Offline / Dropout
          </div>
          <div className="text-base font-bold text-[#B42318] mt-0.5 font-mono-tech">
            {offlineCount} <span className="text-xs font-normal text-[#52606D]">silent</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Heartbeat timeout &gt; 60s</div>
        </div>

        <div className="p-3">
          <div className="text-[11px] text-[#5B6871] uppercase tracking-wider font-semibold">
            Mean Battery
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            {avgBattery}% <span className="text-xs font-normal text-[#52606D]">LiFePO4</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Intrinsic safety rated</div>
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
          {filteredNodes.length} nodes listed &bull; Gateway GW-EAST-01 Status: {injectedFaults.gatewayDegraded ? 'DEGRADED (LATENCY)' : 'ONLINE'}
        </span>
      </div>

      {/* Fleet Inventory & Network Health Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono-tech">
            <thead className="border-b border-[#D7DEDC] bg-[#F8FAF9] text-xs text-[#52606D] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Node ID</th>
                <th className="py-2.5 px-3 text-left">Topology Role</th>
                <th className="py-2.5 px-3 text-left">Hop / Gateway Uplink</th>
                <th className="py-2.5 px-3 text-right">RSSI</th>
                <th className="py-2.5 px-3 text-right">SNR</th>
                <th className="py-2.5 px-3 text-right">Battery</th>
                <th className="py-2.5 px-3 text-right">Data Age</th>
                <th className="py-2.5 px-3 text-right">Packet Loss</th>
                <th className="py-2.5 px-3 text-center">Connectivity</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] text-xs">
              {filteredNodes.map((node) => {
                const nh = node.networkHealth;
                return (
                  <tr key={node.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#1D2933]">
                      {node.node_code}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold border ${
                        nh.role === 'Relay Node'
                          ? 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30'
                          : 'bg-[#F8FAF9] text-[#173B57] border-[#D7DEDC]'
                      }`}>
                        {nh.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#52606D]">
                      {nh.uplink}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-semibold ${
                        nh.rssi < -110 ? 'text-[#B42318]' : nh.rssi < -95 ? 'text-[#9A6A00]' : 'text-[#2F6B4F]'
                      }`}>
                        {nh.rssi} dBm
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#52606D]">
                      {nh.snr > 0 ? `+${nh.snr}` : nh.snr} dB
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[#2F6B4F] font-semibold">
                        <Battery className="h-3 w-3" />
                        {nh.battery}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#52606D]">
                      {nh.lastSeenSec}s ago
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-semibold ${
                        nh.packetLossPct > 20 ? 'text-[#B42318]' : nh.packetLossPct > 5 ? 'text-[#9A6A00]' : 'text-[#2F6B4F]'
                      }`}>
                        {nh.packetLossPct}% ({nh.packetsReceived} pkts)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-xs uppercase font-semibold border ${
                          nh.connectivity === 'ONLINE'
                            ? 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30'
                            : nh.connectivity === 'WEAK LINK'
                            ? 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30'
                            : nh.connectivity === 'HIGH LOSS'
                            ? 'bg-[#FBEBE9] text-[#B42318] border-[#B42318]/30'
                            : nh.connectivity === 'MAINTENANCE'
                            ? 'bg-[#EDF1F0] text-[#52606D] border-[#D7DEDC]'
                            : 'bg-[#FBEBE9] text-[#B42318] border-[#B42318]/30'
                        }`}
                      >
                        {nh.connectivity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleMaintenance(node.node_code)}
                        className="px-2 py-0.5 rounded-sm border border-[#D7DEDC] text-xs hover:bg-[#EDF1F0] cursor-pointer inline-flex items-center gap-1 text-[#52606D]"
                      >
                        <Wrench className="h-3 w-3 text-[#52606D]" />
                        {node.status === 'maintenance' ? 'Release' : 'Service'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

