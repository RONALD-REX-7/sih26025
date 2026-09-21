'use client';

import React, { useState } from 'react';
import { DGMS_REGULATORY_THRESHOLDS, DEMO_MINE_INFO } from '@/lib/domain/constants';
import { Sliders, ShieldCheck, MapPin, Save, Check } from 'lucide-react';
import { ProvenanceBadge } from '@/components/industrial/provenance-badge';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displacementLimit, setDisplacementLimit] = useState(
    DGMS_REGULATORY_THRESHOLDS.criticalSubsidenceSlope.toString()
  );
  const [strainLimit, setStrainLimit] = useState('2.0');
  const [pollingInterval, setPollingInterval] = useState('500');

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-sm border border-[#D7DEDC]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono-tech font-semibold uppercase tracking-wider text-[#52606D] flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-[#173B57]" />
              System calibration &bull; Statutory thresholds
            </span>
            <ProvenanceBadge provenance="DEMO" size="sm" />
            <span className="px-2 py-0.5 rounded-sm text-xs font-mono-tech font-semibold bg-[#EAF2ED] text-[#2F6B4F] border border-[#2F6B4F]/30">
              CMR 2017 Reg 112 Compliant
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#1D2933]">
            Geotechnical Thresholds &amp; Colliery Stratigraphy Parameters
          </h1>
          <p className="text-xs text-[#52606D] mt-0.5">
            Operational ground stability limit criteria, permissible subsidence gradients, and telemetry transducer calibration matrix for Jharia Coalfield.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="h-8 text-xs font-mono-tech bg-[#173B57] hover:bg-[#102C42] text-[#FFFFFF] cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="h-3 w-3 mr-1.5 text-[#2F6B4F]" /> Saved
              </>
            ) : (
              <>
                <Save className="h-3 w-3 mr-1.5" /> Save parameters
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#D7DEDC] rounded-sm border border-[#D7DEDC] bg-[#FFFFFF] text-xs">
        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Regulatory standard
          </div>
          <div className="text-base font-bold tabular-nums text-[#1D2933] mt-0.5">DGMS CMR 2017</div>
          <div className="text-xs text-[#52606D] mt-0.5">Circular (Coal) No. 04 of 2017</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Critical evac slope
          </div>
          <div className="text-base font-bold tabular-nums text-[#B42318] mt-0.5 font-mono-tech">
            {DGMS_REGULATORY_THRESHOLDS.criticalSubsidenceSlope} mm/m
          </div>
          <div className="text-xs text-[#52606D] mt-0.5">Mandatory withdrawal trigger</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Seam classification
          </div>
          <div className="text-base font-bold text-[#9A6A00] mt-0.5">Degree III Gassy</div>
          <div className="text-xs text-[#52606D] mt-0.5">Flameproof Ex d I / Ex ia I required</div>
        </div>

        <div className="p-3">
          <div className="text-xs uppercase tracking-wider text-[#74808A] font-semibold">
            Telemetry channels
          </div>
          <div className="text-base font-bold text-[#173B57] mt-0.5">5 Physical Types</div>
          <div className="text-xs text-[#52606D] mt-0.5">Tilt, Disp, Vib, Strain, Acoustic</div>
        </div>
      </div>

      {/* Section 1: Geotechnical Limit Matrix */}
      <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm overflow-hidden">
        <div className="p-3.5 border-b border-[#D7DEDC] bg-[#F8FAF9]">
          <h2 className="text-xs font-bold text-[#1D2933] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#173B57]" />
            1. Statutory ground movement thresholds (DGMS CMR 2017)
          </h2>
          <p className="text-xs text-[#52606D] mt-0.5">
            Calibrated trigger thresholds for escalating early warnings and emergency shift evals
          </p>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F8FAF9] text-[#52606D] uppercase tracking-wider border-b border-[#D7DEDC] font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Transducer modality</th>
                <th className="py-2.5 px-3 text-left">Normal baseline</th>
                <th className="py-2.5 px-3 text-left">Advisory limit</th>
                <th className="py-2.5 px-3 text-left">Watch threshold</th>
                <th className="py-2.5 px-3 text-left">Warning limit</th>
                <th className="py-2.5 px-3 text-left">Critical evacuation limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DEDC] font-mono-tech">
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#1D2933] font-sans">Biaxial tilt slope</td>
                <td className="py-2.5 px-3 text-[#2F6B4F]">&lt; 1.0 mm/m</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">1.0 - 1.5 mm/m</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">1.5 - 2.0 mm/m</td>
                <td className="py-2.5 px-3 text-[#A85A00]">2.0 - 3.0 mm/m</td>
                <td className="py-2.5 px-3 text-[#B42318] font-bold">&gt; 3.0 mm/m</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#1D2933] font-sans">Tensile strain</td>
                <td className="py-2.5 px-3 text-[#2F6B4F]">&lt; 0.5 mm/m</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">0.5 - 1.0 mm/m</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">1.0 - 1.5 mm/m</td>
                <td className="py-2.5 px-3 text-[#A85A00]">1.5 - 2.0 mm/m</td>
                <td className="py-2.5 px-3 text-[#B42318] font-bold">&gt; 2.0 mm/m</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#1D2933] font-sans">Cumulative displacement</td>
                <td className="py-2.5 px-3 text-[#2F6B4F]">&lt; 20 mm</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">20 - 40 mm</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">40 - 60 mm</td>
                <td className="py-2.5 px-3 text-[#A85A00]">60 - 80 mm</td>
                <td className="py-2.5 px-3 text-[#B42318] font-bold">&gt; 80 mm</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-[#1D2933] font-sans">Vibration velocity (PPV)</td>
                <td className="py-2.5 px-3 text-[#2F6B4F]">&lt; 0.5 mm/s</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">0.5 - 1.0 mm/s</td>
                <td className="py-2.5 px-3 text-[#9A6A00]">1.0 - 2.0 mm/s</td>
                <td className="py-2.5 px-3 text-[#A85A00]">2.0 - 5.0 mm/s</td>
                <td className="py-2.5 px-3 text-[#B42318] font-bold">&gt; 5.0 mm/s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Colliery Stratigraphic Profile & Telemetry Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <MapPin className="h-4 w-4 text-[#173B57]" />
            <h3 className="text-xs font-bold text-[#1D2933] uppercase tracking-wider">
              Colliery stratigraphic profile
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Colliery designation</span>
              <span className="font-semibold text-[#1D2933]">{DEMO_MINE_INFO.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Mining method</span>
              <span className="text-[#1D2933] font-mono-tech">Bord &amp; Pillar with Hydraulic Sand Stowing</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Active coal seam</span>
              <span className="text-[#1D2933] font-mono-tech">Seam VII (Average thickness: 6.2m)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Depth of cover</span>
              <span className="text-[#1D2933] font-mono-tech">240m to 285m below surface</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#D7DEDC]">
              <span className="text-[#52606D]">Overburden strata</span>
              <span className="text-[#1D2933] font-mono-tech">Barakar Formation Sandstone / Shale</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D7DEDC] rounded-sm p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D7DEDC] pb-2">
            <Sliders className="h-4 w-4 text-[#173B57]" />
            <h3 className="text-xs font-bold text-[#1D2933] uppercase tracking-wider">
              Telemetry polling &amp; watchdog intervals
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#52606D] block mb-1">
                Telemetry sampling interval (milliseconds)
              </label>
              <input
                type="number"
                value={pollingInterval}
                onChange={(e) => setPollingInterval(e.target.value)}
                className="w-full h-8 px-3 rounded-sm border border-[#D7DEDC] bg-[#F4F6F5] font-mono-tech text-xs text-[#1D2933]"
              />
            </div>
            <div>
              <label className="text-[#52606D] block mb-1">
                Critical slope trigger threshold (mm/m)
              </label>
              <input
                type="text"
                value={displacementLimit}
                onChange={(e) => setDisplacementLimit(e.target.value)}
                className="w-full h-8 px-3 rounded-sm border border-[#D7DEDC] bg-[#F4F6F5] font-mono-tech text-xs text-[#1D2933]"
              />
            </div>
            <div>
              <label className="text-[#52606D] block mb-1">
                Tensile strain warning limit (mm/m)
              </label>
              <input
                type="text"
                value={strainLimit}
                onChange={(e) => setStrainLimit(e.target.value)}
                className="w-full h-8 px-3 rounded-sm border border-[#D7DEDC] bg-[#F4F6F5] font-mono-tech text-xs text-[#1D2933]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
