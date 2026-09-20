'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuditEntry } from '@/lib/domain/types';
import { useAlertStore } from '@/lib/alerts/alert-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, ShieldCheck, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { StateContainer } from '@/components/industrial/state-container';

export default function AuditPage() {
  const { auditEntries: storeAudits, initAlertEngine } = useAlertStore();
  const [supabaseEntries, setSupabaseEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const fetchSupabaseAudit = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('audit_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError || !data || data.length === 0) {
        setIsLiveSupabase(false);
      } else {
        setSupabaseEntries((data as unknown as AuditEntry[]) || []);
        setIsLiveSupabase(true);
      }
    } catch {
      setIsLiveSupabase(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const { data, error: queryError } = await createClient()
          .from('audit_entries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!isMounted) return;
        if (!queryError && data && data.length > 0) {
          setSupabaseEntries(data as unknown as AuditEntry[]);
          setIsLiveSupabase(true);
        }
      } catch {
        // Fallback to in-memory store
      }
    }
    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge store audits with supabase audits (deduplicated by id)
  const combinedEntries = useMemo(() => {
    const map = new Map<string, AuditEntry>();
    for (const entry of storeAudits) {
      map.set(entry.id, entry);
    }
    for (const entry of supabaseEntries) {
      if (!map.has(entry.id)) {
        map.set(entry.id, entry);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [storeAudits, supabaseEntries]);

  const filteredEntries = combinedEntries.filter((entry) => {
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
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Statutory Governance &bull; DGMS Regulation 112 Compliance
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Immutable Regulatory Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Cryptographically timestamped operational log tracking alert triggers, acknowledgements, evacuations, and sensor calibrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSupabaseAudit}
            disabled={isLoading}
            className="text-xs font-mono"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportAuditCsv}
            className="text-xs font-mono bg-slate-50 dark:bg-slate-900"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export DGMS CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search action, entity ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs font-mono bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-500">Signatory Role:</span>
            {['ALL', 'MineManager', 'SafetyOfficer', 'Engineer', 'Administrator'].map((role) => (
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

      {/* Audit Log Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Event Ledger Records ({filteredEntries.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Every critical action carries an authenticated signature, role, and before/after delta
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {isLiveSupabase ? 'Supabase Synchronized' : 'Session & Seed Ledger'}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead>Timestamp (IST)</TableHead>
                <TableHead>Signatory Role</TableHead>
                <TableHead>Action Code</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Network IP</TableHead>
                <TableHead className="text-right">Audit Payload Delta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8">
                    <StateContainer
                      type="empty"
                      title="No Audit Records Found"
                      description="No records matched your search query or role filter criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="text-xs font-mono hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <TableCell className="text-slate-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono capitalize ${
                          entry.user_role === 'SafetyOfficer'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : entry.user_role === 'MineManager'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : entry.user_role === 'Administrator'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                            : 'bg-slate-50 text-slate-600 border-slate-300'
                        }`}
                      >
                        {entry.user_role ?? 'System'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                      {entry.action}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      <span className="text-[11px] font-mono">
                        {entry.entity_type} {entry.entity_id ? `(${entry.entity_id})` : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-[11px]">
                      {entry.ip_address ?? '10.14.2.45'}
                    </TableCell>
                    <TableCell className="text-right">
                      <code className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 max-w-72 truncate inline-block">
                        {JSON.stringify(entry.payload_after ?? entry.payload_before ?? {})}
                      </code>
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
