'use client';

import React, { useState } from 'react';
import { Alert, UserRole } from '@/lib/domain/types';
import { EscalationPayload } from '@/lib/alerts/alert-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame, X, Send } from 'lucide-react';

interface EscalateModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: EscalationPayload) => void;
}

export function EscalateModal({ alert, isOpen, onClose, onConfirm }: EscalateModalProps) {
  const [reason, setReason] = useState('Persistent multi-station convergence exceeding safe extraction threshold');
  const [escalatedTo, setEscalatedTo] = useState('DGMS Regional Inspectorate & Colliery General Manager');
  const [authorizedBy, setAuthorizedBy] = useState('A. K. Sengupta (General Manager)');
  const [userRole, setUserRole] = useState<UserRole>('MineManager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !alert) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onConfirm({
        reason,
        escalatedTo,
        authorizedBy,
        userRole,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg border-rose-300 dark:border-rose-900/60 bg-white dark:bg-slate-950 shadow-2xl">
        <CardHeader className="p-4 pb-3 border-b border-rose-100 dark:border-rose-950 flex flex-row items-center justify-between bg-rose-50/40 dark:bg-rose-950/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
              <CardTitle className="text-sm font-bold tracking-tight text-rose-900 dark:text-rose-200">
                Official Geotechnical Incident Escalation
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-mono text-slate-500">
              Escalate response level to DGMS regulatory &amp; corporate executive command
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Target Alert:
              </label>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</span>
                <p className="text-slate-500 text-[10px] mt-0.5">ID: {alert.id} &bull; Panel: {alert.panel?.code || 'General'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Escalation Justification &amp; Geological Findings:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={2}
                className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Escalation Recipient Hierarchy:
              </label>
              <Input
                value={escalatedTo}
                onChange={(e) => setEscalatedTo(e.target.value)}
                required
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Authorizing Official:
                </label>
                <Input
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Signatory Role:
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full h-8 px-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="MineManager">Mine Manager</option>
                  <option value="SafetyOfficer">Safety Officer</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Engineer">Engineer</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-900">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-mono">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs font-mono bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Dispatch Regulatory Escalation
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
