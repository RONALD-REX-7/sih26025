# SIH26025 — System Architecture Presentation Deck

## Slide 1: Title & Challenge Context
* **Title:** SIH26025 — AI-Enabled Low-Cost Real-Time Mine Subsidence Early Warning System
* **Context:** Underground coal mines in India (Bord & Pillar Depillaring / Mechanised Longwall).
* **Challenge:** Unheralded strata failures causing surface subsidence, infrastructure destruction, and loss of life.
* **Core Philosophy:** 30x lower hardware cost, zero cloud dependency for critical alerts, explainable statistical AI, and statutory DGMS alignment.

---

## Slide 2: End-to-End Architectural Pipeline
```
[ Strata Face ] ──► [ Geotechnical Sensors ] (Tilt, Displacement, Strain, Vibration)
                         │
                         ▼ (I2C / SPI / Differential Analog)
[ Edge Controller ] ──► [ ESP32-S3 ] (TinyML EWMA & Robust Z-Score, FreeRTOS)
                         │
                         ▼ (LoRa Sub-GHz 865.2 MHz RF)
[ Mine Backhaul ]   ──► [ Gateway ] (Surface Pit Bottom / Substation)
                         │
                         ▼ (HTTPS / TLS 1.3)
[ Ingestion API ]   ──► [/api/telemetry/ingest] (Next.js Server Actions)
                         │
                         ▼
[ Intelligence ]    ──► [Hybrid Anomaly Engine] (Spatial Pearson Correlation + Sensor Fusion)
                         │
                         ▼
[ Decision Layer ]  ──► [5-State Risk Engine] (Normal ➔ Advisory ➔ Watch ➔ Warning ➔ Critical)
                         │
                         ▼
[ Safety Actions ]  ──► [DGMS CMR 112 Sign-Off] + [Audible Siren] + [Audit Trail]
```

---

## Slide 3: Low-Cost Physical Sensing Node
* **Bill of Materials:** ₹4,850 (~$58 USD) per station vs ₹1,50,000+ for imported stations.
* **Sensors:**
  * CEVA/Bosch BNO085 (0.01° dual-axis tiltmeter).
  * TI ADS1220 (24-bit delta-sigma ADC with internal programmable gain amplifier).
  * Murata Piezo-Acoustic Geophone.
* **Power Management:**
  * 3.2V 3200 mAh LiFePO4 battery (intrinsically safe thermal stability).
  * Gated power rails (high-side P-MOSFET).
  * Average nominal current: **97 µA** ➔ **3+ years autonomy** on a single charge.

---

## Slide 4: On-Device Edge AI & Dynamic Reporting
* **Edge TinyML:** Evaluates running Median Absolute Deviation (MAD) and robust Z-scores over a sliding circular history buffer ($N = 30$).
* **Cadence Escalation:**
  * Nominal strata conditions: Telemetry transmitted every **300 seconds (5 minutes)**.
  * Anomalous strata sag ($|z| > 2.5$): Automatically switches to **10-second high-speed telemetry bursts**.
* **Binary Serialization:** 20-byte packed struct with CRC-16-CCITT checksum ensures high reception probability in harsh underground multipath tunnels.

---

## Slide 5: Multi-Station Spatial Correlation & Sensor Fusion
* **Rejection of False Positives:** A single sensor spike NEVER triggers an evacuation alert.
* **Corroboration Matrix:**
  * Inter-Station Pearson Covariance ($r > +0.75$).
  * Cross-Modality Agreement (e.g. roof sag must match tensile strain acceleration).
  * Temporal Persistence ($>18\text{ seconds}$ continuous deviation).
* **Explainability:** Generates transparent risk dossiers displaying exact spatial agreement scores, dominant transducers, and acceleration rates.

---

## Slide 6: Industrial UI & Statutory Safety Workflow
* **Design Philosophy:** Clean, distraction-free industrial design adhering to safety guidelines.
* **GIS Surveillance:** Multi-layer vector GIS mapping underground panels, goaf lines, fault zones, and surface infrastructure.
* **Statutory Compliance:** Built-in DGMS CMR 2017 Regulation 112 sign-off workflows with immutable cryptographically-traceable audit logs.
* **Deterministic Simulation:** Built-in PRNG engine with 8 realistic geomechanical scenarios allowing repeatable demonstrations without requiring live mine hardware.
