'use client';

import React, { useMemo } from 'react';
import { DEMO_INFRASTRUCTURE } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { RiskState } from '@/lib/domain/risk-states';
import { Building2, TrainTrack, Fan, Compass, ShieldAlert } from 'lucide-react';

export default function InfrastructurePage() {
  const { latestHealths, currentRiskState, activeAnomalies, state } = useSimulatorStore();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SURFACE_RAILWAY':
        return <TrainTrack className="h-4 w-4 text-sky-600" />;
      case 'VENTILATION_SHAFT':
        return <Fan className="h-4 w-4 text-emerald-600" />;
      case 'MAIN_HAULAGE_ROADWAY':
        return <Compass className="h-4 w-4 text-amber-600" />;
      default:
        return <Building2 className="h-4 w-4 text-purple-600" />;
    }
  };

  // Derive live risk state for each infrastructure asset from its monitoring nodes
  const enrichedAssets = useMemo(() => {
    return DEMO_INFRASTRUCTURE.map((asset) => {
      // Check if any monitoring nodes have anomalies
      const relatedAnomalies = activeAnomalies.filter((a) =>
        asset.monitoringNodeCodes.includes(a.nodeCode)
      );

      // Derive risk state from anomaly severity
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

      // Check node health for any affected monitoring nodes
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

  const assetsAtRisk = enrichedAssets.filter(
    (a) => a.derivedRisk !== 'Normal'
  ).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Structural Integrity &amp; Surface Protection
            </span>
            <ProvenanceBadge
              provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
              size="sm"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Critical Infrastructure &amp; Buffer Zone Surveillance
          </h1>
          <p className="text-xs text-slate-500">
            DGMS safety perimeters, railway siding overlays, and underground ventilation shaft protection barriers.
          </p>
        </div>

        <span className={`px-2 py-0.5 rounded-xs border font-mono text-xs ${
          assetsAtRisk > 0
            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
            : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
        }`}>
          {assetsAtRisk > 0
            ? `${assetsAtRisk} Asset${assetsAtRisk > 1 ? 's' : ''} Require Inspection`
            : `${enrichedAssets.length} Assets Nominal`}
        </span>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Protected Structures</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {enrichedAssets.length} <span className="text-[10px] font-normal text-slate-500">assets</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Perimeter Strain Limit</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            3.0 <span className="text-[10px] font-normal text-slate-500">mm/m DGMS</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Railway Siding Buffer</div>
          <div className="text-base font-bold text-sky-700 dark:text-sky-400 mt-0.5">
            45.0m <span className="text-[10px] font-normal text-slate-500">CMR 2017</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-3">
          <div className="text-[10px] text-slate-400 uppercase">Global Colliery Risk</div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {currentRiskState}
          </div>
        </div>
      </div>

      {/* Infrastructure Registry Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
            Protected Assets &amp; Regulatory Buffer Register
          </span>
          <span className="text-[10px] text-slate-400">DGMS CMR 2017 Reg. 112 Compliance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left">Asset Code</th>
                <th className="py-2.5 px-3 text-left">Structure Name</th>
                <th className="py-2.5 px-3 text-left">Spatial Location</th>
                <th className="py-2.5 px-3 text-right">Buffer Margin</th>
                <th className="py-2.5 px-3 text-right">Strain Limit</th>
                <th className="py-2.5 px-3 text-left">Stations</th>
                <th className="py-2.5 px-3 text-center">Anomalies</th>
                <th className="py-2.5 px-3 text-center">Stability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {enrichedAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                    asset.isAffected ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {asset.code}
                    {asset.isAffected && (
                      <span className="ml-1.5 text-[9px] px-1 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xs">
                        AFFECTED
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {getCategoryIcon(asset.category)}
                    <span>{asset.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">
                    {asset.location}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {asset.regulatoryBufferDistanceMeters}m
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                    {asset.criticalStrainLimitMmPerM} mm/m
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[10px]">
                    {asset.monitoringNodeCodes.join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {asset.relatedAnomalyCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-xs text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold inline-flex items-center gap-0.5">
                        <ShieldAlert className="h-3 w-3" />
                        {asset.relatedAnomalyCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Nominal</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <RiskBadge state={asset.derivedRisk} size="sm" showLevel={false} />
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
