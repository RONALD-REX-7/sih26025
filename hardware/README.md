# SIH26025 — Subsurface Sensor Node Hardware Architecture

## 1. System Overview

The SIH26025 hardware architecture specifies a low-cost, ultra-low-power, multi-parametric geotechnical sensing node engineered for early detection of strata movement, roof sagging, and surface subsidence in underground coal mines.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           UNDERGROUND SENSOR NODE (SN-XXX)                                 │
│                                                                                             │
│  ┌────────────────────────┐         ┌────────────────────────────────────────────────────┐  │
│  │ Geotechnical Sensors   │         │ ESP32-S3 Microcontroller (Dual Core 240MHz)        │  │
│  │                        │         │                                                    │  │
│  │ • Dual-Axis Tiltmeter  ├──I2C───►│ • FreeRTOS Scheduler                              │  │
│  │   (BNO085 / MPU6050)   │         │ • Local Circular Buffer (N = 50)                   │  │
│  │                        │         │ • Edge TinyML / Robust Z-Score Filter              │  │
│  │ • 24-Bit Sigma-Delta   ├──SPI───►│ • CRC16 Binary Packet Encoder                      │  │
│  │   ADC (ADS1220IPWR)    │         │ • Dynamic Telemetry Interval Manager (300s / 10s)  │  │
│  │   for Vibrating Wire   │         │                                                    │  │
│  │   Strain / Load Cells  │         └─────────────────────────┬──────────────────────────┘  │
│  │                        │                                   │ SPI                         │
│  │ • Piezo-Geophone (RMS) ├──ADC───►                          ▼                             │
│  └────────────────────────┘                  ┌─────────────────────────────────┐            │
│                                              │ SX1262 LoRa Transceiver         │            │
│  ┌────────────────────────┐                  │ Frequency: 865.2 MHz (IN865)    │            │
│  │ Power Management       │                  │ TX Power: +20 dBm (100 mW)      │            │
│  │ • 3.2V 3200mAh LiFePO4 │                  │ Antenna: 3dBi Fibreglass Whip   │            │
│  │ • CN3791 MPPT Solar /  ├─────────────────►└────────────────┬────────────────┘            │
│  │   Intrinsically Safe   │                                   │                             │
│  │   Charging Barrier     │                                   │ RF LoRa (865 MHz)           │
└───────────────────────────────────────────────────────────────┼─────────────────────────────┘
                                                                │
                                                                ▼  (Up to 2.5 km underground line-of-sight / 8 km surface)
                                              ┌──────────────────────────────────┐
                                              │ Colliery LoRaWAN Gateway         │
                                              │ (Surface Substation / Pit Bottom)│
                                              │ • Ethernet / 4G LTE Backhaul     │
                                              └─────────────────┬────────────────┘
                                                                │ HTTPS / TLS 1.3
                                                                ▼
                                              ┌──────────────────────────────────┐
                                              │ SIH26025 Digital Platform API    │
                                              │ `/api/telemetry/ingest`          │
                                              └──────────────────────────────────┘
```

---

## 2. Low-Cost Engineering Rationale

Commercial subsurface monitoring stations deployed in Indian mines (predominantly imported from Australia, South Africa, or Germany) cost between **₹1,50,000 and ₹4,50,000 per station**. This prohibitive cost results in sparse sensor deployment across vast bord-and-pillar or longwall districts.

SIH26025 reduces unit fabrication cost to **₹4,850 (~$58 USD)** by:
1. Utilizing high-volume commercial off-the-shelf (COTS) MEMS sensors with precision digital filtering.
2. Integrating a 24-bit delta-sigma ADC with internal PGA for direct strain bridge interfacing, eliminating expensive external instrumentation amplifiers.
3. Leveraging sub-GHz LoRa (IN865 band) unlicensed spectrum, avoiding proprietary wireless protocol licensing.
4. Using an ESP32-S3 microcontroller with native hardware cryptography, floating-point units, and deep sleep consumption below 15 µA.

---

## 3. Power Budget & Battery Longevity Analysis

The node operates in two dynamic states:
- **Nominal Mode:** Stratum stable. Telemetry transmitted once every 300 seconds (5 minutes).
- **Advisory / Event Mode:** Local threshold breached ($|z| > 2.5$). Telemetry rate escalates to once every 10 seconds.

| Subsystem | Active Current | Active Duration | Standby Current | Standby Duration | Avg Current (Nominal) |
|---|---|---|---|---|---|
| ESP32-S3 CPU | 45 mA | 120 ms | 12 µA | 299.88 s | 0.030 mA |
| BNO085 Tiltmeter | 15 mA | 80 ms | 5 µA | 299.92 s | 0.009 mA |
| ADS1220 ADC + Bridge | 8 mA | 100 ms | 1 µA | 299.90 s | 0.004 mA |
| SX1262 LoRa TX (+20dBm)| 118 mA | 95 ms | 1.2 µA | 299.90 s | 0.039 mA |
| Voltage Regulator Quiescent| — | — | 15 µA | Continuous | 0.015 mA |
| **Total Weighted Nominal**| — | — | — | — | **~0.097 mA (97 µA)**|

### Autonomy Calculation
* **Battery Capacity:** 3.2V 3200 mAh LiFePO4 (Chemistry chosen for intrinsic thermal stability in gassy mines; zero risk of thermal runaway compared to Li-Ion).
* **Usable Capacity (80% DoD):** $3200 \times 0.80 = 2560\text{ mAh}$.
* **Nominal Daily Energy:** $0.097\text{ mA} \times 24\text{ h} = 2.33\text{ mAh/day}$.
* **Theoretical Autonomy (Zero Charging):** $\frac{2560\text{ mAh}}{2.33\text{ mAh/day}} \approx \mathbf{1,098\text{ days (3.0 years)}}$.
* **Continuous Emergency Mode (10s TX):** Delivers **18.5 days** of continuous uninterrupted high-frequency telemetry.

---

## 4. Statutory Mine Safety & Certification Boundary

> [!CRITICAL]
> **Engineering Disclosure on Intrinsic Safety & DGMS Certification:**
> The hardware designs documented in this repository represent a **laboratory prototype and functional proof-of-concept (PoC)**.
> 
> Underground coal mines in India are governed by the **Coal Mines Regulations (CMR) 2017 (Regulation 112, 114)** and **DGMS (Tech) Circulars**. Any electronic equipment deployed in Degree I, II, or III gassy coal seams must be certified:
> 1. **Intrinsically Safe (Ex 'i')** according to **IS/IEC 60079-11:2011**, or
> 2. **Flameproof Enclosure (Ex 'd')** according to **IS/IEC 60079-1:2014**.
>
> In the prototype design, electrical isolation is maintained via zener barriers and current-limiting resistors, but **formal statutory testing at CIMFR Dhanbad / Karampura testing station has NOT yet been undertaken**. This platform must not be deployed in operational underground production faces until certified by the Directorate General of Mines Safety (DGMS).
