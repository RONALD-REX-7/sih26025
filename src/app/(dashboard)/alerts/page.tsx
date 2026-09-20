'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Alert Center & Evacuation Escalation</h1>
          <p className="text-xs text-slate-500">
            DGMS emergency notification protocol, operator acknowledgements, and audit logging.
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono">
          Phase 5 Implementation Target
        </Badge>
      </div>

      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 p-8 text-center">
        <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
          <div className="p-3 rounded-full bg-red-500/10 text-red-600">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <CardTitle className="text-base font-semibold">Early Warning & Evacuation Escalation</CardTitle>
          <CardDescription className="max-w-md text-xs text-slate-500">
            Phase 5 will deliver in-browser acoustic warning, visual flash, mandatory Safety Officer / Mine Manager acknowledgement modal, and immutable audit recording into Supabase.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
