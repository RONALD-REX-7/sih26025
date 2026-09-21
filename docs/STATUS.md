# SIH26025 — Development Status & Engineering Verification Matrix

## Status Legend
* ✅ **Implemented & Verified:** Source code written, tested, and validated.
* 🟡 **Partially Implemented:** Functional prototype completed; field optimization ongoing.
* 🔵 **Demonstrated in Simulation:** Faithfully modeled and verified through the deterministic simulator.
* ⚪ **Planned Future Work:** Documented architecture ready for future field phase.
* 🔴 **Blocked / Unavailable:** Requires external regulatory testing or underground pit access.

---

## 1. Subsystem Verification Matrix

| Subsystem Area | Component / Feature | Status | Engineering Detail & Location |
|---|---|---|---|
| **Hardware** | Low-Cost Subsurface Node BOM | ✅ | Full itemized BOM in `/hardware/bom/BOM.md` (~₹4,850 unit cost) |
| **Hardware** | Electrical Wiring & Schematic | ✅ | Pinout and bus diagrams in `/hardware/schematics/system_schematic.md` |
| **Hardware** | IP68 Mechanical Enclosure | ✅ | Enclosure and rockbolt clamp spec in `/hardware/mechanical/enclosure_spec.md` |
| **Hardware** | Intrinsically Safe (Ex 'i') Certification | ⚪ | Circuit designed for intrinsic safety; formal CIMFR certification planned |
| **Firmware** | ESP32-S3 FreeRTOS Executive | ✅ | Clean PlatformIO C++ firmware in `/firmware/src/main.cpp` |
| **Firmware** | BNO085 / MPU6050 Inclinometer Driver | ✅ | I2C driver with digital filtering in `/firmware/src/sensors/` |
| **Firmware** | ADS1220 24-bit Strain ADC Driver | ✅ | SPI driver for vibrating wire bridge in `/firmware/src/sensors/` |
| **Firmware** | On-Device TinyML Outlier Filter | ✅ | EWMA and rolling Z-score filter in `/firmware/src/edge_ai/` |
| **Firmware** | Dynamic Telemetry Cadence Engine | ✅ | 300s nominal ➔ 10s alert mode automated switching |
| **Firmware** | Binary Packet Serialization | ✅ | 20-byte packed struct with CRC-16 error checking in `/firmware/src/telemetry/` |
| **Communication**| LoRa Sub-GHz RF Link (IN865) | 🟡 | Firmware packet logic verified; RF range bench-tested in lab |
| **Communication**| Gateway HTTPS Backhaul | ✅ | REST API integration via `/api/telemetry/ingest` |
| **Backend** | Ingestion API & Validation | ✅ | Next.js API route with Zod contract validation and auth |
| **Backend** | Postman API Test Collection | ✅ | Complete verified collection in `/docs/postman/` |
| **Persistence**| Supabase PostgreSQL Schema | ✅ | 9 relational tables, RLS policies, indexes, and realtime streams |
| **AI / Analytics**| Real-Time Anomaly Detection Engine | ✅ | Multi-tiered EWMA, Z-Score, and rate-of-change engine in `src/lib/ai/` |
| **AI / Analytics**| Spatial Inter-Station Correlation | ✅ | Real-time Pearson cross-node correlation ($r > +0.75$) |
| **AI / Analytics**| Multi-Modal Sensor Fusion | ✅ | Corroborates tilt, displacement, strain, and vibration |
| **AI / Analytics**| Deterministic Simulator | ✅ | PRNG engine with 8 realistic geomechanical scenarios |
| **Early Warning** | 5-State Risk State Machine | ✅ | Strictly enforces Normal, Advisory, Watch, Warning, Critical |
| **Early Warning** | Browser Audio Siren | ✅ | Web Audio API synthesizer for audible emergency alerts |
| **Safety Workflow**| DGMS CMR 112 Sign-Off Modal | ✅ | Statutory shift sign-off and mitigation action recording |
| **Audit** | Immutable Audit Trail | ✅ | Non-repudiable audit logging in `/audit` |
| **GIS** | Multi-Layer Vector Mine Canvas | ✅ | Interactive vector map with panel, goaf, fault, and asset overlays |
| **Testing** | Automated Test Suite | ✅ | 42 Vitest tests passing with 0 errors across 9 test suites |
| **Build** | Production Build & Linting | ✅ | Next.js Turbopack build passing, 0 ESLint errors/warnings |
| **Field Data** | Active Underground Mine Telemetry | 🔵 | Accurately simulated; live pit deployment pending DGMS approval |

---

## 2. Known Limitations & Research Boundaries

1. **Intrinsically Safe Physical Certification:** Testing at CIMFR (Dhanbad) requires a physical batch production run and specialized test chamber exposure. Laboratory testing confirms electrical current limitation, but official certification cannot be claimed until awarded.
2. **InSAR Surface Displacement:** Currently provided as an illustrative contextual macro-observation layer with documented ground resolution and pass intervals; direct real-time downlink from Sentinel-1 / NISAR requires integration with ISRO/NRSC data pipelines.
3. **Underground Tunnel Propagation:** LoRa RF range in coal mine galleries is subject to waveguide attenuation and bend losses (typically 200m to 800m per hop underground vs 8 km on surface); repeater nodes or leaky feeder cables are required for deep gallery coverage.
