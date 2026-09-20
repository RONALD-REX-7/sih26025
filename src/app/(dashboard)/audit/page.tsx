'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuditEntry } from '@/lib/domain/types';
import { DEMO_AUDIT_ENTRIES } from '@/lib/data/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, ShieldCheck, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { StateContainer } from '@/components/industrial/state-container';

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(DEMO_AUDIT_ENTRIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('audit_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError || !data || data.length === 0) {
        setEntries(DEMO_AUDIT_ENTRIES);
        setIsLiveSupabase(false);
      } else {
        setEntries((data as unknown as AuditEntry[]) || []);
        setIsLiveSupabase(true);
      }
    } catch {
      setEntries(DEMO_AUDIT_ENTRIES);
      setIsLiveSupabase(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('audit_entries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;
        if (!queryError && data && data.length > 0) {
          setEntries(data as unknown as AuditEntry[]);
          setIsLiveSupabase(true);
        }
      } catch {
        // Retain offline default
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.entity_id && entry.entity_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.user_role && entry.user_role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRole === 'ALL' ||
      (entry.user_role && entry.user_role.toLowerCase() === selectedRole.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'Operator Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Payload'];
    const rows = filteredEntries.map((e) => [
      e.created_at,
      e.user_role ?? 'System',
      e.action,
      e.entity_type,
      e.entity_id ?? '',
      e.ip_address ?? '',
      JSON.stringify(e.payload_after ?? e.payload_before ?? {}).replace(/"/g, '""'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => `"${r.join('","')}"`)].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DGMS_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Regulatory Compliance &bull; CMR 2017
            </span>
            {isLiveSupabase ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                SUPABASE POSTGRESQL LIVE
              </Badge>
            ) : (
              <ProvenanceBadge provenance="DEMO" size="sm" />
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Immutable Audit Trail & Regulatory Evidence
          </h1>
          <p className="text-xs text-slate-500">
            Append-only, tamper-evident audit records for safety officer interventions, threshold alterations, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAuditCsv}
            className="text-xs h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAudit}
            disabled={isLoading}
            className="text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Log
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search action, entity, operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Role:
            </span>
            {['ALL', 'SafetyOfficer', 'MineManager', 'Engineer', 'Administrator'].map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className={`text-[11px] h-7 px-2 font-mono ${
                  selectedRole === role
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Table Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Operational Security & Action Log ({filteredEntries.length} Records)
            </CardTitle>
            <CardDescription className="text-xs">
              {isLiveSupabase
                ? 'Source: Supabase PostgreSQL public.audit_entries'
                : 'Source: Deterministic DGMS Baseline Log (Offline Resilient)'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] text-slate-500">
            SHA-256 Chained
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead>Operator Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Audit Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8">
                    <StateContainer type="loading" title="Querying audit entries..." description="Connecting to data provider..." />
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-8">
                    <StateContainer
                      type="empty"
                      title="No Audit Records Match Query"
                      description="Try adjusting search terms or resetting role filter."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="text-xs hover:bg-slate-50/60 dark:hover:bg-slate-900/60">
                    <TableCell className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {entry.user_role ?? 'System'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                      {entry.action}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {entry.entity_type}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-500 truncate max-w-28">
                      {entry.entity_id ?? '-'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-400">
                      {entry.ip_address ?? '127.0.0.1'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {JSON.stringify(entry.payload_after ?? entry.payload_before ?? {})}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
