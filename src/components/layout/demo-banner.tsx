'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { USER_ROLES } from '@/lib/domain/constants';
import { Badge } from '@/components/ui/badge';
import { Play, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function DemoBanner() {
  const { isDemoUser, role, setDemoRole } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] uppercase font-mono tracking-wider py-0 px-1.5"
        >
          {isDemoUser ? 'DEMO SIMULATION' : 'CONNECTED'}
        </Badge>
        <span className="text-slate-300 font-medium">
          SIH26025 Prototype &bull; Jharia Coalfield (Bhowra-West Colliery)
        </span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline text-slate-400 text-[11px]">
          16 Edge Nodes &bull; 80 Sensors &bull; DGMS Regulatory Baseline
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Persona Switcher for SIH Evaluators */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors h-6 px-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 cursor-pointer">
            <User className="h-3 w-3 mr-1 text-amber-400" />
            Role: <span className="font-semibold text-white ml-1">{role}</span>
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs bg-slate-900 border-slate-800 text-slate-200">
            <DropdownMenuLabel className="text-[11px] text-slate-400">Switch Evaluator Persona</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            {USER_ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setDemoRole(r)}
                className={`cursor-pointer text-xs ${role === r ? 'bg-slate-800 font-semibold text-amber-400' : 'hover:bg-slate-800'}`}
              >
                {r === 'SafetyOfficer' && '🛡️ Safety Officer (Evacuation & Alerts)'}
                {r === 'MineManager' && '👷 Mine Manager (Panels & Operations)'}
                {r === 'Engineer' && '🔬 Geotech Engineer (Telemetry & InSAR)'}
                {r === 'Administrator' && '⚙️ Administrator (Audit & System)'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick link to simulator */}
        <Link href="/simulator">
          <Button
            size="sm"
            className="h-6 px-2 text-[11px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
          >
            <Play className="h-2.5 w-2.5 mr-1 fill-current" />
            Simulator Controls
          </Button>
        </Link>
      </div>
    </div>
  );
}
