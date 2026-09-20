'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Anomaly & Risk Analytics</h1>
          <p className="text-xs text-slate-500">
            Multi-sensor fusion, statistical z-score persistence, and Isolation Forest anomaly detection.
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono">
          Phase 3 Implementation Target
        </Badge>
      </div>

      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-8 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
          <div className="p-3 rounded-full bg-purple-500/10 text-purple-600">
            <TrendingUp className="h-8 w-8" />
          </div>
          <CardTitle className="text-base font-semibold">Interpretable AI Risk Engine</CardTitle>
          <CardDescription className="max-w-md text-xs text-slate-500">
            Phase 3 will deploy explainable multi-sensor anomaly scoring without black-box opacity. The engine explains exactly why risk transitions occur based on rate-of-change, multi-station persistence, and tilt-displacement correlation.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
