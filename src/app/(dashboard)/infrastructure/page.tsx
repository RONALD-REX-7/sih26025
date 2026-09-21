'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEMO_INFRASTRUCTURE } from '@/lib/data/mock-data';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { RiskState } from '@/lib/domain/risk-states';
import { Building2, TrainTrack, Fan, Compass, ShieldAlert } from 'lucide-react';

export default function InfrastructurePage() {
  const { latestHealths, currentRiskState, activeAnomalies, state } = useSimulatorStore();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SURFACE_RAILWAY':
        return <TrainTrack className="h-4 w-4 text-blue-600" />;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Structural Integrity &amp; Surface Protection
            </span>
            <ProvenanceBadge
              provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
              size="sm"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Critical Infrastructure Surveillance
          </h1>
          <p className="text-xs text-slate-500">
            DGMS safety perimeters, railway siding overlays, and underground ventilation shaft protection barriers.
          </p>
        </div>

        <Badge
          variant="outline"
          className={`text-xs font-mono ${
            assetsAtRisk > 0
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
          }`}
        >
          {assetsAtRisk > 0
            ? `${assetsAtRisk} Asset${assetsAtRisk > 1 ? 's' : ''} Require Attention`
            : `${enrichedAssets.length} Assets Nominal`}
        </Badge>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Total Protected Assets"
          channelCode="INF-TOT-AST"
          value={enrichedAssets.length}
          unit="structures"
          nominalRange={[3, 3]}
          riskState="Normal"
          provenance="DEMO"
        />
        <MetricBlock
          label="Assets At Risk"
          channelCode="INF-AT-RISK"
          value={assetsAtRisk}
          unit="flagged"
          nominalRange={[0, 0]}
          riskState={assetsAtRisk > 0 ? 'Warning' : 'Normal'}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Active Anomalies on Assets"
          channelCode="INF-ANOM"
          value={enrichedAssets.reduce((sum, a) => sum + a.relatedAnomalyCount, 0)}
          unit="detected"
          nominalRange={[0, 2]}
          riskState={enrichedAssets.some((a) => a.relatedAnomalyCount > 0) ? 'Advisory' : 'Normal'}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
        <MetricBlock
          label="Mine Risk Level"
          channelCode="INF-MINE-RSK"
          value={['Normal', 'Advisory', 'Watch', 'Warning', 'Critical'].indexOf(currentRiskState)}
          unit={`(${currentRiskState})`}
          nominalRange={[0, 1]}
          riskState={currentRiskState}
          provenance={state.status === 'running' ? 'SIMULATED' : 'DEMO'}
        />
      </div>

      {/* Infrastructure Registry Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            Protected Assets &amp; Regulatory Buffer Zones
          </CardTitle>
          <CardDescription className="text-xs">
            Ground movement tolerance limits specified under Coal Mines Regulations (CMR 2017). Risk states derived from live sensor anomalies.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Asset Code</TableHead>
                <TableHead>Structure Name</TableHead>
                <TableHead>Spatial Location</TableHead>
                <TableHead>DGMS Buffer Margin</TableHead>
                <TableHead>Max Strain Limit</TableHead>
                <TableHead>Monitoring Nodes</TableHead>
                <TableHead>Anomalies</TableHead>
                <TableHead>Stability Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className={`text-xs ${
                    asset.isAffected ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <TableCell className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {asset.code}
                    {asset.isAffected && (
                      <Badge
                        variant="outline"
                        className="ml-1.5 text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-500/30"
                      >
                        AFFECTED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {getCategoryIcon(asset.category)}
                    <span>{asset.name}</span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-[11px]">
                    {asset.location}
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {asset.regulatoryBufferDistanceMeters} meters
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                    {asset.criticalStrainLimitMmPerM} mm/m
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span>{asset.monitoringNodeCodes.join(', ')}</span>
                      {Object.keys(latestHealths).length > 0 && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ml-1 ${
                            asset.nodeOnlineCount === asset.totalNodes
                              ? 'text-emerald-600 border-emerald-300'
                              : 'text-amber-600 border-amber-300'
                          }`}
                        >
                          {asset.nodeOnlineCount}/{asset.totalNodes}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {asset.relatedAnomalyCount > 0 ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono bg-rose-50 text-rose-700 border-rose-300"
                      >
                        <ShieldAlert className="h-3 w-3 mr-0.5" />
                        {asset.relatedAnomalyCount}
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RiskBadge state={asset.derivedRisk} size="sm" showLevel={false} />
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
