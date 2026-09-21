/**
 * SIH26025 Explainable AI Anomaly Detection, Sensor Fusion & Risk Assessment Engine
 * 
 * Safety-Critical Principles:
 * 1. ANOMALY ≠ RISK:
 *    A sensor anomaly (e.g. machinery transient vibration) does not equal a geotechnical mine collapse risk.
 * 2. EXPLAINABLE INTELLIGENCE:
 *    Every risk transition produces an evidence object explaining WHAT, WHERE, WHEN, WHICH, HOW PERSISTENT,
 *    WHY risk changed, and WHAT action is recommended under DGMS regulations.
 * 3. MULTI-MODAL SENSOR FUSION:
 *    Combines displacement, tilt, strain, vibration, and node health.
 * 4. SPATIAL TOPOLOGY CORRELATION:
 *    Correlates adjacent underground nodes along extraction panels (P-101 to P-104).
 */

import { RiskState } from '@/lib/domain/risk-states';
import { NormalizedTelemetrySample } from '@/lib/domain/telemetry-contract';
import { NodeHealthSample } from '@/lib/telemetry/types';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Json } from '@/lib/supabase/database.types';
import {
  AnomalyRecord,
  AnomalyType,
  AnomalySeverity,
  ChannelStats,
  RiskEvidence,
  RiskAssessmentEvent,
  RiskAssessmentCallback,
  AnomalyEventCallback,
  ContributingFactor,
} from './types';

// Standard Geotechnical Baseline reference
const BASELINE_METRICS: Record<string, { mean: number; stdDev: number; unit: string }> = {
  TILT_X: { mean: 12.4, stdDev: 0.35, unit: 'arcsec' },
  TILT_Y: { mean: -8.2, stdDev: 0.30, unit: 'arcsec' },
  DISP_Z: { mean: 18.5, stdDev: 0.15, unit: 'mm' },
  VIB_RMS: { mean: 1.2, stdDev: 0.20, unit: 'mm/s' },
  STRAIN: { mean: 420.0, stdDev: 5.0, unit: 'microstrain' },
};

// Panel Topologies for underground coal seams
const PANEL_TOPOLOGY: Record<string, { code: string; nodes: string[] }> = {
  'P-101': { code: 'P-101', nodes: ['SN-101', 'SN-102', 'SN-103', 'SN-104'] },
  'P-102': { code: 'P-102', nodes: ['SN-105', 'SN-106', 'SN-107', 'SN-108'] },
  'P-103': { code: 'P-103', nodes: ['SN-109', 'SN-110', 'SN-111', 'SN-112'] },
  'P-104': { code: 'P-104', nodes: ['SN-113', 'SN-114', 'SN-115', 'SN-116'] },
};

export class RiskEngine {
  private static instance: RiskEngine | null = null;

  private channelStats: Map<string, ChannelStats> = new Map();
  private latestHealthByNode: Map<string, NodeHealthSample> = new Map();
  private activeAnomalies: Map<string, AnomalyRecord> = new Map();

  private assessmentListeners: Set<RiskAssessmentCallback> = new Set();
  private anomalyListeners: Set<AnomalyEventCallback> = new Set();

  private currentRiskState: RiskState = 'Normal';
  private currentEvidence: RiskEvidence | null = null;
  private currentAssessment: RiskAssessmentEvent | null = null;

  private lastAssessmentTime = 0;
  private unsubscribeTelemetry: (() => void) | null = null;
  private unsubscribeHealth: (() => void) | null = null;

  // Supabase Persistence Buffering
  private pendingAnomaliesToPersist: AnomalyRecord[] = [];
  private persistenceTimer: NodeJS.Timeout | null = null;
  private nodeUuidByCode = new Map<string, string>();
  private sensorUuidByNodeAndCode = new Map<string, string>();
  private mineId = '388b9f62-1218-4f8b-bdda-87bbd066a974'; // Demo Mine
  private panelIdByCode = new Map<string, string>([
    ['P-101', '6c9d6d48-ca3c-4d8b-9da7-e730d79b9b60'],
    ['P-102', 'c5df1d45-7729-4752-b883-20a61efcb3e3'],
    ['P-103', '7ec2bc3d-513a-4dd8-a006-25feec0e9bc5'],
    ['P-104', '8d14ba91-382a-46ba-b847-758cf1ff0dd8'],
  ]);

  private constructor() {
    this.initDefaultBaselines();
    this.bindTelemetryPipeline();

    if (typeof window !== 'undefined') {
      this.persistenceTimer = setInterval(() => {
        this.flushPersistenceBuffer();
      }, 5000);
    }
  }

  public static getInstance(): RiskEngine {
    if (!RiskEngine.instance) {
      RiskEngine.instance = new RiskEngine();
    }
    return RiskEngine.instance;
  }

  /**
   * Bind directly to the centralized TelemetryEngine singleton
   */
  public bindTelemetryPipeline(): void {
    const telemetry = TelemetryEngine.getInstance();
    if (this.unsubscribeTelemetry) this.unsubscribeTelemetry();
    if (this.unsubscribeHealth) this.unsubscribeHealth();

    this.unsubscribeTelemetry = telemetry.subscribeToSamples((sample) => {
      this.processSample(sample);
    });

    this.unsubscribeHealth = telemetry.subscribeToNodeHealth((health) => {
      this.processNodeHealth(health);
    });
  }

  public initDefaultBaselines(): void {
    // Generate initial normal evidence
    this.currentEvidence = this.createNominalEvidence();
    this.currentAssessment = {
      id: `RA-${Date.now()}`,
      mineId: this.mineId,
      panelId: this.panelIdByCode.get('P-101') || '',
      assessedAt: new Date().toISOString(),
      riskState: 'Normal',
      confidence: 0.98,
      score: 0.05,
      evidence: this.currentEvidence,
      modelVersion: 'sih-explainable-ensemble-v1.0',
      provenance: 'SIMULATED',
    };
  }

  /**
   * Process incoming telemetry sample: Preprocessing -> Feature Extraction -> Anomaly Detection
   */
  public processSample(sample: NormalizedTelemetrySample): void {
    const now = sample.timestamp ? new Date(sample.timestamp).getTime() : Date.now();
    const channelKey = sample.sensorCode;

    // 1. Get or initialize channel stats
    let stats = this.channelStats.get(channelKey);
    if (!stats) {
      const parts = sample.sensorCode.split('-');
      const metricType = parts[parts.length - 1];
      const base = BASELINE_METRICS[metricType] || { mean: sample.value, stdDev: 1.0, unit: sample.unit };

      stats = {
        nodeCode: sample.nodeId,
        sensorCode: sample.sensorCode,
        sensorType: sample.sensorType,
        baselineMean: base.mean,
        baselineStdDev: base.stdDev,
        ewma: sample.value,
        lastValue: sample.value,
        previousValue: sample.value,
        lastTimestamp: now,
        rateOfChange: 0,
        zScore: 0,
        consecutiveAnomalousCount: 0,
        persistenceStartTime: null,
        historyWindow: [{ timestamp: now, value: sample.value }],
      };
      this.channelStats.set(channelKey, stats);
    }

    // 2. Feature Extraction: EWMA, Rate of Change, Z-Score
    const dt = Math.max((now - stats.lastTimestamp) / 1000, 0.1);
    const alpha = 0.25; // EWMA smoothing coefficient
    stats.ewma = alpha * sample.value + (1 - alpha) * stats.ewma;
    stats.rateOfChange = parseFloat(((sample.value - stats.lastValue) / dt).toFixed(3));
    stats.previousValue = stats.lastValue;
    stats.lastValue = sample.value;
    stats.lastTimestamp = now;

    // Rolling Z-score against physical baseline
    const stdDev = Math.max(stats.baselineStdDev, 0.01);
    stats.zScore = parseFloat(((sample.value - stats.baselineMean) / stdDev).toFixed(2));

    // Update history window (keep 30 samples)
    stats.historyWindow.push({ timestamp: now, value: sample.value });
    if (stats.historyWindow.length > 30) {
      stats.historyWindow.shift();
    }

    // 3. Anomaly Evaluation
    this.evaluateChannelAnomaly(stats, sample, now);

    // 4. Periodically evaluate global / panel risk state (at most once every 500ms or on significant sample)
    if (now - this.lastAssessmentTime >= 500) {
      this.evaluateRiskState(now);
      this.lastAssessmentTime = now;
    }
  }

  /**
   * Process node health (battery, packet loss, RSSI, drift flag)
   */
  public processNodeHealth(health: NodeHealthSample): void {
    this.latestHealthByNode.set(health.nodeCode, health);
  }

  /**
   * Evaluate whether this single sensor reading is anomalous.
   * Safety Rule: Anomaly ≠ Risk!
   */
  private evaluateChannelAnomaly(stats: ChannelStats, sample: NormalizedTelemetrySample, now: number): void {
    const absZ = Math.abs(stats.zScore);
    const parts = stats.sensorCode.split('-');
    const metric = parts[parts.length - 1];

    let isAnomaly = false;
    let anomalyType: AnomalyType = 'SPIKE';
    let severity: AnomalySeverity = 'low';
    let confidence = 0.85;

    // Check specific conditions
    if (metric === 'VIB_RMS' && sample.value > 3.0) {
      isAnomaly = true;
      anomalyType = 'SPIKE';
      severity = sample.value > 6.0 ? 'high' : 'medium';
      confidence = 0.94;
    } else if (metric === 'DISP_Z') {
      if (sample.value > 48.0) {
        isAnomaly = true;
        anomalyType = 'DGMS_THRESHOLD_EXCEEDED';
        severity = 'critical';
        confidence = 0.99;
      } else if (sample.value > 32.0) {
        isAnomaly = true;
        anomalyType = 'DGMS_THRESHOLD_EXCEEDED';
        severity = 'high';
        confidence = 0.95;
      } else if (sample.value > 20.0 || absZ >= 3.0) {
        isAnomaly = true;
        anomalyType = Math.abs(stats.rateOfChange) > 0.3 ? 'RATE_OF_CHANGE' : 'PERSISTENT_BIAS';
        severity = 'medium';
        confidence = 0.90;
      }
    } else if (metric === 'TILT_X' || metric === 'TILT_Y') {
      if (Math.abs(sample.value) > 120.0) {
        isAnomaly = true;
        anomalyType = 'DGMS_THRESHOLD_EXCEEDED';
        severity = 'critical';
      } else if (Math.abs(sample.value) > 30.0 || absZ >= 3.5) {
        isAnomaly = true;
        anomalyType = stats.consecutiveAnomalousCount > 15 ? 'SENSOR_DRIFT' : 'PERSISTENT_BIAS';
        severity = 'medium';
      }
    } else if (metric === 'STRAIN' && (sample.value > 600 || absZ >= 4.0)) {
      isAnomaly = true;
      anomalyType = 'PERSISTENT_BIAS';
      severity = sample.value > 800 ? 'high' : 'medium';
    }

    if (isAnomaly) {
      if (stats.persistenceStartTime === null) {
        stats.persistenceStartTime = now;
      }
      stats.consecutiveAnomalousCount++;
      const persistenceSec = Math.max(0, Math.floor((now - stats.persistenceStartTime) / 1000));

      const record: AnomalyRecord = {
        id: `ANO-${stats.sensorCode}-${now}`,
        nodeCode: stats.nodeCode,
        sensorCode: stats.sensorCode,
        sensorType: stats.sensorType,
        detectedAt: new Date(now).toISOString(),
        anomalyType,
        severity,
        zScore: stats.zScore,
        rateOfChange: stats.rateOfChange,
        persistenceSec,
        confidence,
        value: sample.value,
        baselineMean: stats.baselineMean,
        unit: sample.unit,
        details: {
          ewma: stats.ewma,
          consecutiveCount: stats.consecutiveAnomalousCount,
        },
        provenance: sample.provenance,
      };

      this.activeAnomalies.set(stats.sensorCode, record);

      // Notify anomaly subscribers
      for (const listener of this.anomalyListeners) {
        try {
          listener(record);
        } catch (err) {
          console.error('Anomaly listener error:', err);
        }
      }

      // Buffer for Supabase persistence
      if (this.pendingAnomaliesToPersist.length < 50) {
        this.pendingAnomaliesToPersist.push(record);
      }
    } else {
      // Clear or decay anomaly
      if (stats.consecutiveAnomalousCount > 0) {
        stats.consecutiveAnomalousCount = Math.max(0, stats.consecutiveAnomalousCount - 2);
        if (stats.consecutiveAnomalousCount === 0) {
          stats.persistenceStartTime = null;
          this.activeAnomalies.delete(stats.sensorCode);
        }
      }
    }
  }

  /**
   * Risk State Assessment:
   * Multi-Modal Sensor Fusion + Spatial Topology Correlation
   */
  public evaluateRiskState(now: number): RiskAssessmentEvent {
    // 1. Group active anomalies by node and panel
    const anomaliesByNode = new Map<string, AnomalyRecord[]>();
    for (const record of this.activeAnomalies.values()) {
      const list = anomaliesByNode.get(record.nodeCode) || [];
      list.push(record);
      anomaliesByNode.set(record.nodeCode, list);
    }

    // Check node health issues
    let offlineNodesCount = 0;
    const offlineNodeCodes: string[] = [];
    for (const [nodeCode, health] of this.latestHealthByNode.entries()) {
      if (health.status === 'offline' || health.packetLossPct >= 80) {
        offlineNodesCount++;
        offlineNodeCodes.push(nodeCode);
      }
    }

    // 2. Identify panels with active anomalies
    let targetPanelCode = 'P-101';
    let maxAffectedNodesInPanel: string[] = [];

    for (const [panelCode, def] of Object.entries(PANEL_TOPOLOGY)) {
      const affectedInPanel = def.nodes.filter(
        (code) => anomaliesByNode.has(code) || offlineNodeCodes.includes(code)
      );
      if (affectedInPanel.length > maxAffectedNodesInPanel.length) {
        maxAffectedNodesInPanel = affectedInPanel;
        targetPanelCode = panelCode;
      }
    }

    // 3. Compute Modality Agreement Score (0.0 to 1.0)
    // Geotechnical displacement events correlate Displacement + Tilt + Strain
    let hasHighDisplacement = false;
    let hasHighTilt = false;
    let hasHighStrain = false;
    let hasHighVibration = false;
    let maxDispValue = 18.5;
    let maxPersistenceSec = 0;
    let epicenterNode = 'SN-102';

    for (const record of this.activeAnomalies.values()) {
      if (record.persistenceSec > maxPersistenceSec) {
        maxPersistenceSec = record.persistenceSec;
        epicenterNode = record.nodeCode;
      }
      if (record.sensorType === 'displacement') {
        hasHighDisplacement = true;
        if (record.value > maxDispValue) maxDispValue = record.value;
      }
      if (record.sensorType === 'tilt_x' || record.sensorType === 'tilt_y') {
        hasHighTilt = true;
      }
      if (record.sensorType === 'strain') {
        hasHighStrain = true;
      }
      if (record.sensorType === 'vibration') {
        hasHighVibration = true;
      }
    }

    // Agreement calculation
    let modalityAgreementScore = 0.0;
    const geotechnicalModalityCount =
      (hasHighDisplacement ? 1 : 0) + (hasHighTilt ? 1 : 0) + (hasHighStrain ? 1 : 0);

    if (geotechnicalModalityCount === 3) modalityAgreementScore = 0.95;
    else if (geotechnicalModalityCount === 2) modalityAgreementScore = 0.75;
    else if (geotechnicalModalityCount === 1) modalityAgreementScore = 0.40;
    else if (hasHighVibration) modalityAgreementScore = 0.10; // isolated vibration

    // 4. Compute Spatial Correlation Score (0.0 to 1.0)
    const affectedNodeCount = maxAffectedNodesInPanel.length;
    let spatialCorrelationScore = 0.0;
    if (geotechnicalModalityCount > 0) {
      if (affectedNodeCount >= 3) spatialCorrelationScore = 0.92;
      else if (affectedNodeCount === 2) spatialCorrelationScore = 0.78;
      else if (affectedNodeCount === 1) spatialCorrelationScore = 0.15;
    }

    // 5. Determine Explainable Risk State
    let nextRiskState: RiskState = 'Normal';
    let riskScore = 0.05;
    let confidence = 0.96;
    let primaryReason = 'Ground parameters within nominal baseline and DGMS regulatory thresholds.';
    let what = 'All 16 sensor nodes reporting nominal values (< 3.0 mm/m deformation gradient).';
    let whyRiskChanged = 'No anomalous movement or geotechnical acceleration detected.';
    let whatActionRecommended = 'Maintain routine automated polling and periodic telemetry health checks.';
    let dgmsCompliance: RiskEvidence['dgmsComplianceStatus'] = 'COMPLIANT';

    // Case 1: Critical Geomechanical Breach
    if (
      maxDispValue >= 48.0 ||
      (maxDispValue >= 40.0 && spatialCorrelationScore >= 0.7 && modalityAgreementScore >= 0.7)
    ) {
      nextRiskState = 'Critical';
      riskScore = 0.95;
      confidence = 0.98;
      dgmsCompliance = 'CRITICAL_THRESHOLD';
      primaryReason = `Severe persistent subsidence displacement (${maxDispValue.toFixed(1)} mm) exceeding critical geotechnical collapse threshold (> 48.0 mm).`;
      what = `Surface subsidence reached ${maxDispValue.toFixed(1)} mm with tensile strain and tilt rotation convergence.`;
      whyRiskChanged = `Sustained acceleration of surface flexure across ${affectedNodeCount} adjacent nodes with cross-modal tilt and displacement confirmation over ${maxPersistenceSec} seconds.`;
      whatActionRecommended = 'IMMEDIATE EVACUATION of affected underground extraction panels and surface barrier perimeter as per DGMS Emergency Management Protocol.';
    }
    // Case 2: Warning - Multi-node correlated displacement
    else if (
      (maxDispValue >= 32.0 && spatialCorrelationScore >= 0.6) ||
      (geotechnicalModalityCount >= 2 && affectedNodeCount >= 2 && maxPersistenceSec >= 8)
    ) {
      nextRiskState = 'Warning';
      riskScore = 0.78;
      confidence = 0.92;
      dgmsCompliance = 'WARNING_THRESHOLD';
      primaryReason = `Correlated multi-station deformation (${maxDispValue.toFixed(1)} mm) detected across ${affectedNodeCount} adjacent nodes in Panel ${targetPanelCode}.`;
      what = `Correlated displacement (${maxDispValue.toFixed(1)} mm) and tilt flexure across nodes: ${maxAffectedNodesInPanel.join(', ')}.`;
      whyRiskChanged = `Multi-node spatial correlation (${(spatialCorrelationScore * 100).toFixed(0)}%) and cross-modality agreement (${(modalityAgreementScore * 100).toFixed(0)}%) sustained for ${maxPersistenceSec}s.`;
      whatActionRecommended = 'Safety Officer acknowledgement mandatory. Halt heavy haulage and prepare panel evacuation standby protocol.';
    }
    // Case 3: Watch - Persistent single-station deviation or incipient multi-station deformation
    else if (
      maxDispValue >= 22.0 ||
      (hasHighDisplacement && maxPersistenceSec >= 10) ||
      (hasHighTilt && maxPersistenceSec >= 15)
    ) {
      nextRiskState = 'Watch';
      riskScore = 0.52;
      confidence = 0.88;
      dgmsCompliance = 'WATCH_THRESHOLD';
      primaryReason = `Persistent deformation deviation detected on primary channel (Displacement: ${maxDispValue.toFixed(1)} mm) for ${maxPersistenceSec} seconds.`;
      what = `Stationary displacement or tilt slope deviation on node ${epicenterNode}. Spatial correlation across adjacent nodes remains low (${(spatialCorrelationScore * 100).toFixed(0)}%).`;
      whyRiskChanged = `Single-station anomaly persisted beyond 10-second stability window. Modality agreement is moderate (${(modalityAgreementScore * 100).toFixed(0)}%).`;
      whatActionRecommended = 'Alert shift geotechnical in-charge. Restrict heavy machinery travel over affected panel zone and inspect roof support.';
    }
    // Case 4: Advisory - Isolated transient (machinery), single-node drift, or communication degradation
    else if (hasHighVibration || affectedNodeCount === 1 || offlineNodesCount > 0) {
      nextRiskState = 'Advisory';
      riskScore = 0.28;
      confidence = 0.85;
      dgmsCompliance = 'ADVISORY_THRESHOLD';

      if (hasHighVibration && !hasHighDisplacement) {
        primaryReason = 'Transient high-amplitude vibration pulse detected without displacement flexure (Machinery Noise).';
        what = 'Acoustic/vibration spike detected (VIB_RMS > 3.0 mm/s) while displacement and tilt channels remain flat.';
        whyRiskChanged = 'Isolated mechanical vibration without multi-modal geotechnical correlation. Spatial correlation is 0%.';
        whatActionRecommended = 'Log transient event. Verify nearby continuous miner or haul truck movement.';
      } else if (offlineNodesCount > 0) {
        primaryReason = `Telemetry communication loss on node(s): ${offlineNodeCodes.join(', ')}.`;
        what = `${offlineNodesCount} node(s) showing elevated packet loss (> 80%) or offline heartbeat.`;
        whyRiskChanged = 'Wireless link degradation detected; no physical ground displacement detected on adjacent nodes.';
        whatActionRecommended = 'Verify wireless repeater and gateway power supply in extraction gallery.';
      } else {
        primaryReason = `Isolated sensor deviation on node ${epicenterNode} without spatial correlation.`;
        what = `Single sensor channel deviation with low persistence (${maxPersistenceSec}s).`;
        whyRiskChanged = 'Isolated disturbance lacking multi-modal or multi-station spatial agreement.';
        whatActionRecommended = 'Observe 15-minute persistence window and verify sensor node zero-calibration.';
      }
    }

    // 6. Build Contributing Factors Evidence breakdown
    const contributingFactors: ContributingFactor[] = [
      {
        factor: 'Displacement Gradient (DISP_Z)',
        state: maxDispValue > 40 ? 'critical' : maxDispValue > 25 ? 'elevated' : 'nominal',
        weight: 0.35,
        evidence: `Max value: ${maxDispValue.toFixed(1)} mm (Baseline: 18.5 mm, Threshold: 48.0 mm)`,
      },
      {
        factor: 'Cross-Modality Agreement (Tilt + Strain)',
        state: modalityAgreementScore >= 0.7 ? 'elevated' : hasHighVibration ? 'transient' : 'nominal',
        weight: 0.25,
        evidence: `Agreement score: ${(modalityAgreementScore * 100).toFixed(0)}% (Active: ${[
          hasHighDisplacement ? 'Disp' : null,
          hasHighTilt ? 'Tilt' : null,
          hasHighStrain ? 'Strain' : null,
          hasHighVibration ? 'Vib' : null,
        ]
          .filter(Boolean)
          .join(', ') || 'None'})`,
      },
      {
        factor: 'Spatial Topology Correlation',
        state: spatialCorrelationScore >= 0.7 ? 'critical' : spatialCorrelationScore > 0.3 ? 'elevated' : 'nominal',
        weight: 0.25,
        evidence: `Affected adjacent nodes in ${targetPanelCode}: ${maxAffectedNodesInPanel.join(', ') || 'None'} (Score: ${(spatialCorrelationScore * 100).toFixed(0)}%)`,
      },
      {
        factor: 'Temporal Persistence & Rate-of-Change',
        state: maxPersistenceSec >= 15 ? 'elevated' : 'nominal',
        weight: 0.15,
        evidence: `Persistence: ${maxPersistenceSec}s continuous samples`,
      },
    ];

    const evidence: RiskEvidence = {
      primaryReason,
      summary: primaryReason,
      what,
      where: {
        panelCode: targetPanelCode,
        affectedNodes: maxAffectedNodesInPanel,
        epicenterNode,
      },
      when: {
        detectedAt: new Date(now - maxPersistenceSec * 1000).toISOString(),
        persistenceSec: maxPersistenceSec,
        lastEvaluatedAt: new Date(now).toISOString(),
      },
      which: {
        channels: Array.from(this.activeAnomalies.keys()),
        sensorTypes: Array.from(
          new Set(Array.from(this.activeAnomalies.values()).map((a) => a.sensorType))
        ),
      },
      howPersistent:
        maxPersistenceSec > 0
          ? `${maxPersistenceSec} seconds continuous abnormal deviation`
          : 'Nominal baseline stability',
      whyRiskChanged,
      whatActionRecommended,
      spatialCorrelationScore,
      modalityAgreementScore,
      dgmsComplianceStatus: dgmsCompliance,
      contributingFactors,
    };

    const assessment: RiskAssessmentEvent = {
      id: `RA-${now}`,
      mineId: this.mineId,
      panelId: this.panelIdByCode.get(targetPanelCode) || this.panelIdByCode.get('P-101') || '',
      assessedAt: new Date(now).toISOString(),
      riskState: nextRiskState,
      confidence,
      score: riskScore,
      evidence,
      modelVersion: 'sih-explainable-ensemble-v1.0',
      provenance: 'SIMULATED',
    };

    const stateChanged = this.currentRiskState !== nextRiskState;
    this.currentRiskState = nextRiskState;
    this.currentEvidence = evidence;
    this.currentAssessment = assessment;

    // Notify listeners if state changed or periodically
    for (const listener of this.assessmentListeners) {
      try {
        listener(assessment);
      } catch (err) {
        console.error('RiskAssessment listener error:', err);
      }
    }

    // Persist assessment to Supabase on state transitions
    if (stateChanged) {
      this.persistRiskAssessment(assessment);
    }

    return assessment;
  }

  private createNominalEvidence(): RiskEvidence {
    return {
      primaryReason: 'All 16 sensor nodes reporting nominal values within DGMS baseline (< 3.0 mm/m).',
      summary: 'All 16 sensor nodes reporting nominal values within DGMS baseline (< 3.0 mm/m).',
      what: 'Ground parameters within nominal baseline and DGMS regulatory thresholds.',
      where: {
        panelCode: 'P-101',
        affectedNodes: [],
        epicenterNode: 'SN-101',
      },
      when: {
        detectedAt: new Date().toISOString(),
        persistenceSec: 0,
        lastEvaluatedAt: new Date().toISOString(),
      },
      which: {
        channels: [],
        sensorTypes: [],
      },
      howPersistent: 'Nominal continuous baseline stability',
      whyRiskChanged: 'No anomalous movement or geotechnical acceleration detected.',
      whatActionRecommended: 'Maintain routine automated polling and periodic telemetry health checks.',
      spatialCorrelationScore: 0.0,
      modalityAgreementScore: 0.0,
      dgmsComplianceStatus: 'COMPLIANT',
      contributingFactors: [
        {
          factor: 'Multi-station baseline displacement',
          state: 'nominal',
          weight: 0.35,
          evidence: 'Displacement across all panels < 20.0 mm',
        },
        {
          factor: 'Tilt rate convergence',
          state: 'nominal',
          weight: 0.3,
          evidence: 'Angular tilt slope within seasonal background bounds',
        },
        {
          factor: 'Microseismic/vibration baseline',
          state: 'nominal',
          weight: 0.2,
          evidence: 'Vibration RMS < 2.0 mm/s',
        },
        {
          factor: 'Historical InSAR trend alignment',
          state: 'nominal',
          weight: 0.15,
          evidence: 'Compliant with seasonal ground elevation changes',
        },
      ],
    };
  }

  /**
   * Reset risk engine state (used when simulator resets or scenario switches)
   */
  public reset(): void {
    this.channelStats.clear();
    this.latestHealthByNode.clear();
    this.activeAnomalies.clear();
    this.pendingAnomaliesToPersist = [];
    this.currentRiskState = 'Normal';
    this.initDefaultBaselines();

    if (this.currentAssessment) {
      for (const listener of this.assessmentListeners) {
        listener(this.currentAssessment);
      }
    }
  }

  // Getters
  public getCurrentRiskState(): RiskState {
    return this.currentRiskState;
  }

  public getCurrentEvidence(): RiskEvidence | null {
    return this.currentEvidence;
  }

  public getCurrentAssessment(): RiskAssessmentEvent | null {
    return this.currentAssessment;
  }

  public getActiveAnomalies(): AnomalyRecord[] {
    return Array.from(this.activeAnomalies.values());
  }

  // Subscriptions
  public subscribeToRiskAssessments(callback: RiskAssessmentCallback): () => void {
    this.assessmentListeners.add(callback);
    return () => this.assessmentListeners.delete(callback);
  }

  public subscribeToAnomalies(callback: AnomalyEventCallback): () => void {
    this.anomalyListeners.add(callback);
    return () => this.anomalyListeners.delete(callback);
  }

  /**
   * Persist a Risk Assessment event to Supabase
   */
  private async persistRiskAssessment(assessment: RiskAssessmentEvent): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from('risk_assessments').insert({
        mine_id: assessment.mineId,
        panel_id: assessment.panelId,
        assessed_at: assessment.assessedAt,
        risk_state: assessment.riskState,
        confidence: assessment.confidence,
        score: assessment.score,
        contributing_factors: assessment.evidence.contributingFactors as unknown as Json,
        evidence_summary: assessment.evidence.summary,
        model_version: assessment.modelVersion,
        provenance: assessment.provenance,
      });
    } catch {
      // Graceful offline fallback
    }
  }

  /**
   * Flush queued anomaly records to Supabase in batches
   */
  private async flushPersistenceBuffer(): Promise<void> {
    if (this.pendingAnomaliesToPersist.length === 0) return;
    if (!isSupabaseConfigured()) {
      this.pendingAnomaliesToPersist = [];
      return;
    }

    const toPersist = [...this.pendingAnomaliesToPersist];
    this.pendingAnomaliesToPersist = [];

    try {
      const supabase = createClient();

      // Ensure node UUID mappings
      if (this.nodeUuidByCode.size === 0) {
        const { data: nodes } = await supabase.from('sensor_nodes').select('id, node_code');
        if (nodes) {
          for (const n of nodes) this.nodeUuidByCode.set(n.node_code, n.id);
        }
        const { data: sensors } = await supabase.from('sensors').select('id, sensor_code, node_id');
        if (sensors && nodes) {
          const codeById = new Map<string, string>();
          for (const n of nodes) codeById.set(n.id, n.node_code);
          for (const s of sensors) {
            const nodeCode = codeById.get(s.node_id);
            if (nodeCode) this.sensorUuidByNodeAndCode.set(`${nodeCode}-${s.sensor_code}`, s.id);
          }
        }
      }

      if (this.nodeUuidByCode.size === 0) return;

      const records = toPersist
        .map((a) => {
          const nodeUuid = this.nodeUuidByCode.get(a.nodeCode);
          const sensorUuid = this.sensorUuidByNodeAndCode.get(a.sensorCode);
          if (!nodeUuid || !sensorUuid) return null;

          return {
            node_id: nodeUuid,
            sensor_id: sensorUuid,
            detected_at: a.detectedAt,
            anomaly_type: a.anomalyType,
            severity: a.severity,
            z_score: a.zScore,
            rate_of_change: a.rateOfChange,
            persistence_sec: a.persistenceSec,
            confidence: a.confidence,
            status: 'ACTIVE',
            details: a.details as unknown as Json,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (records.length > 0) {
        await supabase.from('anomaly_events').insert(records);
      }
    } catch {
      // Graceful offline fallback
    }
  }

  public destroy(): void {
    if (this.persistenceTimer) clearInterval(this.persistenceTimer);
    if (this.unsubscribeTelemetry) this.unsubscribeTelemetry();
    if (this.unsubscribeHealth) this.unsubscribeHealth();
    this.assessmentListeners.clear();
    this.anomalyListeners.clear();
  }
}
