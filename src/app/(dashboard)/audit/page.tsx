'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuditEntry } from '@/lib/domain/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('audit_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setEntries((data as unknown as AuditEntry[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to query audit entries';
      setError(msg);
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
        if (queryError) throw queryError;
        setEntries((data as unknown as AuditEntry[]) || []);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to query audit entries';
        setError(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Regulatory Compliance
            </span>
            <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300">
              IMMUTABLE LOG
            </Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Audit Trail & Operational Compliance</h1>
          <p className="text-xs text-slate-500">
            Append-only tamper-evident audit records for safety officer interventions and system lifecycle events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAudit}
          disabled={isLoading}
          className="text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit Log
        </Button>
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
          Failed to load audit trail: {error}
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Security & Audit Event Log</CardTitle>
          <CardDescription className="text-xs">
            Directly queried from Supabase PostgreSQL &bull; Table <code className="font-mono text-[11px]">audit_entries</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px] font-mono">
                <TableHead>Timestamp (UTC)</TableHead>
                <TableHead>Operator Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Audit Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-slate-500">
                    Querying audit entries from Supabase...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-xs text-slate-500">
                    No audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} className="text-xs">
                    <TableCell className="font-mono text-[11px] text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {entry.user_role ?? 'System'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.action}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {entry.entity_type}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      {entry.entity_id ?? '-'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-slate-600 dark:text-slate-400 max-w-[280px] truncate">
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
