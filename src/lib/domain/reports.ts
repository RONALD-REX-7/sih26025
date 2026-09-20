/**
 * SIH26025 Statutory Reporting & Handover Domain Models
 */

import { RiskState } from './risk-states';
import { UserRole } from './constants';

export interface DGMSComplianceReport {
  id: string;
  reportNumber: string;
  circularReference: 'DGMS Circular (Coal) No. 04 of 2017' | 'CMR 2017 Regulation 111';
  collieryName: string;
  panelCode: string;
  generationDate: string;
  reportingPeriodDays: number;
  maxRecordedSlopeMmPerM: number;
  maxRecordedStrainMmPerM: number;
  peakPpVibrationMmPerS: number;
  maxCumulativeSubsidenceMm: number;
  safetyStatus: RiskState;
  authorizedSignatory: {
    name: string;
    role: UserRole;
    designation: string;
  };
  auditFingerprint: string;
}

export interface ShiftHandoverReport {
  id: string;
  shiftName: 'Shift-A (Morning)' | 'Shift-B (Evening)' | 'Shift-C (Night)';
  shiftDate: string;
  outgoingOfficer: string;
  incomingOfficer: string;
  activeRiskState: RiskState;
  activeAlertCount: number;
  operationalNotes: string;
  acknowledgedAt: string;
}
