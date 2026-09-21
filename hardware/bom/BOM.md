# Bill of Materials (BOM) — Low-Cost Sensor Node

## 1. Cost Summary

| Subsystem | Estimated Unit Cost (INR) | Estimated Unit Cost (USD) |
|---|---|---|
| Core Processing & Wireless (ESP32-S3 + SX1262) | ₹ 1,180 | $ 14.20 |
| Transducers & Signal Conditioning (IMU + 24-bit ADC) | ₹ 1,420 | $ 17.10 |
| Power Subsystem (LiFePO4 + BMS + LDO) | ₹ 680 | $ 8.20 |
| PCB, Passive Components & Connectors | ₹ 420 | $ 5.05 |
| IP68 Enclosure & Rockbolt Bracket Assembly | ₹ 1,150 | $ 13.85 |
| **Total Unit Production Cost** | **₹ 4,850** | **$ 58.40** |

---

## 2. Detailed Itemized Components

| Item # | Part Name / Reference | Manufacturer | Part Number | Interface / Package | Unit Qty | Unit Price (INR) | Primary Engineering Role |
|---|---|---|---|---|---|---|---|
| 1 | Microcontroller | Espressif Systems | ESP32-S3-WROOM-1-N8R2 | SMD Module (PCB Antenna) | 1 | ₹ 340 | Dual-core 240MHz, hardware FPU, FreeRTOS edge processing |
| 2 | LoRa Transceiver | Semtech | SX1262IMLTRT | QFN-24 (SPI) | 1 | ₹ 420 | 865-867 MHz IN865 band, +22dBm output, -148dBm sensitivity |
| 3 | Antenna | COTS Industrial | ANT-868-CW-HWR-SMA | SMA Male Whip 3dBi | 1 | ₹ 240 | Sub-GHz omnidirectional whip antenna |
| 4 | Precision Inclinometer | CEVA / Bosch | BNO085 (or MPU6050 alt) | LGA-28 (I2C/SPI) | 1 | ₹ 780 | Dual-axis tilt measurement (0.01° resolution) |
| 5 | Delta-Sigma ADC | Texas Instruments | ADS1220IPWR | TSSOP-16 (SPI) | 1 | ₹ 450 | 24-bit low-noise ADC with PGA for vibrating wire bridge |
| 6 | Vibration Transducer | Murata | PKM13EPYH4002-B0 | Piezoelectric (Analog) | 1 | ₹ 190 | RMS stratal acoustic & seismic vibration detection |
| 7 | Low-Dropout Regulator | Texas Instruments | TPS7A2533DBVR | SOT-23-5 | 1 | ₹ 65 | Ultra-low quiescent (2 µA) 3.3V LDO regulator |
| 8 | Battery Cell | EVE Energy | IFR18650-3200 | 18650 LiFePO4 | 1 | ₹ 420 | 3.2V 3200mAh intrinsically safe thermal stability |
| 9 | LiFePO4 Protection Circuit| DFRobot / Custom | HY2112-CB | SOT-23-6 | 1 | ₹ 95 | Overcharge, over-discharge, short-circuit barrier |
| 10 | PCB Fabrication | PCBWay / JLCPCB | 4-Layer FR4 1.6mm | 80mm x 60mm | 1 | ₹ 160 | Impedance-controlled RF trace for 865MHz |
| 11 | Industrial Enclosure | Gainta / Bud | G2108C | Die-Cast Al / Polycarbonate | 1 | ₹ 750 | IP68 environmental protection, 120 x 80 x 55 mm |
| 12 | Cable Glands | Jacob GmbH | M12 Brass Nickel-Plated | M12 IP68 | 2 | ₹ 180 | Gas-tight and moisture-proof transducer entry |
| 13 | Rockbolt Bracket | Local Fabrication | SS304 3mm Plate | Custom CNC Bend | 1 | ₹ 220 | Rigid clamping to 22mm colliery roof bolts |
| — | **Total** | — | — | — | — | **₹ 4,850** | — |
