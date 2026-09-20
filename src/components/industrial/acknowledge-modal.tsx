'use client';

import React, { useState } from 'react';
import { Alert, UserRole } from '@/lib/domain/types';
import { AcknowledgementPayload } from '@/lib/alerts/alert-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface AcknowledgeModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: AcknowledgementPayload) => Promise<void>;
}

const ACTION_OPTIONS = [
  'Immediate underground evacuation ordered per DGMS CMR 2017 Reg 112',
  'Barricaded hazardous district and suspended coal extraction operations',
  'Dispatched geotechnical rapid inspection squad to verify convergence markers',
  'Continuous optical & borehole extensometer telemetry surveillance intensified',
  'Routine shift handover verification and strata stability sign-off',
];

export function AcknowledgeModal({ alert, isOpen, onClose, onConfirm }: AcknowledgeModalProps) {
  const [operatorName, setOperatorName] = useState('Rajesh Kumar');
  const [userRole, setUserRole] = useState<UserRole>('SafetyOfficer');
  const [actionTaken, setActionTaken] = useState(ACTION_OPTIONS[0]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statutoryConfirmed, setStatutoryConfirmed] = useState(true);

  if (!isOpen || !alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statutoryConfirmed) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        operatorName,
        userRole,
        actionTaken,
        comment: comment.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-900 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-bold tracking-tight">
                Statutory Incident Sign-Off &amp; Acknowledge
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-mono text-slate-500">
              DGMS CMR 2017 Reg 112 Mandatory Geotechnical Protocol
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 space-y-4 text-xs font-mono">
            {/* Target Alert Summary Block */}
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{alert.title}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {alert.risk_state}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {alert.message}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                <span>Alert ID: {alert.id}</span>
                <span>Panel: {alert.panel?.code || alert.panel_id || 'General'}</span>
              </div>
            </div>

            {/* Operator Credentials Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Authorized Signatory Name:
                </label>
                <Input
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Regulatory Role:
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full h-8 px-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="SafetyOfficer">Safety Officer</option>
                  <option value="MineManager">Mine Manager</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            {/* Statutory Action Taken */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Mandatory Mitigation Action Taken:
              </label>
              <div className="space-y-1.5">
                {ACTION_OPTIONS.map((action, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors text-[11px] ${
                      actionTaken === action
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="actionTaken"
                      checked={actionTaken === action}
                      onChange={() => setActionTaken(action)}
                      className="mt-0.5"
                    />
                    <span>{action}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Geotechnical Shift Notes &amp; Verification Observations:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter physical observations, convergence rate findings, or DGMS communication refs..."
                rows={2}
                className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
            </div>

            {/* Statutory Compliance Checkbox */}
            <label className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-900 text-[10.5px] text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={statutoryConfirmed}
                onChange={(e) => setStatutoryConfirmed(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                I certify under Coal Mines Regulations 2017 that appropriate safety measures are in effect.
              </span>
            </label>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-900">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-mono">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !statutoryConfirmed}
                className="h-8 text-xs font-mono bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
              >
                {isSubmitting ? (
                  'Recording Audit...'
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                    Commit Sign-Off &amp; Acknowledge
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
