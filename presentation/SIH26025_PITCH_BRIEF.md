# SIH2026 — SIH26025 Pitch Brief

## Project Identity
* **Problem Statement:** “Development of an AI-enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India.”
* **Ministry / Nodal Body:** Ministry of Coal / Coal India Limited (CIL)
* **Team Reference:** SIH26025

---

## 1. Executive Summary & Problem Formulation

Underground coal mining in India accounts for vital domestic energy security but poses severe ground control hazards. In bord-and-pillar depillaring and mechanised longwall workings, strata failure and unexpected surface subsidence cause catastrophic roof collapses, damage surface civil infrastructure (railways, pipelines, villages), and cause tragic loss of life.

### The Commercial Gap
Existing commercial geotechnical monitoring systems imported from overseas cost **₹1,50,000 to ₹4,50,000 per station**. As a result, Indian collieries deploy only 2 to 4 stations per district, leaving vast extraction areas unmonitored.

### The SIH26025 Solution
SIH26025 delivers a complete, vertically integrated hardware-to-cloud solution:
1. **Ultra-Low-Cost Hardware Node:** Built with precision MEMS inclinometry, 24-bit delta-sigma strain bridge ADC, and sub-GHz LoRa (IN865), achieving a total unit fabrication cost of **₹4,850 (~$58)** — a **30x cost reduction**.
2. **On-Device Edge TinyML:** Real-time rate-of-change and robust Z-score calculation on an ESP32-S3 microcontroller, dynamically escalating reporting from 300s to 10s upon detecting anomalous ground sag.
3. **Multi-Station Spatial Sensor Fusion:** Rejects false alarms by requiring Pearson correlation agreement ($r > +0.75$) across adjacent stations and multi-modal agreement between tilt, displacement, strain, and acoustic emission.
4. **DGMS Statutory Alignment:** Built around the mandatory requirements of the **Coal Mines Regulations (CMR) 2017 Regulation 112** (Strata Control and Monitoring Plan - SCAMP), featuring shift sign-offs and immutable audit trails.

---

## 2. Key Competitive Advantages

| Evaluation Dimension | Imported Commercial Stations | SIH26025 Platform |
|---|---|---|
| **Unit Fabrication Cost** | ₹ 1,50,000 – ₹ 4,50,000 | **₹ 4,850 (~$58 USD)** |
| **Telemetry Protocol** | Proprietary / High-license cellular | **Open Sub-GHz LoRa (IN865)** |
| **Battery Autonomy** | 6–12 months | **3+ Years (3.2V 3200mAh LiFePO4)** |
| **Edge Intelligence** | Raw thresholding only | **On-device EWMA + Robust Z-Score** |
| **Spatial Cross-Corroboration**| Post-processed manual analysis | **Real-time automated inter-station fusion** |
| **Regulatory Compliance** | Generic SaaS alerts | **DGMS CMR 2017 Form IV & Reg 112 sign-off** |
| **Demonstrability** | Proprietary hardware locked | **100% Deterministic Simulator built-in** |
