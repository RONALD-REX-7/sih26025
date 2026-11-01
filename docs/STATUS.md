# SIH26025 — Development Status & Engineering Evidence Matrix

> [!IMPORTANT]
> **Owner-Confirmed Engineering Baseline**:
> - **Firmware Reality**: ESP32-S3 firmware source code exists, is fully written in C++, and compiles deterministically (`PlatformIO Core 6.1.19`, Espressif 32 platform).
> - **Hardware Reality**: Physical sensing hardware is **not fully integrated**. Breakout boards and bench testing have been partially exercised, but the system is **not a fully integrated physical prototype** (Tier 9) or a field-deployed system (Tier 10).
> - **Telemetry Reality**: Certain sensor measurements are real owner-reported bench values, while dashboard time-series and underground station telemetry represent a **calibrated synthetic simulation** modeled after Jharia coalfield strata mechanics.
> - **Operational Boundary**: SIH26025 is an academic engineering prototype and software architecture developed for Smart India Hackathon 2026. It is **not** an officially certified or field-validated mine monitoring system.

---

## 1. Ten-Tier Evidence Taxonomy Standard

Every subsystem, capability, and technical figure in this repository is strictly classified according to the following 10-tier evidence hierarchy:

| Tier | Classification | Operational Definition & Criteria |
| :---: | :--- | :--- |
| **Tier 1** | **Design / Documentation Completed** | Theoretical formulation, pinout mappings, circuit schematics, mechanical drawings, or itemized BOM cost tables without physical silicon assembly. |
| **Tier 2** | **Source Code Implemented** | Source code or firmware written and syntactically structured in the repository, but lacking formal execution logs. |
| **Tier 3** | **Software Compilation Passed** | Code successfully built by a target compiler / toolchain (`pio run`, `npm run build`, `tsc`). |
| **Tier 4** | **Automated Software Test Passed** | Validated by programmatic unit or integration test suites (`vitest run`, automated API contract tests). |
| **Tier 5** | **Simulation Result** | Mathematical, numerical, or synthetic model output generated in software (e.g. Python PRNG geomechanical time-series). |
| **Tier 6** | **Actual Physical Measurement with Supporting Evidence** | Hardware measurement verified by raw time-series CSVs, logic analyzer captures, or instrument logs committed in the repository. |
| **Tier 7** | **Owner-Reported Measurement without Raw Evidence** | Physical bench measurement reported by the system designer, but lacking raw data files in the repository (**"Owner confirmation/evidence required"**). |
| **Tier 8** | **Partial Physical Integration** | Microcontroller connected to individual breakout boards or transducers on a test bench with basic I/O verified. |
| **Tier 9** | **Fully Integrated Physical Prototype** | Complete physical system (sensors, MCU, enclosure, power circuit, radio) assembled and operational as a unified unit. |
| **Tier 10** | **Field Deployment** | Long-term operational deployment and validation in an actual industrial underground mine environment under DGMS regulations. |

---

## 2. Subsystem Verification Matrix

| Subsystem Area | Component / Feature | Evidence Tier | Operational Reality & Repository Location |
|---|---|:---:|---|
| **Hardware** | Low-Cost Subsurface Node BOM | **Tier 1** | Itemized engineering cost breakdown (~₹4,850 unit cost) in `/hardware/bom/BOM.md` and `bom.csv`. Projected prototype fabrication estimate, not a procurement invoice. |
| **Hardware** | Electrical Wiring & Schematic | **Tier 1** | Circuit schematics and pinout mapping in `/hardware/schematics/system_schematic.md`. |
| **Hardware** | IP68 Mechanical Enclosure | **Tier 1** | Gainta G2108C mechanical specification and rockbolt clamp drawing in `/hardware/mechanical/enclosure_spec.md`. |
| **Hardware** | Physical Sensor Integration | **Tier 8** | Partial test bench wiring of breakout modules. Multi-sensor physical bus integration is incomplete. |
| **Hardware** | Intrinsically Safe (Ex 'i') Certification | **Tier 1** | Intrinsic safety design rules documented; formal CIMFR/DGMS physical certification is planned future work. |
| **Firmware** | ESP32-S3 Firmware Compilation | **Tier 3** | PlatformIO C++ firmware in `/firmware/` compiles cleanly for `esp32-s3-devkitc-1` (RAM: 6.4%, Flash: 9.9%). |
| **Firmware** | BNO085 / MPU6050 Inclinometer Driver | **Tier 2 / 8** | I2C driver in `/firmware/src/sensors/tilt_sensor.cpp`. Probes 0x4A, reads MPU6050 register map at 0x68. |
| **Firmware** | ADS1220 24-bit Strain ADC Driver | **Tier 2 / 8** | SPI driver in `/firmware/src/sensors/strain_adc.cpp`. Resets chip and reads 24-bit conversion registers. |
| **Firmware** | On-Device TinyML Statistical Filter | **Tier 2** | Circular buffer EWMA and rolling Z-score algorithm implemented in `/firmware/src/edge_ai/tinyml_filter.cpp`. |
| **Firmware** | Dynamic Telemetry Interval Manager | **Tier 2** | Adaptive interval switching logic (300s nominal $\to$ 10s alert) in `/firmware/src/main.cpp`. |
| **Firmware** | Binary Packet Serialization | **Tier 2** | 20-byte packed telemetry struct with CRC-16 error checking in `/firmware/src/telemetry/lora_packet.cpp`. |
| **Communication**| LoRa RF Link (IN865) | **Tier 1 / 7** | Theoretical link budget (8 km surface / 2.5 km underground line-of-sight) in `hardware/README.md`. Lab bench RF transmission is owner-reported. |
| **Communication**| Gateway HTTPS Backhaul | **Tier 4** | REST ingestion endpoint verified via automated tests in `src/app/api/telemetry/ingest/route.test.ts`. |
| **Backend** | Ingestion API & Validation | **Tier 4** | Next.js API route with Zod schema contract and rate-limiting verified in CI. |
| **Persistence**| Supabase PostgreSQL Schema | **Tier 2** | 9 relational tables, RLS policies, indexes, and realtime migration scripts in `supabase/`. |
| **AI / Analytics**| Real-Time Anomaly Detection Engine | **Tier 4** | Multi-tiered EWMA, Z-Score, and rate-of-change engine in `src/lib/ai/` verified by 6 automated unit tests. |
| **AI / Analytics**| Spatial Inter-Station Correlation | **Tier 4** | Pearson cross-node correlation ($r > +0.75$) verified in `src/lib/ai/risk-engine.test.ts`. |
| **AI / Analytics**| Strata Anomaly Recall & Accuracy | **Tier 5** | Benchmark evaluated on 1,000 synthetic geotechnical vectors in `ml/evaluate_model.py` (93.00% recall, 83.60% accuracy). |
| **AI / Analytics**| Deterministic Simulator | **Tier 4** | PRNG simulation engine with 8 realistic geomechanical scenarios verified in `src/lib/simulator/simulator.test.ts`. |
| **Early Warning** | 5-State Risk State Machine | **Tier 4** | Enforces Normal, Advisory, Watch, Warning, Critical states; verified in `src/lib/alerts/alert-engine.test.ts`. |
| **GIS Mapping** | Multi-Layer Vector Mine Canvas | **Tier 4** | Interactive SVG mine canvas with panel, goaf, and sensor overlays verified in `src/lib/domain/gis.test.ts`. |
| **Testing** | Automated Software Test Suite | **Tier 4** | 42 Vitest unit and integration tests passing (100%) across 9 test files in CI. |
| **Field Data** | Live Underground Pit Telemetry | **Tier 5** | Dashboard telemetry represents calibrated simulation; live colliery deployment is planned (Tier 10). |

---

## 3. Forensic Investigation of Specific Technical Claims

In adherence to strict auditing directives, the table below provides a forensic breakdown of the six prominent technical claims associated with SIH26025:

### Claim 1: BNO085 Inclinometer Noise Envelope ($\pm 0.014^\circ$)
- **Stated Metric:** Maximum observed peak-to-peak angular jitter of $\pm 0.014^\circ$ under static conditions.
- **Source Files:** `docs/TESTING.md` (TEST-01); `firmware/src/sensors/tilt_sensor.cpp`.
- **Methodology & Instrument:** BNO085 digital inclinometer sampled at 10 Hz on a static laboratory bench at 25°C with an exponential smoothing filter ($\alpha = 0.2$).
- **Implementation Finding:** `tilt_sensor.cpp` probes I2C address `0x4A` (BNO085), but falls back to and reads acceleration registers (`0x3B`) from address `0x68` (MPU6050 register map).
- **Dataset / Raw Evidence:** No raw 10-minute time-series CSV, logic analyzer export, or oscilloscope capture is committed in the repository.
- **Evidence Classification:** **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation / raw capture required for independent reproducibility*).

### Claim 2: ADS1220 24-Bit ADC Linearity ($R^2 = 0.9998$)
- **Stated Metric:** Linear voltage response with coefficient of determination $R^2 = 0.9998$.
- **Source Files:** `docs/TESTING.md` (TEST-02); `firmware/src/sensors/strain_adc.cpp`.
- **Methodology & Instrument:** Precision decade resistance box ($\Delta R = 0.1\ \Omega\text{ to }10\ \Omega$) simulating a vibrating-wire strain gauge bridge under 3.3V excitation and 32x PGA gain.
- **Implementation Finding:** `strain_adc.cpp` issues a soft reset command (`ADS1220_CMD_RESET`), which restores default power-up register values (Gain = 1). The driver code calculates microstrain assuming Gain = 32 and $V_{\text{REF}} = 2.048\text{ V}$.
- **Dataset / Raw Evidence:** No raw resistance vs ADC code calibration curve or regression script is committed in the repository.
- **Evidence Classification:** **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation / calibration log required for independent reproducibility*).

### Claim 3: ADS1220 Strain Noise Floor ($0.22\ \mu\epsilon$)
- **Stated Metric:** Effective strain noise floor of $0.22\ \mu\epsilon$.
- **Source Files:** `docs/TESTING.md` (TEST-02); `firmware/src/sensors/strain_adc.cpp`.
- **Methodology & Instrument:** Static noise measurement under steady bridge excitation.
- **Dataset / Raw Evidence:** No raw ADC sample log or noise histogram is committed in the repository.
- **Evidence Classification:** **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation / noise log required for independent reproducibility*).

### Claim 4: TinyML Strata Anomaly Recall (93.00%) & Accuracy (83.60%)
- **Stated Metric:** 93.00% anomaly recall and 83.60% accuracy on a 1,000-vector benchmark.
- **Source Files:** `ml/evaluate_model.py` (lines 14–83); `ml/data_generator.py`; `ml/MODEL_CARD.md`.
- **Methodology & Instrument:** Synthetic geomechanical time-series generator modeling Barakar sandstone/shale subsidence equations (Jharia coalfield empirical profiles) evaluated against a calibrated rate-of-change and temporal persistence decision rule.
- **Dataset / Raw Evidence:** Fully reproducible in the repository via `python ml/evaluate_model.py` (seed=123). Verified benchmark output:
  - Total Samples: 1,000
  - Accuracy: 83.60%
  - Recall: 93.00%
  - Precision: 55.36%
  - False Alarm Rate: 18.75%
- **Evidence Classification:** **Tier 5: Simulation Result** (*Independently reproducible synthetic software benchmark*).

### Claim 5: Unit Fabrication Cost Estimate (₹4,850 / ~$58 USD)
- **Stated Metric:** Unit production cost of ₹4,850 (~$58.40 USD), representing a 30x cost reduction compared to imported commercial mine extensometer stations.
- **Source Files:** `hardware/bom/BOM.md`; `hardware/bom/bom.csv`.
- **Methodology:** Itemized commercial component cost breakdown across 13 line items (ESP32-S3, SX1262, antenna, BNO085, ADS1220, piezo, LiFePO4 battery, Gainta G2108C enclosure, M12 cable glands, SS304 brackets).
- **Dataset / Raw Evidence:** Itemized component pricing documented in `bom.csv`.
- **Evidence Classification:** **Tier 1: Design / Documentation Completed** (*Engineering prototype cost projection; not an audited procurement invoice*).

### Claim 6: LoRa Sub-GHz Physical Range (8 km Surface / 2.5 km Underground)
- **Stated Metric:** Up to 8 km surface line-of-sight and 2.5 km underground gallery transmission.
- **Source Files:** `docs/STATUS.md` (lines 26, 50); `hardware/README.md` (line 33); `firmware/src/telemetry/lora_packet.cpp`.
- **Methodology:** Theoretical radio link budget calculation based on Semtech SX1262 transceiver (+20 dBm TX power, -148 dBm sensitivity, IN865 band). Laboratory bench RF transmission noted.
- **Dataset / Raw Evidence:** No empirical underground tunnel propagation logs, RSSI vs distance curves, or packet loss rate datasets are committed in the repository.
- **Evidence Classification:**
  - Link Budget Calculation: **Tier 1: Design / Documentation Completed** (theoretical calculation).
  - Lab Bench RF Transmission: **Tier 7: Owner-Reported Measurement without Raw Evidence** (*Owner confirmation required*).
  - Underground Field Range: **Tier 1: Theoretical Projection** (*Field validation required under DGMS approval*).

---

## 4. Known Research Boundaries & Practical Limitations

1. **Intrinsically Safe Physical Certification:** Testing at CIMFR (Dhanbad) requires a physical batch production run and specialized spark-chamber testing. Laboratory designs incorporate current-limiting resistors and LiFePO4 chemistry, but formal statutory certification cannot be claimed without official testing.
2. **Underground Tunnel Propagation Realities:** LoRa RF propagation in coal mine galleries experiences severe waveguide attenuation, corner diffraction losses, and tilt-induced fading (typically 200m to 800m per hop underground vs 8 km on surface); repeater nodes or leaky-feeder backhaul cables are necessary for deep gallery coverage.
3. **InSAR Surface Displacement:** Currently provided as an illustrative contextual macro-observation layer with documented ground resolution and pass intervals; direct real-time downlink from Sentinel-1 / NISAR requires integration with ISRO/NRSC data pipelines.
