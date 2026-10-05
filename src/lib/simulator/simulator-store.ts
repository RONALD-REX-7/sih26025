'use client';

import { create } from 'zustand';
import { SimulatorEngine, SimulationState } from './simulator-engine';
import { SimulationScenarioId } from './scenario-definitions';
import { NormalizedTelemetrySample, NodeHealthSample } from '@/lib/telemetry/types';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { SimulatedTelemetrySource } from '@/lib/telemetry/simulated-source';
import { RiskState } from '@/lib/domain/risk-states';
import { RiskEngine } from '@/lib/ai/risk-engine';
import { RiskEvidence, AnomalyRecord } from '@/lib/ai/types';
import { InterNodeMovement } from '@/lib/domain/types';

interface HistoryPoint {
  timestamp: string;
  timeSec: number;
  value: number;
}

export type TimelinePhase = 'T+00' | 'T+15' | 'T+30' | 'T+45' | 'T+60';

export interface SimulatorStore {
  engine: SimulatorEngine | null;
  simulatedSource: SimulatedTelemetrySource | null;
  state: SimulationState;
  latestReadings: Record<string, NormalizedTelemetrySample>;
  historyByChannel: Record<string, HistoryPoint[]>; // Rolling 60s history
  latestHealths: Record<string, NodeHealthSample>;
  interNodeMovements: InterNodeMovement[];
  timelinePhase: TimelinePhase;
  showEvidenceDossier: boolean;
  currentRiskState: RiskState;
  currentEvidence: RiskEvidence | null;
  activeAnomalies: AnomalyRecord[];

  // Actions
  initEngine: (seed?: number, scenario?: SimulationScenarioId) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setScenario: (scenario: SimulationScenarioId) => void;
  setSeed: (seed: number) => void;
  setAffectedNodes: (nodes: string[]) => void;
  setShowEvidenceDossier: (open: boolean) => void;
}

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  engine: null,
  simulatedSource: null,
  state: {
    scenarioId: 'NORMAL_BASELINE',
    seed: 1025,
    speed: 1,
    status: 'idle',
    elapsedSec: 0,
    affectedNodeCodes: [],
    currentRiskState: 'Normal',
    activeEventsCount: 0,
  },
  latestReadings: {},
  historyByChannel: {
    TILT_X: [],
    TILT_Y: [],
    DISP_Z: [],
    VIB_RMS: [],
    STRAIN: [],
    CRACK: [],
  },
  latestHealths: {},
  interNodeMovements: [],
  timelinePhase: 'T+00',
  showEvidenceDossier: false,
  currentRiskState: 'Normal',
  currentEvidence: null,
  activeAnomalies: [],

  initEngine: (seed = 1025, scenario = 'NORMAL_BASELINE') => {
    // Prevent duplicate instantiation
    if (get().engine) return;

    const engine = new SimulatorEngine(seed, scenario);
    const simulatedSource = new SimulatedTelemetrySource();
    simulatedSource.start();

    // Register with central TelemetryEngine
    const telemetryEngine = TelemetryEngine.getInstance();
    telemetryEngine.setSource(simulatedSource);

    // Bind AI Risk Engine
    const riskEngine = RiskEngine.getInstance();
    riskEngine.subscribeToRiskAssessments((assessment) => {
      set({
        currentRiskState: assessment.riskState,
        currentEvidence: assessment.evidence,
      });
    });

    riskEngine.subscribeToAnomalies(() => {
      set({
        activeAnomalies: riskEngine.getActiveAnomalies(),
      });
    });

    // Subscribe to engine ticks
    engine.subscribe((samples, healths, simState, interNodeMovements) => {
      // Dispatch to telemetry source for ingestion pipeline
      for (const sample of samples) {
        simulatedSource.emitSample(sample);
      }

      const readingsUpdate: Record<string, NormalizedTelemetrySample> = { ...get().latestReadings };
      const healthsUpdate: Record<string, NodeHealthSample> = { ...get().latestHealths };
      const historyUpdate: Record<string, HistoryPoint[]> = { ...get().historyByChannel };

      for (const h of healths) {
        healthsUpdate[h.nodeCode] = h;
      }

      for (const s of samples) {
        readingsUpdate[s.sensorCode] = s;

        // Also track primary channel aggregate (e.g. SN-102 primary affected node or SN-101)
        const parts = s.sensorCode.split('-');
        const channelType = parts[parts.length - 1]; // e.g. DISP_Z, CRACK

        const isPrimaryTracked =
          s.nodeId === 'SN-102' ||
          (simState.affectedNodeCodes.length > 0 && s.nodeId === simState.affectedNodeCodes[0]);

        if (isPrimaryTracked && historyUpdate[channelType]) {
          const currentList = historyUpdate[channelType] || [];
          const nextList = [
            ...currentList,
            { timestamp: s.timestamp, timeSec: simState.elapsedSec, value: s.value },
          ];
          // Keep at most 60 points
          historyUpdate[channelType] = nextList.slice(-60);
        }
      }

      // Calculate demonstration timeline phase
      let phase: TimelinePhase = 'T+00';
      if (simState.elapsedSec >= 60) phase = 'T+60';
      else if (simState.elapsedSec >= 45) phase = 'T+45';
      else if (simState.elapsedSec >= 30) phase = 'T+30';
      else if (simState.elapsedSec >= 15) phase = 'T+15';

      // Auto-trigger evidence dossier at T+60 in ESCALATING_MULTIMODAL_ANOMALY
      const isCriticalRamp = simState.scenarioId === 'ESCALATING_MULTIMODAL_ANOMALY';
      const shouldTriggerDossier = isCriticalRamp && simState.elapsedSec >= 60 && !get().showEvidenceDossier;

      set({
        state: simState,
        latestReadings: readingsUpdate,
        historyByChannel: historyUpdate,
        latestHealths: healthsUpdate,
        interNodeMovements: interNodeMovements || get().interNodeMovements,
        timelinePhase: phase,
        showEvidenceDossier: shouldTriggerDossier ? true : get().showEvidenceDossier,
        activeAnomalies: riskEngine.getActiveAnomalies(),
      });
    });

    // Run initial baseline tick so UI is primed
    const initialTick = engine.generateTick();

    set({
      engine,
      simulatedSource,
      state: engine.getState(),
      interNodeMovements: initialTick.interNodeMovements,
      currentRiskState: riskEngine.getCurrentRiskState(),
      currentEvidence: riskEngine.getCurrentEvidence(),
    });
  },

  start: () => {
    const { engine } = get();
    if (engine) engine.start();
  },

  pause: () => {
    const { engine } = get();
    if (engine) engine.pause();
  },

  resume: () => {
    const { engine } = get();
    if (engine) engine.resume();
  },

  reset: () => {
    const { engine } = get();
    if (engine) {
      engine.reset();
      RiskEngine.getInstance().reset();
      const riskEngine = RiskEngine.getInstance();
      // Clear history on reset
      set({
        historyByChannel: {
          TILT_X: [],
          TILT_Y: [],
          DISP_Z: [],
          VIB_RMS: [],
          STRAIN: [],
          CRACK: [],
        },
        timelinePhase: 'T+00',
        showEvidenceDossier: false,
        currentRiskState: 'Normal',
        currentEvidence: riskEngine.getCurrentEvidence(),
        activeAnomalies: [],
      });
    }
  },

  setSpeed: (speed: number) => {
    const { engine } = get();
    if (engine) {
      engine.setSpeed(speed);
      set({ state: engine.getState() });
    }
  },

  setScenario: (scenario: SimulationScenarioId) => {
    const { engine } = get();
    if (engine) {
      engine.setScenario(scenario);
      RiskEngine.getInstance().reset();
      const riskEngine = RiskEngine.getInstance();
      set({
        state: engine.getState(),
        historyByChannel: {
          TILT_X: [],
          TILT_Y: [],
          DISP_Z: [],
          VIB_RMS: [],
          STRAIN: [],
          CRACK: [],
        },
        timelinePhase: 'T+00',
        showEvidenceDossier: false,
        currentRiskState: 'Normal',
        currentEvidence: riskEngine.getCurrentEvidence(),
        activeAnomalies: [],
      });
    }
  },

  setSeed: (seed: number) => {
    const { engine } = get();
    if (engine) {
      engine.setSeed(seed);
      RiskEngine.getInstance().reset();
      const riskEngine = RiskEngine.getInstance();
      set({
        state: engine.getState(),
        historyByChannel: {
          TILT_X: [],
          TILT_Y: [],
          DISP_Z: [],
          VIB_RMS: [],
          STRAIN: [],
          CRACK: [],
        },
        timelinePhase: 'T+00',
        showEvidenceDossier: false,
        currentRiskState: 'Normal',
        currentEvidence: riskEngine.getCurrentEvidence(),
        activeAnomalies: [],
      });
    }
  },

  setAffectedNodes: (nodes: string[]) => {
    const { engine } = get();
    if (engine) {
      engine.setAffectedNodes(nodes);
      set({ state: engine.getState() });
    }
  },

  setShowEvidenceDossier: (open: boolean) => {
    set({ showEvidenceDossier: open });
  },
}));

