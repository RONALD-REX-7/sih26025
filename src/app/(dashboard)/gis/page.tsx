'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

export default function GisPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Underground GIS & Spatial Surveillance</h1>
          <p className="text-xs text-slate-500">
            Georeferenced spatial representation of Bhowra-West Colliery (Jharia Coalfield).
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono">
          Phase 4 Implementation Target
        </Badge>
      </div>

      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-8 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
            <MapPin className="h-8 w-8" />
          </div>
          <CardTitle className="text-base font-semibold">MapLibre GIS Surveillance Layer</CardTitle>
          <CardDescription className="max-w-md text-xs text-slate-500">
            Phase 4 will render interactive georeferenced maps with mine boundaries, panel polygons, 16 sensor nodes, active goaf risk zones, and external Sentinel-1 InSAR synthetic deformation contours.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
