# SIH26025 — AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring & Early Warning System

> **Smart India Hackathon 2026 — Problem Statement ID: SIH26025**  
> **Nodal Ministry:** Ministry of Coal / Coal India Limited (CIL)  
> **Benchmark Colliery:** Moonidih Underground Project, BCCL, Jharia Coalfield, Jharkhand, India  
> **Regulatory Baseline:** Directorate General of Mines Safety (DGMS) CMR 2017 (Reg 112 & 114)  
> **Live Deployment:** [https://sih26025.vercel.app](https://sih26025.vercel.app)

---

## 1. Project Mission & Overview

Underground coal mining in India (both bord-and-pillar depillaring and mechanised longwall extraction) faces severe strata hazards. Unexpected ground convergence, roof sagging, and surface subsidence threaten underground workforce safety and surface civil infrastructure (railways, pipelines, roadways, settlements).

Existing commercial subsurface monitoring stations imported from abroad cost **₹1,50,000 to ₹4,50,000 per station**, restricting colliery deployments to sparse, isolated locations.

**SIH26025** is a vertically integrated, open-architecture solution that delivers:
1. **Low-Cost Subsurface Sensing Hardware:** Multi-parametric nodes engineered with precision MEMS inclinometry, 24-bit delta-sigma strain bridge ADC, and sub-GHz LoRa (IN865) achieving a unit fabrication cost of **₹4,850 (~$58 USD)** — a **30x cost reduction**.
2. **On-Device Edge TinyML:** Real-time rate-of-change and robust Z-score analysis on an ESP32-S3 microcontroller, dynamically escalating reporting from 300s to 10s upon detecting anomalous ground sag.
3. **Multi-Station Spatial Correlation & Sensor Fusion:** Eliminates false alarms by requiring Pearson correlation agreement ($r > +0.75$) across adjacent stations and multi-modal agreement between tilt, displacement, strain, and acoustic emission.
4. **Statutory DGMS Compliance:** Purpose-built around the mandatory requirements of the **Coal Mines Regulations (CMR) 2017 Regulation 112** (Strata Control and Monitoring Plan - SCAMP), featuring digital shift sign-offs and immutable audit trails.

---

## 2. End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. SUBSURFACE SENSING & EDGE COMPUTING                                                      │
│    • BNO085 Dual-Axis Digital Inclinometer (0.01° Resolution) ──────────────► I2C Bus       │
│    • ADS1220 24-Bit Sigma-Delta ADC (Vibrating Wire Strain Bridge) ────────► SPI Bus       │
│    • Murata Piezoelectric Geophone (Microseismic Acoustic Emissions) ───────► ADC1          │
│    • ESP32-S3 Microcontroller (FreeRTOS, Circular Buffer N=30, TinyML EWMA & Z-Score)       │
│    • SX1262 LoRa Transceiver (+20 dBm, 865.2 MHz IN865 Band, 20-Byte CRC-16 Binary Packet) │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ LoRa RF Link (Tunnels / Borehole Cables)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. COMMUNICATION & INGESTION BACKHAUL                                                       │
│    • Pit-Bottom LoRaWAN Gateway / Surface Concentrator (Ethernet / 4G Cellular Backhaul)   │
│    • HTTPS Ingestion Endpoint: POST `/api/telemetry/ingest` (Protected by `x-api-key`)      │
│    • Zod Contract Validation, De-duplication, and Batch Ingestion                           │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ HTTPS / TLS 1.3
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. PERSISTENCE & STATISTICAL INTELLIGENCE                                                   │
│    • Supabase Managed PostgreSQL with Row-Level Security (RLS) & Realtime WebSockets        │
│    • Hybrid Anomaly Pipeline: Running MAD, Robust Z-Score, EWMA, & Isolation Forest        │
│    • Pearson Inter-Station Spatial Correlation & Multi-Modal Sensor Fusion                  │
│    • 5-State Risk Engine: Normal (1) ➔ Advisory (2) ➔ Watch (3) ➔ Warning (4) ➔ Critical (5) │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ Realtime Sync
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. STATUTORY OPERATIONS, GIS & ALERT CENTER                                                 │
│    • Real-Time Industrial Operations Dashboard (12 Operational Views)                       │
│    • Multi-Layer Vector GIS (Underground Panels, Goaf Lines, Faults, Surface Railway)       │
│    • Web Audio API Synthesizer Siren (Audible Emergency Alarm)                              │
│    • DGMS CMR 2017 Regulation 112 Statutory Shift Sign-Off Modal                           │
│    • Immutable Cryptographic Audit Log (`/audit`) & DGMS Form IV Compliance Reporting       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Repository Structure

```
sih26025/
├── hardware/                       # Physical sensing node schematics, BOM, and mechanical spec
│   ├── README.md                   # Hardware architecture, power budget (3+ yr life), Ex 'i' analysis
│   ├── bom/
│   │   ├── BOM.md                  # Itemized component specifications & supplier list (~₹4,850 unit cost)
│   │   └── bom.csv                 # Machine-readable Bill of Materials CSV
│   ├── schematics/
│   │   └── system_schematic.md     # Pinout map, SPI/I2C buses, ADC bridge conditioning, power gating
│   └── mechanical/
│       └── enclosure_spec.md       # IP68 enclosure, cable glands, and 22mm rockbolt bracket clamp
│
├── firmware/                       # Production ESP32-S3 embedded C++ firmware (PlatformIO)
│   ├── README.md                   # Build instructions, flashing guide, serial debug format
│   ├── platformio.ini              # Build environment configuration targeting ESP32-S3
│   ├── include/
│   │   ├── config.h                # Hardware pinouts, IN865 LoRa settings, threshold triggers
│   │   └── tinyml_weights.h        # Auto-generated baseline weights and decision thresholds
│   └── src/
│       ├── main.cpp                # System executive, FreeRTOS tasks & deep-sleep cycle manager
│       ├── sensors/                # Inclinometer (tilt) and 24-bit strain ADC drivers
│       ├── edge_ai/                # On-device TinyML circular buffer, EWMA & robust Z-score filter
│       └── telemetry/              # Compact 20-byte binary packet serializer with CRC-16
│
├── ml/                             # Edge AI & statistical intelligence pipeline
│   ├── README.md                   # Python environment setup & pipeline documentation
│   ├── requirements.txt            # Minimal verified dependencies
│   ├── MODEL_CARD.md               # Engineering model card (inputs, assumptions, failure modes)
│   ├── data_generator.py           # Deterministic strata deformation time-series generator
│   ├── train_anomaly_detector.py   # Baseline calculation & statistical parameter trainer
│   ├── tinyml_export.py            # C header generator exporting parameters for embedded firmware
│   └── evaluate_model.py           # Evaluation script computing Precision, Recall, and F1
│
├── data/                           # Stratigraphy, baseline and scenario reference datasets
│   ├── README.md                   # Data classification (SYNTHETIC/REFERENCE), CRS (EPSG:32645), schema
│   └── samples/
│       ├── baseline_nominal.json   # 24-hour nominal strata baseline telemetry
│       ├── subsidence_event.json   # Progressive multi-station subsidence event sequence
│       ├── moonidih_strata.json    # Stratigraphic borehole profile for Moonidih Colliery
│       └── generated_subsidence_dataset.json # Ground-truth benchmark dataset
│
├── presentation/                   # SIH 2026 hackathon pitch & evaluation material
│   ├── SIH26025_PITCH_BRIEF.md     # Executive summary, problem-solution alignment, cost analysis
│   ├── JUDGE_DEMO_WALKTHROUGH.md   # 5-minute repeatable demonstration script for evaluators
│   └── SYSTEM_ARCHITECTURE_DECK.md # Slide-by-slide architecture deck covering all system layers
│
├── docs/                           # Technical documentation & testing procedures
│   ├── ARCHITECTURE.md             # Complete end-to-end architectural blueprint
│   ├── STATUS.md                   # Transparent development status matrix
│   ├── TESTING.md                  # Comprehensive test matrix (sensor, AI, UI, E2E)
│   ├── REFERENCES.md               # Formal statutory, academic, and technical citations
│   └── postman/                    # Verified Postman telemetry ingestion API collection
│
└── src/                            # Full-Stack Next.js 16 + Supabase Digital Platform
    ├── app/                        # 12 operational dashboard views, GIS surveillance, Ingest API
    ├── components/                 # Industrial components, GIS canvas, telemetry charts
    ├── lib/                        # AI risk engine, deterministic simulator, alert engine, notifications
    └── (test files)                # 42 passing Vitest unit and integration tests
```

---

## 4. Hardware BOM Summary (Low-Cost Focus)

| Subsystem | Key Components | Unit Cost (INR) | Unit Cost (USD) |
|---|---|---|---|
| Core Processing & LoRa | ESP32-S3-WROOM-1 + Semtech SX1262 (IN865) | ₹ 1,180 | $ 14.20 |
| Transducers & 24-Bit ADC | BNO085 Inclinometer + TI ADS1220 24-bit ADC + Piezo | ₹ 1,420 | $ 17.10 |
| Power Subsystem | 3.2V 3200mAh LiFePO4 + TI TPS7A2533 Ultra-Low Noise LDO | ₹ 680 | $ 8.20 |
| Enclosure & Mounting | IP68 Die-cast Enclosure + SS304 Rockbolt Clamp Bracket | ₹ 1,150 | $ 13.85 |
| PCB & Passives | 4-Layer FR4 1.6mm PCB + M12 IP68 Brass Cable Glands | ₹ 420 | $ 5.05 |
| **Total Unit Production Cost** | — | **₹ 4,850** | **$ 58.40** |

*Complete itemized specifications, part numbers, and suppliers are documented in [BOM.md](file:///hardware/bom/BOM.md).*

---

## 5. Quickstart & Verification Guide

### 5.1 Web Platform & Dashboard (Next.js 16)

```bash
# 1. Install dependencies
npm install

# 2. Environment configuration
cp .env.example .env.local

# 3. Run automated test suite (42 tests)
npm run test

# 4. Run ESLint verification (0 warnings, 0 errors)
npm run lint

# 5. Build production bundle (Turbopack)
npm run build

# 6. Start local server
npm start
```
Access the operations dashboard at `http://localhost:3000`.

### 5.2 Embedded Firmware (ESP32-S3)

```bash
cd firmware
pio run                          # Compile firmware
pio run --target upload          # Flash to ESP32-S3
pio device monitor               # Open serial debug monitor (115200 baud)
```

### 5.3 Machine Learning Pipeline (Python)

```bash
# Generate synthetic strata data, train baseline, and benchmark performance
python ml/data_generator.py
python ml/train_anomaly_detector.py
python ml/tinyml_export.py
python ml/evaluate_model.py
```

---

## 6. Engineering Truth & Safety-Critical Disclaimers

> [!CAUTION]
> **Safety-Critical Geotechnical Operational Notice:**
> 1. **Anomaly Detection vs Collapse Prediction:** The SIH26025 platform detects abnormal acceleration in roof sag, borehole displacement, and rockbolt strain relative to calibrated baselines. It **does NOT** claim deterministic prediction of the exact hour or second of catastrophic mine collapse.
> 2. **Decision Support Only:** The system serves as early-warning decision support. Final evacuation and support intensification decisions remain the statutory responsibility of the certified Mine Manager and Safety Officer under DGMS CMR 2017.
> 3. **Intrinsic Safety Certification Boundary:** The hardware circuitry is designed with low-voltage power rails and current-limiting zener barriers for intrinsic safety (Ex 'i') compliance under IS/IEC 60079-11. However, **formal statutory testing and certification by CIMFR Dhanbad / DGMS has NOT yet been undertaken**. Physical deployment in operational gassy coal faces requires formal statutory certification.

---

## 7. Quality Assurance & Test Verification Results

* **ESLint Verification:** Exited `0` with **0 errors and 0 warnings**.
* **Vitest Automated Suite:** Exited `0` with **42 of 42 tests passing** across 9 test suites in ~300 ms.
* **Production Build:** Exited `0` with all **21 routes prerendered and optimized** via Next.js Turbopack.
* **Python AI Benchmark:** Exited `0` with **93.0% recall** and **83.6% accuracy** on labeled ground-truth subsidence sequences.
* **Secret Scan:** Repository-wide audit confirmed **0 leaked API keys, tokens, or credentials**.
