#!/usr/bin/env python3
"""
SIH26025 Anomaly Detection Model Trainer
Uses Python standard library (statistics, math, json) for zero-dependency execution.
"""

import json
import math
import os
import statistics
import sys

def train_detector(data_path=None):
    if not data_path or not os.path.exists(data_path):
        from data_generator import generate_telemetry_dataset
        print("[INFO] Generating synthetic baseline training data...")
        dataset = generate_telemetry_dataset(num_samples=1000, seed=42)
    else:
        with open(data_path, "r", encoding="utf-8") as f:
            dataset = json.load(f)

    # Filter training set on nominal samples (first 300 steps)
    nominal_samples = [d for d in dataset if d["ground_truth_class"] == "NORMAL"]
    
    tilts = [d["tilt_x_deg"] for d in nominal_samples]
    disps = [d["displacement_mm"] for d in nominal_samples]
    vibs  = [d["vibration_rms"] for d in nominal_samples]
    strains = [d["strain_microstrain"] for d in nominal_samples]

    tilt_med = statistics.median(tilts)
    disp_med = statistics.median(disps)

    stats = {
        "tilt_mean": round(statistics.mean(tilts), 4),
        "tilt_std": round(statistics.stdev(tilts), 4),
        "tilt_mad": round(statistics.median([abs(x - tilt_med) for x in tilts]), 4),
        "disp_mean": round(statistics.mean(disps), 4),
        "disp_std": round(statistics.stdev(disps), 4),
        "disp_mad": round(statistics.median([abs(x - disp_med) for x in disps]), 4),
        "vib_mean": round(statistics.mean(vibs), 4),
        "vib_std": round(statistics.stdev(vibs), 4),
        "strain_mean": round(statistics.mean(strains), 4),
        "strain_std": round(statistics.stdev(strains), 4),
        "z_threshold": 2.50,
        "tilt_rate_threshold_deg_hr": 0.50,
        "disp_rate_threshold_mm_hr": 2.00,
        "vib_threshold_rms": 4.50,
        "samples_trained": len(nominal_samples)
    }

    out_json = os.path.join(os.path.dirname(__file__), "trained_params.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print(f"[OK] Detector parameters computed successfully from {len(nominal_samples)} samples.")
    print(f"     Baseline Tilt: {stats['tilt_mean']:.2f} ± {stats['tilt_std']:.2f}°")
    print(f"     Baseline Disp: {stats['disp_mean']:.2f} ± {stats['disp_std']:.2f} mm")
    print(f"     Saved to: {out_json}")
    return stats

if __name__ == "__main__":
    train_detector()
