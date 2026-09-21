# SIH26025 — Full End-to-End System Architecture

## 1. System Pipeline Overview

The SIH26025 project bridges subsurface physical sensing with digital statistical intelligence to provide real-time early warning of strata failure and subsidence in underground coal mines.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHYSICAL & EMBEDDED LAYER                                       │
│                                                                                                   │
│  [Strata Support / Roofbolt]                                                                      │
│          │                                                                                        │
│          ├──► Dual-Axis Digital Inclinometer (BNO085) ─────────────► I2C Bus                     │
│          ├──► 24-Bit Sigma-Delta Strain ADC (ADS1220) ─────────────► SPI Bus                     │
│          └──► Piezoelectric Microseismic Geophone ─────────────────► ADC1                         │
│                                                                        │                          │
│                                                                        ▼                          │
│  [ESP32-S3 Edge Controller] ───────────────────────────────────────────────────────────────┐      │
│  • FreeRTOS Multi-Tasking Executive                                                        │      │
│  • Circular Buffer Data History (N = 30)                                                   │      │
│  • On-Device TinyML / Robust Z-Score Filter                                                │      │
│  • Dynamic Cadence Engine (300s Nominal / 10s Alert Mode)                                  │      │
│  • CRC-16-CCITT Binary Packet Serialization                                                │      │
│  └─────────────────────────────────┬───────────────────────────────────────────────────────┘      │
│                                    │ SPI                                                          │
│                                    ▼                                                              │
│  [SX1262 LoRa Transceiver (IN865: 865.2 MHz, +20dBm)] ─────────────────────────────────────┐      │
└────────────────────────────────────┼───────────────────────────────────────────────────────┼──────┘
                                     │                                                       │
                                     │ RF LoRa Link (Underground Tunnels / Borehole Cables)  │
                                     ▼                                                       ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  COMMUNICATION & INGESTION LAYER                                  │
│                                                                                                   │
│  [Colliery Gateway / Pit-Bottom Telemetry Concentrator]                                           │
│  • LoRa Radio Concentrator (SX1302 / SX1303 Baseband)                                             │
│  • Edge Buffer & Ethernet / 4G Cellular Backhaul                                                  │
│                                    │                                                              │
│                                    │ HTTPS POST (TLS 1.3) with `x-api-key` Header                 │
│                                    ▼                                                              │
│  [Next.js 16 Telemetry Ingestion API]                                                             │
│  • Endpoint: `/api/telemetry/ingest`                                                              │
│  • Zod Contract Validation (`TelemetryBatchPayload`)                                              │
│  • De-duplication & Timestamp Validation                                                          │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA PERSISTENCE & MULTI-NODE FUSION                                │
│                                                                                                   │
│  [Supabase PostgreSQL + Realtime Engine]                                                           │
│  • Sensor Nodes, Extraction Panels, Telemetry Readings Tables                                     │
│  • Row-Level Security (RLS) & Role-Based Access Control (RBAC)                                    │
│  • WebSocket Subscriptions for Live Dashboard Streaming                                           │
│                                    │                                                              │
│                                    ▼                                                              │
│  [Hybrid Statistical & AI Risk Engine]                                                            │
│  • Stage 1: Median Absolute Deviation (MAD) & Robust Z-Scores                                     │
│  • Stage 2: Exponentially Weighted Moving Average (EWMA) & Rate-of-Change                         │
│  • Stage 3: Pearson Inter-Station Spatial Correlation ($r > +0.75$)                                │
│  • Stage 4: Multi-Modal Sensor Agreement (Tilt + Disp + Strain + Vib)                             │
│                                    │                                                              │
│                                    ▼                                                              │
│  [5-State Safety Machine]                                                                         │
│  • Normal (1) ➔ Advisory (2) ➔ Watch (3) ➔ Warning (4) ➔ Critical (5)                             │
└────────────────────────────────────┬──────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DECISION SUPPORT & ACTION LAYER                                     │
│                                                                                                   │
│  [Early Warning & Dispatch Center]                                                                │
│  • Audio Siren Synthesizer (Oscillator Web Audio API)                                             │
│  • Multi-Channel Notifications (In-App, SMS, Email, Webhook)                                      │
│  • DGMS CMR 2017 Regulation 112 Statutory Acknowledgment Modal                                    │
│  • Non-Repudiable Cryptographic Audit Log (`/audit`)                                              │
│  • Operational Multi-Layer GIS Canvas (`/gis`)                                                    │
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Implementation Status

| System Layer | Subsystem / Component | Implementation Status | Implementation Notes |
|---|---|---|---|
| **Physical** | Sensor Node Hardware Design | **IMPLEMENTED** | Complete schematic, BOM, power budget, and enclosure spec in `/hardware` |
| **Physical** | Flameproof / Ex 'i' Certification | **PLANNED** | Laboratory PoC completed; formal CIMFR/DGMS testing pending |
| **Firmware** | ESP32-S3 FreeRTOS Firmware | **IMPLEMENTED** | Full C++ source in `/firmware`, including drivers and binary packet encoder |
| **Firmware** | On-Device TinyML Outlier Filter| **IMPLEMENTED** | Rolling Z-score and EWMA filter running on microcontroller |
| **Telemetry**| Sub-GHz LoRa (IN865) Protocol | **IMPLEMENTED** | 20-byte packed binary format with CRC-16 error checking |
| **Ingest** | HTTP REST Telemetry Ingest API | **IMPLEMENTED** | `/api/telemetry/ingest` with Zod validation and API key authentication |
| **Database** | Supabase PostgreSQL Schema | **IMPLEMENTED** | 9 tables with RLS policies, foreign keys, and realtime publications |
| **AI / ML** | Hybrid Statistical Risk Engine | **IMPLEMENTED** | Real-time Z-score, rate-of-change, EWMA, and spatial correlation |
| **AI / ML** | Deterministic Simulator | **IMPLEMENTED** | Seedable PRNG engine supporting 8 geomechanical scenarios |
| **UI / UX** | Industrial Dashboard Shell | **IMPLEMENTED** | 12 operational routes, responsive desktop/tablet layouts, zero linter warnings |
| **GIS** | Multi-Layer Vector Mine Canvas | **IMPLEMENTED** | SVG vector canvas with geological faults, extraction panels, and goaf lines |
| **Alerting** | DGMS CMR 112 Sign-Off & Siren | **IMPLEMENTED** | In-browser synthesizer siren, shift sign-off modal, immutable audit trail |
