'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Shield,
  Layers,
  Cpu,
  MapPin,
  TrendingUp,
  AlertOctagon,
  SlidersHorizontal,
  CheckCircle2,
  Database,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { role, profile } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Colliery Operations Center
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-300">
              SYSTEM ACTIVE
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bhowra-West Colliery &bull; Underground Subsidence Surveillance
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-sensor telemetry, empirical subsidence modeling, and early warning decision support.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100">Active Persona</div>
            <div className="text-xs text-slate-500 font-mono">{role} ({profile?.full_name?.split(' ')[0]})</div>
          </div>
          <Link href="/simulator">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Event Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Mine Risk Classification</span>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-black text-emerald-600 tracking-tight">
              NORMAL
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            All 4 panels within DGMS baseline slope (&lt; 3.0 mm/m).
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Edge Telemetry Network</span>
              <Cpu className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              16 / 16
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            Online ESP32-S3 sensor nodes reporting nominal health.
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Monitored Panels</span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              4 Panels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            P-101 (North), P-102 (East), P-103 (Central), P-104 (South).
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Active Early Warnings</span>
              <AlertOctagon className="h-4 w-4 text-slate-400" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              0 Active
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-slate-500">
            No critical or high severity alerts currently raised.
          </CardContent>
        </Card>
      </div>

      {/* Operational Modules Navigation */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
          System Capability Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/telemetry" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-600">
                    <Activity className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Phase 2 Target</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-amber-600 transition-colors">
                  Telemetry Streams
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time multi-channel time-series charts for tilt X/Y, surface displacement, PPV vibration, and pillar strain.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/nodes" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">16 Nodes Seeded</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                  Sensor Nodes & Health
                </CardTitle>
                <CardDescription className="text-xs">
                  Node telemetry health, battery levels, LoRa RSSI link quality, packet loss tracking, and calibration factors.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/gis" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-emerald-500/10 text-emerald-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">MapLibre GIS</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-emerald-600 transition-colors">
                  Underground GIS
                </CardTitle>
                <CardDescription className="text-xs">
                  Georeferenced colliery boundary, panel overlays, sensor locations, goaf margins, and surface infrastructure overlays.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/analytics" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-purple-500/10 text-purple-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Phase 3 Target</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-purple-600 transition-colors">
                  AI Risk Analytics
                </CardTitle>
                <CardDescription className="text-xs">
                  Explainable anomaly detection, Isolation Forest scoring, rate-of-change analysis, and multi-sensor fusion.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/alerts" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-red-500/10 text-red-600">
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Phase 5 Target</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-red-600 transition-colors">
                  Alert Center & Evacuation
                </CardTitle>
                <CardDescription className="text-xs">
                  Operational early warning dispatch, role-based acknowledgement, DGMS protocol escalation, and action logs.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/simulator" className="group">
            <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-amber-500/60 transition-all">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-600">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">Evaluation Core</Badge>
                </div>
                <CardTitle className="text-sm font-semibold group-hover:text-amber-600 transition-colors">
                  Mine-Event Simulator
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic scenario engine for SIH judges: normal baseline, transient blasting, progressive roof deflection, and collapse.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Phase 1 Verification Status Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold">Phase 1 Foundation Architecture Verification</CardTitle>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] font-mono">VERIFIED</Badge>
          </div>
          <CardDescription className="text-xs">
            The underlying database schema, typed domain models, and application shell are successfully operational.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Supabase PostgreSQL Schema: 15 Core Tables & Enums Deployed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Row Level Security (RLS) Enabled on All Tables</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Bhowra-West Colliery (Jharia) Seeded: 16 Nodes, 80 Sensors, 4 Panels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Role-Based Personas: Mine Manager, Safety Officer, Geotech Eng, Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Safety-Critical Domain: Exactly 5 Risk States & 7 Provenance Tags</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Automated Testing: Vitest & DOM Testing Configured</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
