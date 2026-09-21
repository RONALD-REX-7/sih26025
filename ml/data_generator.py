#!/usr/bin/env python3
"""
SIH26025 Synthetic Strata Subsidence & Multi-Station Telemetry Generator
Generates realistic geomechanical time-series data using standard Python libraries.
"""

import json
import math
import os
import random
import sys

def generate_telemetry_dataset(num_samples=1000, seed=42, output_path=None):
    random.seed(seed)
    
    data = []
    base_time = 1789900000  # Epoch base
    
    # Nominal initial state
    tilt_x = 12.4
    tilt_y = 8.2
    disp_z = 18.5
    vib_rms = 1.8
    strain = 420.0
    
    for i in range(num_samples):
        t = base_time + (i * 300)  # 5-min intervals
        
        # Diurnal thermal oscillation
        thermal_drift = 0.3 * math.sin(2 * math.pi * i / 288)
        noise_tilt = random.gauss(0, 0.04)
        noise_disp = random.gauss(0, 0.08)
        noise_vib = random.gauss(0, 0.15)
        noise_strain = random.gauss(0, 1.5)
        
        label = "NORMAL"
        ground_truth_anomaly = False
        
        if 300 <= i < 450:
            # Machinery/blasting transient
            label = "MACHINERY_TRANSIENT"
            cur_vib = max(0.5, 3.8 + random.gauss(0, 0.8))
            cur_tilt_x = tilt_x + thermal_drift + noise_tilt
            cur_tilt_y = tilt_y + noise_tilt
            cur_disp = disp_z + noise_disp
            cur_strain = strain + noise_strain
        elif 650 <= i < 850:
            # Progressive subsidence event
            progress = (i - 650) / 200.0
            label = "STRATA_SUBSIDENCE_EVENT"
            ground_truth_anomaly = True
            cur_tilt_x = tilt_x + (progress * 4.8) + noise_tilt
            cur_tilt_y = tilt_y + (progress * 2.5) + noise_tilt
            cur_disp = disp_z + (progress * 14.2) + noise_disp
            cur_vib = 2.4 + (progress * 2.8) + noise_vib
            cur_strain = strain + (progress * 460.0) + noise_strain
        else:
            # Nominal baseline
            cur_tilt_x = tilt_x + thermal_drift + noise_tilt
            cur_tilt_y = tilt_y + noise_tilt
            cur_disp = disp_z + noise_disp
            cur_vib = max(0.4, vib_rms + noise_vib)
            cur_strain = strain + noise_strain
            
        record = {
            "timestamp": t,
            "step": i,
            "node_code": "SN-102",
            "panel_code": "P-101",
            "tilt_x_deg": round(float(cur_tilt_x), 3),
            "tilt_y_deg": round(float(cur_tilt_y), 3),
            "displacement_mm": round(float(cur_disp), 2),
            "vibration_rms": round(float(cur_vib), 2),
            "strain_microstrain": round(float(cur_strain), 1),
            "ground_truth_class": label,
            "is_anomaly": ground_truth_anomaly
        }
        data.append(record)
        
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[OK] Generated {num_samples} samples -> {output_path}")
        
    return data

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "..", "data", "samples", "generated_subsidence_dataset.json")
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    generate_telemetry_dataset(num_samples=1000, seed=42, output_path=out_file)
