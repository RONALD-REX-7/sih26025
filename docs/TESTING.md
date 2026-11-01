# SIH26025 — Testing & Quality Assurance Plan

## 1. Test Philosophy & 10-Tier Evidence Standard

The SIH26025 validation suite enforces a strict verification discipline across all physical, embedded, mathematical, and web layers. In accordance with the **10-Tier Evidence Taxonomy Standard**, every test is explicitly classified by evidence type:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TESTING HIERARCHY                                │
│                                                                             │
│  [End-to-End Ingestion & Alert Dispatch]  (API Integration + Webhooks)      │
│         ▲                                                                   │
│  [Mathematical Risk & Spatial Fusion]    (Vitest Domain Test Suite)         │
│         ▲                                                                   │
│  [Edge TinyML & Anomaly Rejection]       (Python Benchmarks + C++ Tests)    │
│         ▲                                                                   │
│  [Hardware ADC & Transducer Noise Floor] (Bench Signal Generator Tests)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Test Execution Summary

| Test Suite | Total Tests | Passed | Failed | Duration | Evidence Tier | Environment |
|---|---|---|---|---|:---:|---|
| AI Risk Engine (`risk-engine.test.ts`) | 6 | 6 | 0 | 102 ms | **Tier 4** | Vitest / Happy-DOM |
| Alert State Machine (`alert-engine.test.ts`) | 4 | 4 | 0 | 17 ms | **Tier 4** | Vitest / Happy-DOM |
| Telemetry Ingest API (`route.test.ts`) | 6 | 6 | 0 | 57 ms | **Tier 4** | Vitest / Next.js Server |
| Full Domain Pipeline (`integration.test.ts`) | 2 | 2 | 0 | 24 ms | **Tier 4** | Vitest |
| Deterministic Simulator (`simulator.test.ts`)| 8 | 8 | 0 | 45 ms | **Tier 4** | Vitest |
| Risk States & Enums (`risk-states.test.ts`) | 5 | 5 | 0 | 12 ms | **Tier 4** | Vitest |
| Telemetry Schema Contract (`contract.test.ts`)| 4 | 4 | 0 | 15 ms | **Tier 4** | Vitest |
| Notification Manager (`notifications.test.ts`)| 4 | 4 | 0 | 18 ms | **Tier 4** | Vitest |
| GIS Layer Bounds & Nodes (`gis.test.ts`) | 3 | 3 | 0 | 14 ms | **Tier 4** | Vitest |
| **Total Automated Software Suite** | **42** | **42** | **0** | **~304 ms** | **Tier 4** | **100% Pass Rate** |

---

## 3. Itemized Test Protocols & Evidence Classification

### TEST-01: Inclinometer Noise Floor & Digital Smoothing
* **Evidence Tier:** **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation / raw capture required for independent verification*).
* **Input:** BNO085 static bench reading under zero mechanical vibration for 10 minutes.
* **Test Condition:** Laboratory bench, ambient temperature 25°C.
* **Procedure:** Sample raw acceleration registers at 10 Hz; compute pitch and roll via trigonometric projection; apply exponential filter ($\alpha = 0.2$). Firmware driver probes I2C address `0x4A`, with fallback to `0x68` (MPU6050 register map).
* **Expected Output:** Angular noise envelope $< \pm 0.02^\circ$.
* **Actual Output:** Maximum peak-to-peak jitter observed: **$\pm 0.014^\circ$**.
* **Verification Status:** **PASS** (Owner-reported bench result; no raw CSV time-series dataset committed in repository).

### TEST-02: 24-Bit ADC Linearity & Resolution (ADS1220)
* **Evidence Tier:** **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation / calibration log required for independent verification*).
* **Input:** Precision decade resistance box simulating vibrating wire strain bridge ($\Delta R = 0.1\ \Omega\text{ to }10\ \Omega$).
* **Test Condition:** Excitation voltage = 3.3V, PGA gain = 32x.
* **Procedure:** Incremental resistance step stimulus; SPI read of ADS1220 24-bit conversion registers.
* **Expected Output:** Linear voltage response ($R^2 > 0.999$), effective resolution $\le 0.5\ \mu\epsilon$.
* **Actual Output:** Measured linearity **$R^2 = 0.9998$**, noise floor **$0.22\ \mu\epsilon$**.
* **Verification Status:** **PASS** (Owner-reported bench result; calibration logs and configuration write routines not committed in repository).

### TEST-03: Transient Blasting False Alarm Rejection
* **Evidence Tier:** **Tier 5: Simulation Result** / **Tier 4: Automated Software Test Passed**.
* **Input:** Synthetic blasting shock profile: vibration burst ($6.5\text{ mm/s}$ for 3 seconds), zero sustained displacement.
* **Test Condition:** Simulator scenario `MACHINERY_TRANSIENT`.
* **Expected Output:** System must NOT escalate to **Warning** or **Critical** risk states; must remain at **Advisory** or return to **Normal**.
* **Actual Output:** Transient flagged as isolated acoustic emission; persistence filter ($> 18\text{s}$) prevented false alert.
* **Verification Status:** **PASS** (Programmatically verified in `simulator.test.ts` and `alert-engine.test.ts`).

### TEST-04: Multi-Station Spatial Corroboration
* **Evidence Tier:** **Tier 4: Automated Software Test Passed**.
* **Input:** Station SN-102 reports rapid roof sag ($1.8\text{ mm/hr}$), but adjacent stations SN-101 and SN-103 report nominal baseline ($< 0.1\text{ mm/hr}$, Pearson $r = +0.12$).
* **Test Condition:** Isolated transducer drift scenario.
* **Expected Output:** Risk Engine identifies lack of spatial corroboration ($r < +0.75$); marks station for maintenance inspection rather than triggering mine-wide evacuation.
* **Actual Output:** System generated **Sensor Fault Advisory (SN-102)**; colliery risk state maintained at **Normal**.
* **Verification Status:** **PASS** (Programmatically verified in `risk-engine.test.ts`).

### TEST-05: Ingestion API Authorization & Schema Validation
* **Evidence Tier:** **Tier 4: Automated Software Test Passed**.
* **Input:** HTTP POST to `/api/telemetry/ingest` with missing `x-api-key` header and malformed JSON payload.
* **Test Condition:** Automated Next.js route testing with mocked Supabase client.
* **Expected Output:** 401 Unauthorized for missing API key; 400 Bad Request with descriptive Zod error issues for malformed fields.
* **Actual Output:** Returns HTTP 401 and HTTP 400 respectively with zero server crash.
* **Verification Status:** **PASS** (Programmatically verified in `src/app/api/telemetry/ingest/route.test.ts`).

### TEST-06: Edge TinyML Anomaly Recall & Accuracy Benchmark
* **Evidence Tier:** **Tier 5: Simulation Result (Synthetic Geotechnical Benchmark)**.
* **Input:** 1,000 synthetic geomechanical telemetry vectors generated from Jharia strata subsidence equations (`data_generator.py`, seed=123).
* **Test Condition:** Execution of `python ml/evaluate_model.py`.
* **Expected Output:** Anomaly recall $> 90.0\%$, overall accuracy $> 80.0\%$.
* **Actual Output:** Recall = **93.00%**, Accuracy = **83.60%**, Precision = **55.36%**, False Alarm Rate = **18.75%**.
* **Verification Status:** **PASS** (Independently reproducible via `python ml/evaluate_model.py`).

---

## 4. How to Run Test Suite

```bash
# 1. Run automated Vitest test suite (42 unit and integration tests)
npm run test

# 2. Run Next.js production build verification
npm run build

# 3. Run ESLint validation
npm run lint

# 4. Run Python AI benchmark
python ml/evaluate_model.py

# 5. Compile ESP32-S3 firmware in PlatformIO
cd firmware && pio run
```
