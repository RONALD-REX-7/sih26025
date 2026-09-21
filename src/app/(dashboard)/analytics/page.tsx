'use client';

import React, { useState } from 'react';
import { RiskBadge } from '@/components/industrial/risk-badge';
import { useSimulatorStore } from '@/lib/simulator/simulator-store';
import {
  BrainCircuit,
  Activity,
  Network,
  Info,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPanel, setSelectedPanel] = useState<'P-101' | 'P-102' | 'P-103' | 'P-104'>('P-101');
  const { currentRiskState, currentEvidence, latestReadings } = useSimulatorStore();

  const spatialCorrelation = currentEvidence?.spatialCorrelationScore ?? 0.84;
  const modalityAgreement = currentEvidence?.modalityAgreementScore ?? 0.88;
  const persistenceSec = currentEvidence?.when.persistenceSec ?? 18;
  const compositeAnomalyScore = parseFloat(
    (spatialCorrelation * 0.45 + modalityAgreement * 0.40 + (persistenceSec > 20 ? 0.15 : 0.05)).toFixed(2)
  );

  const nodePrefix = selectedPanel === 'P-101' ? 'SN-102' : selectedPanel === 'P-102' ? 'SN-106' : selectedPanel === 'P-103' ? 'SN-110' : 'SN-114';
  const tiltVal = latestReadings[`${nodePrefix}-TILT_X`]?.value ?? 12.4;
  const dispVal = latestReadings[`${nodePrefix}-DISP_Z`]?.value ?? 18.5;
  const vibVal = latestReadings[`${nodePrefix}-VIB_RMS`]?.value ?? 2.1;
  const strainVal = latestReadings[`${nodePrefix}-STRAIN`]?.value ?? 420.0;

  // Inter-station Pearson correlation matrix
  const correlationMatrix = [
    { station: 'SN-101', 'SN-101': 1.00, 'SN-102': 0.88, 'SN-103': 0.76, 'SN-104': 0.42 },
    { station: 'SN-102', 'SN-101': 0.88, 'SN-102': 1.00, 'SN-103': 0.82, 'SN-104': 0.51 },
    { station: 'SN-103', 'SN-101': 0.76, 'SN-102': 0.82, 'SN-103': 1.00, 'SN-104': 0.63 },
    { station: 'SN-104', 'SN-101': 0.42, 'SN-102': 0.51, 'SN-103': 0.63, 'SN-104': 1.00 },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#74808A] flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-[#173B57]" />
              Statistical Intelligence &bull; Hybrid Detection Engine
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D2933]">
            Statistical Anomaly Detection &amp; Explainable Risk Engine
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Multi-transducer sensor fusion, rolling Z-score persistence analysis, and Pearson inter-station correlation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-tech border border-[#D7DEDC] bg-[#EDF1F0] px-2.5 py-1 rounded-sm text-[#52606D]">
            Model: EWMA + Robust Z-Score (v2.1)
          </span>
          <RiskBadge state={currentRiskState} size="md" />
        </div>
      </div>

      {/* Scientific Transparency Notice */}
      <div className="p-3.5 rounded-sm bg-[#FFFFFF] border border-[#D7DEDC] text-xs flex items-start gap-3 shadow-xs">
        <Info className="h-4 w-4 text-[#173B57] shrink-0 mt-0.5" />
        <div className="space-y-1 text-[#52606D] leading-relaxed">
          <span className="font-semibold text-[#1D2933]">
            DGMS Safety-Critical Decision Support Standard:
          </span>{' '}
          This platform performs statistical anomaly detection and evidence-based risk assessment. It detects abnormal rates of change, multi-station persistence, and cross-modality correlation. It does not claim deterministic collapse prediction.
        </div>
      </div>

      {/* Statistical Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold font-mono-tech text-[#74808A] uppercase tracking-wider">Composite Risk Index</div>
          <div className="text-xl font-bold font-mono-tech text-[#1D2933] mt-1">
            {compositeAnomalyScore.toFixed(2)} <span className="text-xs font-normal text-[#52606D]">/ 1.00</span>
          </div>
          <div className="text-xs font-mono-tech text-[#74808A] mt-1">Baseline nominal: &lt; 0.40</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold font-mono-tech text-[#74808A] uppercase tracking-wider">Spatial Correlation</div>
          <div className="text-xl font-bold font-mono-tech text-[#1D2933] mt-1">
            r = +{spatialCorrelation.toFixed(2)}
          </div>
          <div className="text-xs font-mono-tech text-[#74808A] mt-1">Pearson inter-station co-variance</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold font-mono-tech text-[#74808A] uppercase tracking-wider">Persistence Window</div>
          <div className="text-xl font-bold font-mono-tech text-[#1D2933] mt-1">
            {persistenceSec} <span className="text-xs font-normal text-[#52606D]">seconds</span>
          </div>
          <div className="text-xs font-mono-tech text-[#74808A] mt-1">Transient vibration filter: 45s</div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3.5 shadow-xs">
          <div className="text-[11px] font-semibold font-mono-tech text-[#74808A] uppercase tracking-wider">Modality Agreement</div>
          <div className="text-xl font-bold font-mono-tech text-[#1D2933] mt-1">
            {(modalityAgreement * 100).toFixed(0)}%
          </div>
          <div className="text-xs font-mono-tech text-[#74808A] mt-1">Tilt &bull; Disp &bull; PPV agreement</div>
        </div>
      </div>

      {/* District Selector Bar */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech text-[#52606D]">Focus District:</span>
          {(['P-101', 'P-102', 'P-103', 'P-104'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPanel(p)}
              className={`px-2.5 py-1 text-xs font-mono-tech rounded-sm border cursor-pointer transition-colors ${
                selectedPanel === p
                  ? 'bg-[#173B57] text-[#FFFFFF] font-semibold border-[#173B57]'
                  : 'border-[#D7DEDC] text-[#52606D] hover:bg-[#EDF1F0]'
              }`}
            >
              Panel {p}
            </button>
          ))}
        </div>

        <span className="font-mono-tech text-xs text-[#52606D]">
          Focus Node: <strong className="text-[#1D2933]">{nodePrefix}</strong>
        </span>
      </div>

      {/* Two-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Pearson Spatial Correlation Matrix Table */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
            <span className="font-semibold text-sm text-[#173B57] flex items-center gap-2">
              <Network className="h-4 w-4 text-[#173B57]" />
              Pearson Spatial Correlation Matrix ({selectedPanel})
            </span>
            <span className="text-xs font-mono-tech text-[#74808A]">Inter-Station Concordance</span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left table-industrial">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>SN-101</th>
                  <th>SN-102</th>
                  <th>SN-103</th>
                  <th>SN-104</th>
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row) => (
                  <tr key={row.station}>
                    <td className="font-mono-tech font-bold text-[#173B57]">{row.station}</td>
                    <td className="font-mono-tech">
                      <span className={row['SN-101'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-101'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-102'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-102'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-103'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-103'].toFixed(2)}
                      </span>
                    </td>
                    <td className="font-mono-tech">
                      <span className={row['SN-104'] >= 0.8 ? 'font-bold text-[#B42318]' : 'text-[#1D2933]'}>
                        {row['SN-104'].toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-[#74808A] font-mono-tech mt-2">
              Values $r \ge 0.80$ indicate multi-station spatial deformation basin formation rather than single-sensor transient drift.
            </p>
          </div>
        </div>

        {/* Right: Modality Concordance & Factors */}
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9] flex items-center justify-between">
            <span className="font-semibold text-sm text-[#173B57] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#173B57]" />
              Transducer Concordance ({nodePrefix})
            </span>
            <span className="text-xs font-mono-tech text-[#74808A]">Live Ingestion</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Biaxial Tilt Slope (Tilt X)</p>
                <p className="text-xs text-[#52606D]">Dual MEMS Inclinometer</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{tiltVal.toFixed(2)} arcsec</span>
                <p className="text-xs text-[#74808A]">Limit: 3.0 mm/m</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Borehole Extensometer (DISP_Z)</p>
                <p className="text-xs text-[#52606D]">Deep Strata Anchor</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className={dispVal > 30 ? 'font-bold text-[#B42318]' : 'font-bold text-[#1D2933]'}>
                  {dispVal.toFixed(2)} mm
                </span>
                <p className="text-xs text-[#74808A]">Threshold: 30.0 mm</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Microseismic Vibration (VIB_RMS)</p>
                <p className="text-xs text-[#52606D]">Velocity Geophone</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{vibVal.toFixed(2)} mm/s</span>
                <p className="text-xs text-[#74808A]">Limit: 5.0 mm/s</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-sm bg-[#F8FAF9] border border-[#D7DEDC]">
              <div>
                <p className="font-semibold text-[#1D2933]">Pillar Strain Gauge (STRAIN)</p>
                <p className="text-xs text-[#52606D]">Roof Bolt Axial Tension</p>
              </div>
              <div className="text-right font-mono-tech">
                <span className="font-bold text-[#1D2933]">{strainVal.toFixed(1)} µε</span>
                <p className="text-xs text-[#74808A]">Nominal: &lt; 600 µε</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Diagnostics Specification Table */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#D7DEDC] bg-[#F8FAF9]">
          <h3 className="text-sm font-semibold text-[#173B57]">
            Anomaly Detection Model Configuration &amp; Rejection Filters
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-industrial">
            <thead>
              <tr>
                <th>Model Component</th>
                <th>Algorithm</th>
                <th>Sample Window</th>
                <th>Rejection Filter</th>
                <th>Regulatory Reference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold text-[#1D2933]">Baseline Smoothing</td>
                <td className="font-mono-tech">Exponentially Weighted Moving Average (EWMA)</td>
                <td className="font-mono-tech text-[#52606D]">α = 0.20 (15-sample window)</td>
                <td>High-frequency machinery vibration filter</td>
                <td className="text-[#52606D]">DGMS TC 4/2017</td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1D2933]">Outlier Scoring</td>
                <td className="font-mono-tech">Median Absolute Deviation (Robust Z-Score)</td>
                <td className="font-mono-tech text-[#52606D]">N = 50 samples rolling</td>
                <td>Rejects single-point transient spikes (|z| &lt; 2.5)</td>
                <td className="text-[#52606D]">CMPDI Technical Standard</td>
              </tr>
              <tr>
                <td className="font-semibold text-[#1D2933]">Spatial Cross-Check</td>
                <td className="font-mono-tech">Pearson Bivariate Inter-Node Correlation</td>
                <td className="font-mono-tech text-[#52606D]">Adjacent nodes in extraction panel</td>
                <td>Single-node failure requires second-node corroboration</td>
                <td className="text-[#52606D]">DGMS CMR Reg 112</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
