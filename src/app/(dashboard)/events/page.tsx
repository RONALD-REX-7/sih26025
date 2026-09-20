'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { Timeline, TimelineItem } from '@/components/industrial/timeline';
import { StateContainer } from '@/components/industrial/state-container';
import { Activity, Play } from 'lucide-react';
import Link from 'next/link';

const DEMO_EVENT_ITEMS: TimelineItem[] = [
  {
    id: 'evt-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    title: 'Baseline Stratum Stability Confirmed',
    description: 'All 16 nodes reporting normal gradient (< 1.2 mm/m) across Panels P-101 through P-104.',
    riskState: 'Normal',
    provenance: 'DEMO',
    location: 'Colliery Wide',
  },
  {
    id: 'evt-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    title: 'Transient Blasting Vibration Recorded',
    description: 'Peak Particle Velocity reached 3.4 mm/s at SN-107 following depillaring blast. Restored within 4.2 seconds.',
    riskState: 'Advisory',
    provenance: 'DEMO',
    location: 'Panel P-102 (East Incline)',
  },
];

export default function EventsPage() {
  const [showDemoLog, setShowDemoLog] = useState(true);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Intelligence Event Log
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Geotechnical Subsidence Events & Chronology
          </h1>
          <p className="text-xs text-slate-500">
            Detected deformation events, microseismic burst activity, and goaf margin stress migrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDemoLog(!showDemoLog)}
            className="text-xs"
          >
            {showDemoLog ? 'Show Active Live State' : 'Load Demo Scenario Events'}
          </Button>
          <Link href="/simulator">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-medium">
              <Play className="h-3 w-3 mr-1 fill-current" />
              Trigger Event in Simulator
            </Button>
          </Link>
        </div>
      </div>

      {showDemoLog ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Chronological Event Progression (Illustrative Baseline)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">2 Logged Events</Badge>
            </div>
            <CardDescription className="text-xs">
              Chronological log of verified multi-sensor ground deformations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <Timeline items={DEMO_EVENT_ITEMS} />
          </CardContent>
        </Card>
      ) : (
        <StateContainer
          type="empty"
          title="No Active Geotechnical Events"
          description="The mine strata is currently in a stable state. No persistent tilt deflection, borehole displacement, or acoustic emission bursts have exceeded advisory thresholds."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDemoLog(true)}
              className="text-xs"
            >
              Review Baseline Demo Log
            </Button>
          }
        />
      )}
    </div>
  );
}
