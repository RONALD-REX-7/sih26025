'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { MetricBlock } from '@/components/industrial/metric-block';
import {
  Layers,
  Cpu,
  MapPin,
  Building2,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { role, profile } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Colliery Operations Command
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-300 font-mono">
              SYSTEM ACTIVE
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bhowra-West Colliery &bull; Underground Subsidence Surveillance
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Jharia Coalfield &bull; Dhanbad Central DGMS Circle &bull; Real-time multi-sensor telemetry & early warning
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100">Active Persona</div>
            <div className="text-xs text-slate-500 font-mono">{role} ({profile?.full_name?.split(' ')[0]})</div>
          </div>
          <RiskBadge state="Normal" size="lg" />
        </div>
      </div>

      {/* Key Metric Highlights / Industrial Readouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricBlock
          label="Biaxial Tilt (X-Axis)"
          channelCode="TILT_X"
          value={12.4}
          unit="arcsec"
          nominalRange={[-150, 150]}
          riskState="Normal"
          rateOfChange={0.8}
          provenance="DEMO"
        />

        <MetricBlock
          label="Surface Displacement"
          channelCode="DISP_Z"
          value={18.5}
          unit="mm"
          nominalRange={[0, 40]}
          riskState="Normal"
          rateOfChange={0.2}
          provenance="DEMO"
        />

        <MetricBlock
          label="Peak Particle Velocity"
          channelCode="VIB_RMS"
          value={3.2}
          unit="mm/s"
          nominalRange={[0, 5]}
          riskState="Normal"
          rateOfChange={-0.4}
          provenance="DEMO"
        />

        <MetricBlock
          label="Rockbolt / Pillar Strain"
          channelCode="STRAIN"
          value={420.0}
          unit="microstrain"
          nominalRange={[-800, 1200]}
          riskState="Normal"
          rateOfChange={5.0}
          provenance="DEMO"
        />
      </div>

      {/* Grouped Operational Navigation */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Operational Information Architecture (11 Modules)
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated monitoring, intelligence, response, traceability, and safety management views
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* MONITOR: Mine & Panels */}
          <Link href="/mine" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-purple-500/10 text-purple-600">
                    <Layers className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">MONITOR</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-purple-600 transition-colors">
                  Mine & Extraction Panels
                </CardTitle>
                <CardDescription className="text-xs">
                  Panels P-101 to P-104 working depths (150m-265m), Bord & Pillar extraction parameters, and strata geological profile.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* MONITOR: GIS */}
          <Link href="/gis" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">MONITOR</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                  Underground GIS Surveillance
                </CardTitle>
                <CardDescription className="text-xs">
                  Spatial representation of colliery boundaries, panel geometry, sensor coordinates, and Sentinel-1 InSAR synthetic deformation.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* INTELLIGENCE: Sensors */}
          <Link href="/sensors" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">INTELLIGENCE</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                  Sensor Fleet Management
                </CardTitle>
                <CardDescription className="text-xs">
                  16 ESP32-S3 edge nodes, battery levels, LoRaWAN RSSI wireless link health, and 80 individual physical sensing channels.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* INTELLIGENCE: Events */}
          <Link href="/events" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">INTELLIGENCE</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-amber-600 transition-colors">
                  Subsidence Event Timeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological event detection log, microseismic acoustic emissions, and goaf break-line progression records.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* RESPONSE: Infrastructure */}
          <Link href="/infrastructure" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-orange-500/10 text-orange-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">RESPONSE</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-orange-600 transition-colors">
                  Infrastructure Protection
                </CardTitle>
                <CardDescription className="text-xs">
                  Indian Railways surface siding line (45m buffer), main haulage roadway, and primary ventilation shaft stability.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* TRACEABILITY: Reports */}
          <Link href="/reports" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-slate-500/10 text-slate-700 dark:text-slate-300">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">TRACEABILITY</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  DGMS Statutory Reports
                </CardTitle>
                <CardDescription className="text-xs">
                  Official Form-IV periodic ground movement compliance filings and shift handover audit logs with CSV export.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* DGMS Compliance & Standards Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold">Regulatory & Architecture Quality Gate</CardTitle>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] font-mono">PHASE 0+1 LOCKED</Badge>
          </div>
          <CardDescription className="text-xs">
            Directorate General of Mines Safety (DGMS) regulatory standards & unified telemetry contract
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Unified Telemetry Contract: Identical interface for future ESP32 & simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Safety Decision Support: Non-deterministic early warning per safety-critical rules</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Data Integrity Classification: Strict provenance tagging on all values</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Information Architecture: 11 Authoritative Operational Routes Established</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
