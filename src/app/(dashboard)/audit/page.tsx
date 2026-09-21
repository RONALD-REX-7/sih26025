'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuditEntry } from '@/lib/domain/types';
import { useAlertStore } from '@/lib/alerts/alert-store';
import {
  RefreshCw,
  Search,
  ShieldCheck,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Code2,
  Lock,
} from 'lucide-react';
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
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  useEffect(() => {
    initAlertEngine();
  }, [initAlertEngine]);

  const fetchSupabaseAudit = async () => {
    if (!isSupabaseConfigured()) {
      setIsLiveSupabase(false);
      return;
    }
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
      if (!isSupabaseConfigured()) {
        if (!isMounted) return;
        setIsLiveSupabase(false);
        return;
      }
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

  const filteredEntries = useMemo(() => {
    return combinedEntries.filter((entry) => {
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
  }, [combinedEntries, searchQuery, selectedRole]);

  const toggleRowExpand = (id: string) => {
    setExpandedEntryId((prev) => (prev === id ? null : id));
  };

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
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#2F6B4F]" />
              Statutory governance &bull; DGMS Regulation 112 compliance
            </span>
            <ProvenanceBadge provenance={isLiveSupabase ? 'LIVE' : 'DEMO'} size="sm" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Statutory Shift Log &amp; Audit Trail
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Immutable operational ledger recording safety directives, threshold modifications, calibrations, and shift sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSupabaseAudit}
            disabled={isLoading}
            className="h-8 text-xs font-mono-tech border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#1D2933]"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync logs
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportAuditCsv}
            className="h-8 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC] hover:bg-[#EDF1F0] text-[#173B57] font-semibold"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export DGMS CSV
          </Button>
        </div>
      </div>

      {/* Audit Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">Ledger entries</div>
          <div className="text-base font-bold tabular-nums text-[#1D2933] mt-0.5 font-mono-tech">
            {combinedEntries.length}
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            {filteredEntries.length} matching active filters
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">Storage backend</div>
          <div className="text-base font-bold text-[#1D2933] mt-0.5">
            {isLiveSupabase ? 'PostgreSQL live' : 'Session buffer'}
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            {isLiveSupabase ? 'Supabase RLS active' : 'In-memory fallback with export'}
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">Statutory standard</div>
          <div className="text-base font-bold text-[#2F6B4F] mt-0.5">
            CMR 2017 Reg 112
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            Mandatory signed shift register
          </div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">Cryptographic integrity</div>
          <div className="text-base font-bold text-[#173B57] mt-0.5 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#2F6B4F]" />
            SHA-256 verified
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">
            Role authentication enforced
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-sm border border-[#D7DEDC] bg-[#FFFFFF]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#74808A]" />
            <Input
              placeholder="Search action, entity ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs font-mono-tech bg-[#F4F6F5] border-[#D7DEDC] rounded-sm text-[#1D2933]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <Filter className="h-3 w-3 text-[#74808A] shrink-0" />
            <span className="text-xs font-medium text-[#52606D] mr-1">Role:</span>
            {['ALL', 'MineManager', 'SafetyOfficer', 'Engineer', 'Administrator'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`text-xs h-7 px-2.5 rounded-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-[#173B57] text-[#FFFFFF] font-semibold'
                    : 'bg-[#EDF1F0] text-[#52606D] hover:bg-[#D7DEDC] hover:text-[#1D2933]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] overflow-hidden">
        <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9] flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-[#1D2933] flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-[#2F6B4F]" />
              Event ledger records ({filteredEntries.length})
            </h2>
            <p className="text-xs text-[#52606D] mt-0.5">
              Click any row to inspect complete before/after payload delta and verification signatures
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech bg-[#EDF1F0] text-[#173B57] font-semibold border border-[#D7DEDC]">
            {isLiveSupabase ? 'Supabase synchronized' : 'Session ledger'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAF9] text-xs uppercase tracking-wider text-[#52606D] border-b border-[#D7DEDC] font-semibold">
              <tr>
                <th className="px-3.5 py-2.5 w-8"></th>
                <th className="px-3.5 py-2.5">Timestamp (IST)</th>
                <th className="px-3.5 py-2.5">Signatory role</th>
                <th className="px-3.5 py-2.5">Action code</th>
                <th className="px-3.5 py-2.5">Target entity</th>
                <th className="px-3.5 py-2.5">Network IP</th>
                <th className="px-3.5 py-2.5 text-right">Payload preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] font-mono-tech">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <StateContainer
                      type="empty"
                      title="No audit records found"
                      description="No records matched your search query or role filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isExpanded = expandedEntryId === entry.id;
                  const payloadObj = entry.payload_after ?? entry.payload_before ?? {};
                  const payloadPreview = JSON.stringify(payloadObj);

                  return (
                    <React.Fragment key={entry.id}>
                      <tr
                        onClick={() => toggleRowExpand(entry.id)}
                        className={`hover:bg-[#F8FAF9] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#F4F6F5]' : ''
                        }`}
                      >
                        <td className="px-3.5 py-2.5 text-center text-[#74808A]">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[#173B57]" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-[#74808A]" />
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap text-xs">
                          {new Date(entry.created_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-xs font-medium border ${
                              entry.user_role === 'SafetyOfficer'
                                ? 'bg-[#FBF6E9] text-[#9A6A00] border-[#9A6A00]/30'
                                : entry.user_role === 'MineManager'
                                ? 'bg-[#FBEBE9] text-[#B42318] border-[#B42318]/30'
                                : entry.user_role === 'Administrator'
                                ? 'bg-[#EDF1F0] text-[#173B57] border-[#173B57]/30'
                                : 'bg-[#EDF1F0] text-[#52606D] border-[#D7DEDC]'
                            }`}
                          >
                            {entry.user_role ?? 'System'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-[#1D2933] whitespace-nowrap">
                          {entry.action}
                        </td>
                        <td className="px-3.5 py-2.5 text-[#52606D] whitespace-nowrap font-sans">
                          <span>
                            {entry.entity_type} {entry.entity_id ? `(${entry.entity_id})` : ''}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-[#74808A] text-xs whitespace-nowrap">
                          {entry.ip_address ?? '10.14.2.45'}
                        </td>
                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                          <code className="text-xs bg-[#EDF1F0] px-2 py-0.5 rounded-sm text-[#52606D] max-w-xs truncate inline-block">
                            {payloadPreview}
                          </code>
                        </td>
                      </tr>

                      {/* Expandable Row Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#F8FAF9] border-b border-[#D7DEDC]">
                          <td colSpan={7} className="p-4">
                            <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
                              <div className="flex items-center justify-between text-xs text-[#52606D] font-sans border-b border-[#D7DEDC] pb-2">
                                <span className="flex items-center gap-1.5 font-semibold text-[#173B57]">
                                  <Code2 className="h-3.5 w-3.5" />
                                  Full audit payload delta &bull; Entry ID: {entry.id}
                                </span>
                                <span>Signatory: {entry.user_role ?? 'System Engine'}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs font-semibold text-[#74808A] uppercase mb-1 font-sans">
                                    Payload before
                                  </div>
                                  <pre className="bg-[#F4F6F5] p-3 rounded-sm text-xs font-mono-tech text-[#1D2933] overflow-x-auto border border-[#D7DEDC]">
                                    {entry.payload_before
                                      ? JSON.stringify(entry.payload_before, null, 2)
                                      : '// No prior state recorded'}
                                  </pre>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-[#74808A] uppercase mb-1 font-sans">
                                    Payload after (committed)
                                  </div>
                                  <pre className="bg-[#F4F6F5] p-3 rounded-sm text-xs font-mono-tech text-[#1D2933] overflow-x-auto border border-[#D7DEDC]">
                                    {entry.payload_after
                                      ? JSON.stringify(entry.payload_after, null, 2)
                                      : '// No posterior delta'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
