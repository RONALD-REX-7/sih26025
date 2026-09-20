'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export default function TelemetryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Telemetry Streams</h1>
          <p className="text-xs text-slate-500">
            Real-time continuous multi-channel sensor observation feeds across Bhowra-West Colliery.
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono">
          Phase 2 Implementation Target
        </Badge>
      </div>

      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-8 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-600">
            <Activity className="h-8 w-8" />
          </div>
          <CardTitle className="text-base font-semibold">Telemetry Ingestion & Time-Series Engine</CardTitle>
          <CardDescription className="max-w-md text-xs text-slate-500">
            Phase 1 Foundation provides the underlying database schema and typed telemetry models.
            Phase 2 will implement live streaming ingestion, high-speed time-series charts, and multi-sensor correlation.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
