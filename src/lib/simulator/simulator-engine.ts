/**
 * SIH26025 Deterministic Simulation Engine Core
 * 
 * Generates continuous, physics-informed, seed-reproducible telemetry samples
 * for all 16 ESP32 nodes and 80 channels across Panels P-101 to P-104.
 */

import { Mulberry32 } from './prng';
import { SimulationScenarioId, SCENARIO_DEFINITIONS } from './scenario-definitions';
import { NormalizedTelemetrySample, NodeHealthSample } from '@/lib/telemetry/types';
import { RiskState } from '@/lib/domain/risk-states';
import { DEMO_NODES } from '@/lib/data/mock-data';

export interface SimulationState {
  scenarioId: SimulationScenarioId;
  seed: number;
  speed: number; // 1, 2, 5, 10, 30
  status: 'idle' | 'running' | 'paused' | 'completed' | 'reset';
  elapsedSec: number;
  affectedNodeCodes: string[];
  currentRiskState: RiskState;
  activeEventsCount: number;
}

export type SimulationTickListener = (
  samples: NormalizedTelemetrySample[],
  healths: NodeHealthSample[],
  state: SimulationState
) => void;

export class SimulatorEngine {
  private prng: Mulberry32;
  private state: SimulationState;
  private tickInterval: NodeJS.Timeout | null = null;
  private listeners: Set<SimulationTickListener> = new Set();

  // Baseline values per channel
  private readonly BASELINE_VALUES: Record<string, { value: number; stdDev: number; unit: string }> = {
    TILT_X: { value: 12.4, stdDev: 0.35, unit: 'arcsec' },
    TILT_Y: { value: -8.2, stdDev: 0.30, unit: 'arcsec' },
    DISP_Z: { value: 18.5, stdDev: 0.15, unit: 'mm' },
    VIB_RMS: { value: 1.2, stdDev: 0.20, unit: 'mm/s' },
    STRAIN: { value: 420.0, stdDev: 5.0, unit: 'microstrain' },
  };

  constructor(initialSeed = 1025, initialScenario: SimulationScenarioId = 'NORMAL_BASELINE') {
    this.prng = new Mulberry32(initialSeed);
    const def = SCENARIO_DEFINITIONS[initialScenario];
    this.state = {
      scenarioId: initialScenario,
      seed: initialSeed,
      speed: 1,
      status: 'idle',
      elapsedSec: 0,
      affectedNodeCodes: [...def.affectedNodeCodes],
      currentRiskState: 'Normal',
      activeEventsCount: 0,
    };
  }

  public getState(): SimulationState {
    return { ...this.state, affectedNodeCodes: [...this.state.affectedNodeCodes] };
  }

  public subscribe(listener: SimulationTickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setScenario(scenarioId: SimulationScenarioId): void {
    const def = SCENARIO_DEFINITIONS[scenarioId];
    this.state.scenarioId = scenarioId;
    this.state.affectedNodeCodes = [...def.affectedNodeCodes];
    this.reset();
  }

  public setSeed(seed: number): void {
    this.state.seed = Math.floor(seed);
    this.reset();
  }

  public setSpeed(speed: number): void {
    this.state.speed = speed;
    if (this.state.status === 'running') {
      this.restartInterval();
    }
  }

  public setAffectedNodes(nodes: string[]): void {
    this.state.affectedNodeCodes = [...nodes];
  }

  public start(): void {
    if (this.state.status === 'running') return;
    this.state.status = 'running';
    this.restartInterval();
  }

  public pause(): void {
    this.state.status = 'paused';
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  public resume(): void {
    if (this.state.status === 'paused') {
      this.start();
    }
  }

  public reset(): void {
    this.pause();
    this.state.status = 'reset';
    this.state.elapsedSec = 0;
    this.state.currentRiskState = 'Normal';
    this.state.activeEventsCount = 0;
    // Reseed PRNG for exact mathematical determinism
    this.prng.reseed(this.state.seed);

    // Emit baseline reset tick
    this.generateTick();
    this.state.status = 'idle';
  }

  private restartInterval(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
    // Base 1000ms divided by speed multiplier (e.g. 5x speed = 200ms tick)
    const intervalMs = Math.max(Math.floor(1000 / this.state.speed), 33);
    this.tickInterval = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  private tick(): void {
    if (this.state.status !== 'running') return;
    this.state.elapsedSec += 1;
    this.generateTick();

    const def = SCENARIO_DEFINITIONS[this.state.scenarioId];
    if (this.state.elapsedSec >= def.durationSeconds) {
      this.state.status = 'completed';
      if (this.tickInterval) {
        clearInterval(this.tickInterval);
        this.tickInterval = null;
      }
    }
  }

  /**
   * Generates a single deterministic tick of data across all 16 nodes and channels
   */
  public generateTick(): { samples: NormalizedTelemetrySample[]; healths: NodeHealthSample[] } {
    const timestamp = new Date(Date.now() + this.state.elapsedSec * 1000).toISOString();
    const t = this.state.elapsedSec;
    const samples: NormalizedTelemetrySample[] = [];
    const healths: NodeHealthSample[] = [];

    // Track highest detected risk state in this tick
    let highestRisk: RiskState = 'Normal';

    for (const node of DEMO_NODES) {
      const isAffected = this.state.affectedNodeCodes.includes(node.node_code);

      // Node Health computation
      let packetLoss = 0.2 + this.prng.next() * 0.5;
      let rssiDbm = -85 + Math.floor(this.prng.next() * 8);
      let nodeStatus: 'online' | 'offline' | 'degraded' = 'online';

      if (this.state.scenarioId === 'COMMUNICATION_FAILURE' && isAffected && t >= 15) {
        packetLoss = 100.0;
        rssiDbm = -128;
        nodeStatus = 'offline';
        if (highestRisk === 'Normal') highestRisk = 'Advisory';
      }

      healths.push({
        nodeId: node.id,
        nodeCode: node.node_code,
        timestamp,
        batteryPct: Math.max(node.battery_level - (t * 0.001), 20),
        signalRssiDbm: rssiDbm,
        packetLossPct: packetLoss,
        driftDetected: this.state.scenarioId === 'SENSOR_DRIFT' && isAffected,
        status: nodeStatus,
        provenance: 'SIMULATED',
      });

      // Transducer Channels
      const channels = ['TILT_X', 'TILT_Y', 'DISP_Z', 'VIB_RMS', 'STRAIN'];

      for (const ch of channels) {
        const base = this.BASELINE_VALUES[ch];
        let val = base.value + this.prng.nextGaussian(0, base.stdDev);
        let qualityScore = 0.98;

        // Apply Scenario Physics
        if (isAffected) {
          switch (this.state.scenarioId) {
            case 'MACHINERY_TRANSIENT': {
              if (ch === 'VIB_RMS' && t >= 15 && t <= 45) {
                // High frequency transient envelope decaying exponentially
                const dt = t - 15;
                const envelope = 6.2 * Math.exp(-dt / 6.0);
                val += envelope * Math.abs(Math.sin(dt * 2.5));
              }
              break;
            }

            case 'SENSOR_DRIFT': {
              if (ch === 'TILT_X') {
                // Linear bias accumulation
                val += (t * 0.08); // drifts up to ~10 arcsec
                qualityScore = 0.72;
              }
              break;
            }

            case 'GRADUAL_DEFORMATION': {
              // Sigmoidal roof flexure
              const flex = 22.0 / (1.0 + Math.exp(-0.06 * (t - 60)));
              if (ch === 'DISP_Z') val += flex;
              if (ch === 'TILT_X') val += flex * 3.8;
              if (ch === 'STRAIN') val += flex * 25.0;
              break;
            }

            case 'CRACK_PROGRESS': {
              // Stepped displacement jump at t=35s
              if (t >= 35) {
                if (ch === 'DISP_Z') val += 5.4;
                if (ch === 'STRAIN') val += 185.0;
              }
              if (t >= 35 && t <= 40 && ch === 'VIB_RMS') {
                val += 4.8; // Acoustic burst
              }
              break;
            }

            case 'MULTI_NODE_CORRELATED_DEFORMATION': {
              // Spatial trough: SN-102 is epicenter, SN-101 and SN-103 attenuate
              const distWeight = node.node_code === 'SN-102' ? 1.0 : 0.75;
              const troughDisp = (t * 0.12) * distWeight;
              if (ch === 'DISP_Z') val += troughDisp;
              if (ch === 'TILT_X') val += troughDisp * 2.8;
              if (ch === 'STRAIN') val += troughDisp * 18.0;
              break;
            }

            case 'ESCALATING_MULTIMODAL_ANOMALY': {
              if (t >= 30) {
                const stage = Math.min((t - 30) / 120, 1.0);
                if (ch === 'TILT_X') val += stage * 65.0; // slope elevation
                if (ch === 'DISP_Z') val += stage * 36.0; // crosses 50mm
                if (ch === 'VIB_RMS') val += stage * 5.2;
                if (ch === 'STRAIN') val += stage * 450.0;
              }
              break;
            }

            case 'RECOVERY': {
              // Post-support stowing stabilization decay
              const decay = Math.exp(-t / 25.0);
              if (ch === 'DISP_Z') val = base.value + 8.0 * decay;
              if (ch === 'VIB_RMS') val = Math.max(base.value * decay, 0.8);
              break;
            }
          }
        }

        // Evaluate Risk State dynamically based on DGMS thresholds
        if (ch === 'DISP_Z') {
          if (val > 48.0) highestRisk = 'Critical';
          else if (val > 32.0 && highestRisk !== 'Critical') highestRisk = 'Warning';
          else if (val > 24.0 && highestRisk !== 'Critical' && highestRisk !== 'Warning') highestRisk = 'Watch';
          else if (val > 20.0 && highestRisk === 'Normal') highestRisk = 'Advisory';
        }

        if (ch === 'TILT_X' && Math.abs(val) > 120.0 && highestRisk !== 'Critical') {
          highestRisk = 'Warning';
        }

        samples.push({
          nodeId: node.node_code,
          sensorCode: `${node.node_code}-${ch}`,
          sensorType: ch === 'TILT_X' ? 'tilt_x' : ch === 'TILT_Y' ? 'tilt_y' : ch === 'DISP_Z' ? 'displacement' : ch === 'VIB_RMS' ? 'vibration' : 'strain',
          timestamp,
          value: parseFloat(val.toFixed(2)),
          rawAdc: Math.floor(Math.min(Math.max((val + 50) * 30, 0), 4095)),
          unit: base.unit,
          qualityScore,
          batteryPct: Math.round(node.battery_level),
          signalRssiDbm: rssiDbm,
          provenance: 'SIMULATED',
        });
      }
    }

    this.state.currentRiskState = highestRisk;

    // Broadcast tick to all engine listeners
    for (const listener of this.listeners) {
      try {
        listener(samples, healths, this.getState());
      } catch (err) {
        console.error('SimulatorEngine listener error:', err);
      }
    }

    return { samples, healths };
  }
}
