#!/usr/bin/env python3
"""
SIH26025 Model Evaluation & Benchmark Script
Evaluates anomaly detection performance against labeled ground-truth sequences
using Python standard library with calibrated thresholds.
"""

import json
import math
import os
import sys

def evaluate_model():
    from data_generator import generate_telemetry_dataset
    dataset = generate_telemetry_dataset(num_samples=1000, seed=123)

    tp = 0
    fp = 0
    tn = 0
    fn = 0

    smooth_tilt = dataset[0]["tilt_x_deg"]
    smooth_disp = dataset[0]["displacement_mm"]
    consecutive_violations = 0

    for record in dataset:
        actual_anomaly = record["is_anomaly"]
        tilt = record["tilt_x_deg"]
        disp = record["displacement_mm"]
        vib = record["vibration_rms"]

        # 1. Apply exponential smoothing (alpha = 0.2) matching on-device firmware
        new_smooth_tilt = (smooth_tilt * 0.8) + (tilt * 0.2)
        new_smooth_disp = (smooth_disp * 0.8) + (disp * 0.2)

        # 2. Rate of change per hour (300s = 0.0833h)
        delta_h = 300.0 / 3600.0
        rate_tilt = abs(new_smooth_tilt - smooth_tilt) / delta_h
        rate_disp = abs(new_smooth_disp - smooth_disp) / delta_h

        smooth_tilt = new_smooth_tilt
        smooth_disp = new_smooth_disp

        # 3. Calibrated decision rule:
        # Strata movement threshold: sag rate > 0.20 deg/hr AND displacement rate > 0.50 mm/hr
        # OR excessive sag rate > 0.80 mm/hr
        is_violation = (rate_disp > 0.50 and rate_tilt > 0.20) or (rate_disp > 0.80) or (vib > 3.50 and rate_disp > 0.40)
        if is_violation:
            consecutive_violations += 1
        else:
            if consecutive_violations > 0:
                consecutive_violations -= 1

        # Persistence: requires 2 consecutive violation steps to reject transients
        predicted_anomaly = (consecutive_violations >= 2)

        if predicted_anomaly and actual_anomaly:
            tp += 1
        elif predicted_anomaly and not actual_anomaly:
            fp += 1
        elif not predicted_anomaly and not actual_anomaly:
            tn += 1
        else:
            fn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(dataset)

    results = {
        "total_samples": len(dataset),
        "true_positives": tp,
        "false_positives": fp,
        "true_negatives": tn,
        "false_negatives": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "accuracy": round(accuracy, 4),
        "false_alarm_rate": round(fp / (tn + fp), 4)
    }

    print("=======================================================")
    print("  SIH26025 Anomaly Detection Evaluation Benchmark")
    print("=======================================================")
    print(f"  Total Samples Evaluated : {results['total_samples']}")
    print(f"  Accuracy                : {results['accuracy']*100:.2f}%")
    print(f"  Precision               : {results['precision']*100:.2f}%")
    print(f"  Recall                  : {results['recall']*100:.2f}%")
    print(f"  F1-Score                : {results['f1_score']:.4f}")
    print(f"  False Alarm Rate        : {results['false_alarm_rate']*100:.2f}%")
    print("=======================================================")

    return results

if __name__ == "__main__":
    evaluate_model()
