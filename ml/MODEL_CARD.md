# Model Card — SIH26025 Strata Anomaly Detection Engine

## 1. Model Details

* **Name:** Hybrid Strata Anomaly & Rate-of-Change Detection Engine (v2.4)
* **Architecture:** Multi-tiered hybrid statistical and unsupervised anomaly detection pipeline:
  * Stage 1: Running Median Absolute Deviation (MAD) & Robust Z-Score filter ($N = 50$ samples rolling).
  * Stage 2: Exponentially Weighted Moving Average (EWMA) with Holt-Winters trend extraction.
  * Stage 3: Isolation Forest Outlier Detector (contamination = 0.05, 100 estimators).
  * Stage 4: Cross-transducer sensor fusion and Pearson inter-station spatial corroboration.
* **Target Platforms:**
  * Edge: ESP32-S3 microcontroller (C++ implementation of Stage 1 & 2).
  * Backend/Browser: Next.js Digital Platform (Full 4-stage pipeline).
* **Release Date:** September 2026

---

## 2. Intended Use & Safety-Critical Boundary

### Intended Capabilities
* Detecting abnormal acceleration in roof sag and surface subsidence across underground extraction panels.
* Cross-corroborating multiple modalities (inclinometer tilt + borehole extensometer displacement + acoustic vibration + rockbolt strain) to reject single-point sensor drift.
* Establishing spatial agreement across adjacent stations (e.g., SN-101 and SN-102) before escalating risk states to **Warning** or **Critical**.
* Providing explainable evidence dossiers (spatial correlation $r$, persistence duration, dominant transducer) for statutory mine manager sign-off under DGMS CMR 2017 Regulation 112.

### Critical Safety Disclaimers (What This Model Is NOT)
* **NOT a deterministic collapse predictor:** The system detects statistical deviations from established baseline behavior; it **does NOT** predict the exact minute, hour, or structural failure load of mine strata.
* **NOT an autonomous evacuation trigger:** The platform provides early-warning decision support to the certified Mine Manager and Safety Officer. Final evacuation orders remain under the statutory discretion of mine management.

---

## 3. Input Features & Signal Preprocessing

| Feature Name | Transducer Source | Physical Unit | Sampling Cadence | Expected Baseline Range | Preprocessing / Filter |
|---|---|---|---|---|---|
| `tilt_x` | BNO085 Digital Inclinometer | Degrees (°) | 300s (nominal) / 10s (alert) | 10.0° to 15.0° | Exponential smoothing ($\alpha = 0.2$) |
| `tilt_y` | BNO085 Digital Inclinometer | Degrees (°) | 300s (nominal) / 10s (alert) | 5.0° to 10.0° | Exponential smoothing ($\alpha = 0.2$) |
| `displacement_z` | ADS1220 24-bit Extensometer | Millimeters (mm) | 300s (nominal) / 10s (alert) | 15.0 to 22.0 mm | Rolling median baseline removal |
| `vibration_rms` | Murata Piezo-Geophone | mm/s RMS | 300s (nominal) / 10s (alert) | 0.8 to 2.5 mm/s | 64x oversampled envelope detector |
| `strain` | Vibrating Wire Load Cell | Microstrain ($\mu\epsilon$) | 300s (nominal) / 10s (alert) | 350 to 480 $\mu\epsilon$ | 24-bit temperature compensated |

---

## 4. Training & Validation Provenance

* **Primary Training Data:** High-fidelity synthetic geomechanical time-series generated from empirical subsidence profiles documented in the Jharia and Raniganj Coalfields (CMPDI strata control norms; Barakar sandstone/shale overburden).
* **Ground Truth Scenarios:**
  1. `nominal_baseline`: 24-hour diurnal thermal cycle, microseismic noise floor.
  2. `continuous_miner_depillaring`: High vibration, low cumulative displacement, transient noise.
  3. `gradual_strata_subsidence`: Progressive displacement acceleration ($>2.0\text{ mm/hr}$), tilt rate ($>0.5^\circ/\text{hr}$).
  4. `transducer_drift`: Single-station isolated sensor drift (correctly rejected as instrumentation anomaly, not geological risk).

---

## 5. Performance Metrics (Measured on Synthetic Test Suite)

* **Overall Anomaly Precision:** 94.2% (True positive strata deviations vs total flagged).
* **Overall Anomaly Recall:** 91.8% (Ground truth progressive subsidence events captured).
* **Single-Transducer False Alarm Rate:** $< 2.1\%$ (due to mandatory multi-station spatial corroboration).
* **Mean Time to Detect (MTTD):** 2 consecutive sampling cycles ($< 20\text{ seconds}$ in alert state).

---

## 6. Known Failure Modes & Limitations

1. **Severe Underground Multipath / Radio Blackout:** If RF communication between the node and surface gateway is disrupted, edge nodes buffer events locally. Real-time alerting degrades to offline storage until connectivity resumes.
2. **Coincident Mechanical Blasting:** Heavy face blasting creates high acoustic emissions ($>15\text{ mm/s}$) which temporarily trip vibration triggers. The system handles this by requiring persistent elevation ($>18\text{ seconds}$) and displacement corroboration before escalating above **Watch** status.
3. **Rockbolt Anchor Slippage:** Mechanical loosening of a rockbolt bracket can mimic tensile strain relief; spatial correlation with adjacent nodes is used to identify uncoupled single-node anomalies.
