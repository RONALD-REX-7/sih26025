# SIH26025 — Sensor Node Firmware (ESP32-S3)

## 1. Overview

This directory contains the production-grade embedded C++ firmware for the SIH26025 Subsurface Mine Monitoring Node. It is developed using the **Arduino-ESP32 framework** within the **PlatformIO** ecosystem.

### Core Capabilities
* **Transducer Interfacing:** Reads digital dual-axis inclinometer (BNO085/MPU6050 via I2C), 24-bit delta-sigma strain gauge ADC (ADS1220 via SPI), and piezoelectric vibration sensor.
* **On-Device Edge AI / TinyML:** Computes real-time rates of change, Exponentially Weighted Moving Average (EWMA), and rolling robust Z-scores over a sliding circular history buffer ($N = 30$).
* **Dynamic Cadence Escalation:** Operates at 300-second (5-minute) intervals during nominal strata conditions; automatically escalates to 10-second high-frequency reporting upon detecting anomalous roof sag or microseismic bursts.
* **Compact Serialization:** Encodes telemetry into a 20-byte binary packet protected by CRC-16-CCITT for noise-resilient LoRa transmission.
* **Ultra-Low-Power Management:** Implements power-rail gating via P-MOSFET and leverages ESP32-S3 deep sleep ($<15\ \mu\text{A}$ quiescent draw) to deliver up to 3 years of continuous battery life on a single 3.2V 3200 mAh LiFePO4 cell.

---

## 2. Directory Structure

```
firmware/
├── platformio.ini         # PlatformIO build & environment configuration
├── include/
│   └── config.h           # Central pinouts, radio parameters, thresholds
├── src/
│   ├── main.cpp           # System executive, FreeRTOS tasks & sleep cycle
│   ├── sensors/
│   │   ├── tilt_sensor.h  # Inclinometer driver interface
│   │   ├── tilt_sensor.cpp# BNO085 / MPU6050 reading & smoothing
│   │   ├── strain_adc.h   # 24-bit ADS1220 ADC interface
│   │   └── strain_adc.cpp # SPI command sequence & conversion
│   ├── edge_ai/
│   │   ├── tinyml_filter.h# Circular buffer & statistical detector header
│   │   └── tinyml_filter.cpp # EWMA & Z-score implementation
│   └── telemetry/
│       ├── lora_packet.h  # Telemetry payload binary structure
│       └── lora_packet.cpp# Serialization and CRC-16 calculation
└── README.md              # This documentation
```

---

## 3. Hardware Pinout Map

| Transducer / Periph | Pin (ESP32-S3) | Function / Bus |
|---|---|---|
| Inclinometer (I2C SDA) | GPIO 1 | I2C Data (100 kHz) |
| Inclinometer (I2C SCL) | GPIO 2 | I2C Clock (100 kHz) |
| ADS1220 (SPI CS) | GPIO 3 | Active Low Chip Select |
| ADS1220 (Data Ready) | GPIO 4 | Interrupt / DRDY Line |
| SX1262 (SPI NSS) | GPIO 5 | Active Low Chip Select |
| SX1262 (Busy) | GPIO 6 | Hardware Handshake |
| SX1262 (DIO1) | GPIO 7 | TX / RX Done Interrupt |
| SX1262 (Reset) | GPIO 8 | Active Low Reset |
| Piezo-Geophone (Analog)| GPIO 9 | ADC1 Channel 8 |
| Sensor Power Gate | GPIO 10 | High-Side P-MOSFET Gate |
| SPI MOSI (Shared) | GPIO 11 | Master Out Slave In |
| SPI SCK (Shared) | GPIO 12 | Master Serial Clock |
| SPI MISO (Shared) | GPIO 13 | Master In Slave Out |
| Battery Voltage Sense | GPIO 14 | 1:2 Divider to ADC1 |

---

## 4. Building and Flashing

### Requirements
* [PlatformIO Core](https://platformio.org/) or VS Code PlatformIO IDE Extension.
* USB Type-C Cable connected to ESP32-S3 UART / Native USB port.

### Commands

```bash
# Navigate to firmware directory
cd firmware

# Compile firmware
pio run

# Flash to target ESP32-S3 node (auto-detects COM port)
pio run --target upload

# Open serial debug monitor (115200 baud)
pio device monitor
```

---

## 5. Serial Debug Output Format

When powered on, the node outputs formatted diagnostic logs over the serial interface:

```text
[00:00:00.512] [I] [main.cpp:52] setup(): =================================================
[00:00:00.512] [I] [main.cpp:53] setup():   SIH26025 Subsurface Mine Monitoring Node
[00:00:00.513] [I] [main.cpp:54] setup():   Node: SN-102 | Panel: P-101 | Boot #1
[00:00:00.513] [I] [main.cpp:55] setup():   DGMS CMR 2017 Reg 112 Compliance Engine
[00:00:00.513] [I] [main.cpp:56] setup(): =================================================
[00:00:00.575] [I] [tilt_sensor.cpp:21] init(): BNO085 inclinometer detected at 0x4A
[00:00:00.612] [I] [strain_adc.cpp:28] init(): ADS1220 24-bit strain ADC initialized successfully
[00:00:00.614] [I] [main.cpp:64] setup(): All transducers initialized. Entering telemetry loop.
[00:00:00.735] [I] [main.cpp:115] loop(): [TX] Seq=1 | Tilt=(12.40°, 8.20°) | Disp=18.50mm | Vib=2.10mm/s | Strain=420.0µε | Vbat=3250mV | Len=20B
[00:00:00.738] [D] [main.cpp:121] loop(): Entering low-power sleep for 300 seconds...
```
