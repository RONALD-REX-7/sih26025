# SIH26025 — Machine Learning & Edge AI Pipeline

## 1. Overview

This directory contains the Python research, training, feature extraction, and quantization pipeline for the SIH26025 strata anomaly detection engine.

The pipeline combines:
1. **Statistical Outlier Detection:** Robust Z-Scores using Median Absolute Deviation (MAD) over rolling windows ($N = 50$).
2. **Temporal Trend Analysis:** Exponentially Weighted Moving Average (EWMA) and dynamic rate-of-change thresholds.
3. **C Header Export:** Exporting verified mathematical baselines and quantization thresholds directly into `firmware/include/tinyml_weights.h` for on-device ESP32-S3 execution.

---

## 2. Directory Structure

```
ml/
├── requirements.txt           # Python dependencies (numpy, scipy, scikit-learn)
├── MODEL_CARD.md              # Formal engineering model card & limitations
├── data_generator.py          # Deterministic strata subsidence time-series generator
├── train_anomaly_detector.py  # Baseline calculation & parameter trainer
├── tinyml_export.py           # Exports C header constants for firmware
├── evaluate_model.py          # Benchmarking script computing Precision/Recall/F1
└── README.md                  # This document
```

---

## 3. Quickstart

### Prerequisites
* Python 3.9+ installed.

### Execution

```bash
# 1. Install dependencies
pip install -r ml/requirements.txt

# 2. Generate synthetic strata time-series data
python ml/data_generator.py

# 3. Train detector & compute baseline parameters
python ml/train_anomaly_detector.py

# 4. Export TinyML weights to firmware header
python ml/tinyml_export.py

# 5. Run evaluation benchmark against ground-truth sequences
python ml/evaluate_model.py
```
