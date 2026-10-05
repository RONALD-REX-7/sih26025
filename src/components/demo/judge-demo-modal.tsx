'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import { useOfflineStore } from '@/lib/offline/offline-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  WifiOff,
  FileText,
  Activity,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface JudgeDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: 'Nominal Baseline Verification',
    description: 'Verify all 16 surface telemetry nodes reporting healthy heartbeats, stable tilt (< 15 arcsec), and negligible crack aperture (< 0.5 mm).',
    actionText: '1. Start 60s Escalating Instability',
    route: '/simulator',
  },
  {
    step: 2,
    title: 'Incipient Flexure & Crack Dilation (T+15s - T+30s)',
    description: 'Biaxial tilt divergent slope detected. Surface fissure aperture extensometer begins progressive dilation (0.25mm -> 3.8mm).',
    actionText: '2. Inspect Station Telemetry & Cracks',
    route: '/telemetry',
  },
  {
    step: 3,
    title: 'Explainable AI Risk Forecast (T+30s - T+45s)',
    description: 'Explainable AI engine detects multi-modal concordance (Disp + Tilt + Crack). Projects accelerating trend line toward Warning state within demonstration horizon.',
    actionText: '3. View AI Risk Engine & Forecast',
    route: '/analytics',
  },
  {
    step: 4,
    title: 'GIS Subsidence Basin & Inter-Node Movement (T+45s)',
    description: 'Underground GIS maps active goaf caving margin. Inter-node chords (SN-101 <-> SN-102) display tensile shear dilation with directional deformation vectors.',
    actionText: '4. Inspect Underground GIS Map',
    route: '/gis',
  },
  {
    step: 5,
    title: 'Critical Evacuation Breach & Automated Siren (T+60s)',
    description: 'Displacement crosses 48mm critical collapse threshold; crack fissure exceeds 12mm. Siren alarm activates, dispatching statutory Incident Dossier under CMR 2017 Reg 112.',
    actionText: '5. Open Incident Evidence Dossier',
    route: '/alerts',
  },
  {
    step: 6,
    title: 'Local-First Offline Resilience',
    description: 'Simulate subterranean or remote network dropout. Telemetry continues buffering in IndexedDB. Operator acknowledgements queue locally and sync idempotently on reconnection.',
    actionText: '6. Test Network Loss Simulation',
    route: '/nodes',
  },
];

export function JudgeDemoModal({ open, onOpenChange }: JudgeDemoModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { setScenario, start, reset, state: simState } = useSimulatorStore();
  const { toggleSimulatedNetworkLoss, isSimulatedOffline } = useOfflineStore();

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleStartEscalation = () => {
    setScenario('ESCALATING_MULTIMODAL_ANOMALY');
    start();
    setCurrentStepIndex(1);
  };

  const handleResetDemo = () => {
    reset();
    if (isSimulatedOffline) {
      toggleSimulatedNetworkLoss();
    }
    setCurrentStepIndex(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#FFFFFF] border-[#D7DEDC] text-[#1D2933] p-6 shadow-xl">
        <DialogHeader className="border-b border-[#D7DEDC] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-sm bg-[#173B57] text-[#FFFFFF]">
                <Sparkles className="h-4 w-4" />
              </span>
              <DialogTitle className="text-base font-bold text-[#173B57] tracking-tight">
                SIH26025 Judge Demonstration Walkthrough
              </DialogTitle>
            </div>
            <span className="font-mono-tech text-xs font-semibold px-2 py-0.5 rounded-sm bg-[#EDF1F0] text-[#52606D] border border-[#D7DEDC]">
              60s GUIDED EVALUATION
            </span>
          </div>
          <DialogDescription className="text-xs text-[#52606D] mt-1">
            Standardized evaluation path validating end-to-end subsidence monitoring: Sensor Telemetry &rarr; AI Forecast &rarr; GIS &rarr; Incident Alert &rarr; Offline Local-First.
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-6 gap-1.5 my-3">
          {DEMO_STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-xs transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-[#2F6B4F]'
                    : isCurrent
                    ? 'bg-[#173B57]'
                    : 'bg-[#D7DEDC]'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              />
            );
          })}
        </div>

        {/* Active Step Details */}
        <div className="p-4 rounded-sm border border-[#D7DEDC] bg-[#F8FAF9] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono-tech text-xs font-bold text-[#173B57]">
              STAGE {currentStep.step} OF 6 &bull; {currentStep.title.toUpperCase()}
            </span>
            <span className="text-[11px] font-mono-tech text-[#52606D]">
              ELAPSED: {simState.elapsedSec}s
            </span>
          </div>

          <p className="text-xs text-[#1D2933] leading-relaxed">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#D7DEDC] mt-1">
            <div className="flex items-center gap-2">
              {currentStep.step === 1 ? (
                <Button
                  size="sm"
                  onClick={handleStartEscalation}
                  className="h-8 text-xs bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-medium"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  Trigger 60s Escalation
                </Button>
              ) : (
                <Link href={currentStep.route} onClick={() => onOpenChange(false)}>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] font-medium"
                  >
                    <Activity className="h-3.5 w-3.5 mr-1.5" />
                    {currentStep.actionText}
                  </Button>
                </Link>
              )}

              {currentStep.step === 6 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSimulatedNetworkLoss}
                  className={`h-8 text-xs border ${
                    isSimulatedOffline
                      ? 'border-[#B42318] bg-[#FBEBE9] text-[#91180E]'
                      : 'border-[#173B57] text-[#173B57]'
                  }`}
                >
                  <WifiOff className="h-3.5 w-3.5 mr-1.5" />
                  {isSimulatedOffline ? 'Restore Connectivity' : 'Simulate Network Loss'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetDemo}
                className="h-8 text-xs text-[#52606D] hover:bg-[#EDF1F0]"
                title="Reset simulation to initial baseline"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={currentStepIndex >= DEMO_STEPS.length - 1}
                onClick={() => setCurrentStepIndex((idx) => Math.min(idx + 1, DEMO_STEPS.length - 1))}
                className="h-8 text-xs border-[#D7DEDC] text-[#1D2933] hover:bg-[#EDF1F0]"
              >
                Next Stage
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Guarantee Footer */}
        <div className="mt-3 text-[11px] text-[#52606D] flex items-center justify-between border-t border-[#D7DEDC] pt-2">
          <span>
            Demonstration Mode &bull; All sensor values labeled <strong>SIMULATED</strong> / <strong>DEMO SYNTHETIC</strong>
          </span>
          <span className="font-mono-tech text-[10px] text-[#74808A]">
            SIH26025 DEFENSE SUITE
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
