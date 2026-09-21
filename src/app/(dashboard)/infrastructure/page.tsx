'use client';

import React, { useState, useMemo } from 'react';
import { DEMO_INFRASTRUCTURE } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { StatusDot } from '@/components/industrial/status-dot';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { RiskState } from '@/lib/domain/risk-states';
import {
  Building2,
  TrainTrack,
  Fan,
  Compass,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function InfrastructurePage() {
  const { latestHealths, currentRiskState, activeAnomalies, state } = useSimulatorStore();
  const [selectedAssetId, setSelectedAssetId] = useState<string>(DEMO_INFRASTRUCTURE[0].id);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SURFACE_RAILWAY':
        return <TrainTrack className="h-4 w-4 text-[#173B57]" />;
      case 'VENTILATION_SHAFT':
        return <Fan className="h-4 w-4 text-[#2F6B4F]" />;
      case 'MAIN_HAULAGE_ROADWAY':
        return <Compass className="h-4 w-4 text-[#9A6A00]" />;
      default:
        return <Building2 className="h-4 w-4 text-[#173B57]" />;
    }
  };

  // Derive live risk state for each infrastructure asset from its monitoring nodes
  const enrichedAssets = useMemo(() => {
    return DEMO_INFRASTRUCTURE.map((asset) => {
      const relatedAnomalies = activeAnomalies.filter((a) =>
        asset.monitoringNodeCodes.includes(a.nodeCode)
      );

      let derivedRisk: RiskState = asset.currentRiskState as RiskState;
      if (relatedAnomalies.length > 0) {
        const hasCritical = relatedAnomalies.some((a) => a.severity === 'critical');
        const hasHigh = relatedAnomalies.some((a) => a.severity === 'high');
        const hasMedium = relatedAnomalies.some((a) => a.severity === 'medium');
        if (hasCritical) derivedRisk = 'Critical';
        else if (hasHigh) derivedRisk = 'Warning';
        else if (hasMedium) derivedRisk = 'Watch';
        else derivedRisk = 'Advisory';
      }

      const nodeOnlineCount = asset.monitoringNodeCodes.filter(
        (code) => latestHealths[code]?.status === 'online'
      ).length;

      const isAffected = state.affectedNodeCodes.some((code) =>
        asset.monitoringNodeCodes.includes(code)
      );

      return {
        ...asset,
        derivedRisk,
        relatedAnomalyCount: relatedAnomalies.length,
        nodeOnlineCount,
        totalNodes: asset.monitoringNodeCodes.length,
        isAffected,
      };
    });
  }, [activeAnomalies, latestHealths, state.affectedNodeCodes]);

  const selectedAsset = useMemo(
    () => enrichedAssets.find((a) => a.id === selectedAssetId) || enrichedAssets[0],
    [enrichedAssets, selectedAssetId]
  );

  const assetsAtRisk = enrichedAssets.filter((a) => a.derivedRisk !== 'Normal').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2F6B4F]" />
              Structural integrity &bull; Surface protection perimeters
            </span>
            <ProvenanceBadge
              provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
              size="sm"
            />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Surface Infrastructure &amp; Statutory Buffer Zones
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            DGMS safety perimeters, railway siding overlays, and underground shaft protection barriers under CMR 2017 Reg 112.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-sm border font-mono-tech text-xs font-semibold ${
              assetsAtRisk > 0
                ? 'bg-[#FBEBE9] text-[#B42318] border-[#B42318]/30'
                : 'bg-[#EAF2ED] text-[#2F6B4F] border-[#2F6B4F]/30'
            }`}
          >
            {assetsAtRisk > 0
              ? `${assetsAtRisk} asset${assetsAtRisk > 1 ? 's' : ''} require attention`
              : `${enrichedAssets.length} assets nominal`}
          </span>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Protected structures
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            {enrichedAssets.length} <span className="text-xs font-normal text-[#52606D]">assets</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Surface &amp; Subsurface</div>
        </div>
        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Perimeter strain limit
          </div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5 font-mono-tech">
            3.0 <span className="text-xs font-normal text-[#52606D]">mm/m DGMS</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Max permissible gradient</div>
        </div>
        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Railway siding buffer
          </div>
          <div className="text-base font-bold text-[#173B57] mt-0.5 font-mono-tech">
            45.0m <span className="text-xs font-normal text-[#52606D]">reserve</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Indian Railways reserve line</div>
        </div>
        <div className="p-3">
          <div className="text-xs text-[#74808A] uppercase tracking-wider font-semibold">
            Colliery risk state
          </div>
          <div className="text-base font-bold mt-0.5 flex items-center gap-2">
            <StatusDot state={currentRiskState} size="md" />
            <span className="text-[#1D2933] font-mono-tech">{currentRiskState}</span>
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Live sensor fusion condition</div>
        </div>
      </div>

      {/* Main Split: Asset Table (Left 65%) + Selected Asset Inspector (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table View */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden">
          <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D2933] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-[#173B57]" />
              Protected assets &amp; regulatory buffer register
            </span>
            <span className="text-xs text-[#52606D] font-mono-tech">CMR 2017 Reg. 112</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-[#D7DEDC] bg-[#F8FAF9] text-xs font-semibold text-[#52606D] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-left">Asset code</th>
                  <th className="py-2.5 px-3 text-left">Structure name</th>
                  <th className="py-2.5 px-3 text-right">Buffer margin</th>
                  <th className="py-2.5 px-3 text-right">Strain limit</th>
                  <th className="py-2.5 px-3 text-left">Stations</th>
                  <th className="py-2.5 px-3 text-center">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DEDC] font-mono-tech text-xs">
                {enrichedAssets.map((asset) => {
                  const isSelected = asset.id === selectedAsset.id;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`hover:bg-[#F8FAF9] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F4F6F5] border-l-2 border-l-[#173B57]' : ''
                      } ${asset.isAffected ? 'bg-[#FBF6E9]/40' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#1D2933] whitespace-nowrap">
                        {asset.code}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-[#1D2933] flex items-center gap-1.5 whitespace-nowrap">
                        {getCategoryIcon(asset.category)}
                        <span>{asset.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#52606D] whitespace-nowrap">
                        {asset.regulatoryBufferDistanceMeters}m
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#52606D] whitespace-nowrap">
                        {asset.criticalStrainLimitMmPerM} mm/m
                      </td>
                      <td className="py-2.5 px-3 text-[#52606D] whitespace-nowrap">
                        {asset.monitoringNodeCodes.join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <RiskBadge state={asset.derivedRisk} size="sm" showLevel={false} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Asset Inspector */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D7DEDC] pb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
                Asset inspector
              </div>
              <h2 className="text-base font-bold text-[#1D2933] mt-0.5 flex items-center gap-1.5">
                {selectedAsset.name}
              </h2>
            </div>
            <RiskBadge state={selectedAsset.derivedRisk} size="sm" showLevel={false} />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Asset identifier</span>
              <span className="font-mono-tech font-bold text-[#1D2933]">{selectedAsset.code}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Structure classification</span>
              <span className="font-medium text-[#1D2933]">{selectedAsset.category}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Geographical location</span>
              <span className="text-[#1D2933]">{selectedAsset.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Statutory buffer margin</span>
              <span className="font-mono-tech font-bold text-[#173B57]">
                {selectedAsset.regulatoryBufferDistanceMeters} meters
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Max allowable strain</span>
              <span className="font-mono-tech font-bold text-[#1D2933]">
                {selectedAsset.criticalStrainLimitMmPerM} mm/m
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Active anomalies</span>
              <span className="font-mono-tech font-bold">
                {selectedAsset.relatedAnomalyCount > 0 ? (
                  <span className="text-[#B42318]">{selectedAsset.relatedAnomalyCount} detected</span>
                ) : (
                  <span className="text-[#2F6B4F]">Zero anomalies</span>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Monitoring telemetry nodes</span>
              <span className="font-mono-tech text-[#173B57]">
                {selectedAsset.monitoringNodeCodes.join(', ')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#F4F6F5] rounded-sm border border-[#D7DEDC] space-y-1.5">
            <div className="text-xs font-semibold text-[#173B57] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              GIS spatial inspection
            </div>
            <p className="text-xs text-[#52606D]">
              Inspect live surface subsidence contour overlay and tilt vectors relative to this structure on the interactive map.
            </p>
            <Link
              href="/gis"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#173B57] hover:underline pt-1"
            >
              Open in spatial GIS <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
