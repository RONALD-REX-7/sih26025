# SIH26025 (MineGuard) — Geotechnical Sensor Interfaces & Telemetry Specification

**Target Hardware:** ESP32-S3-WROOM-1 / ESP32-S3-DevKitC-1  
**Firmware Architecture:** PlatformIO / Arduino Framework (v2.4.0)  
**Status Lifecycle:** Stage 2 (`Implemented in software` / Partial Bench Prototype)

---

## 1. System Hardware Architecture

The SIH26025 underground mine strata monitoring node is designed around the ESP32-S3 microcontroller, interfacing high-resolution geotechnical sensors and a long-range sub-gigahertz telemetry transceiver:

```
+-------------------------------------------------------------------------------+
|                             ESP32-S3 Microcontroller                          |
|                  Dual-Core Xtensa LX7 @ 240 MHz | 8 MB PSRAM                  |
+-------------------+---------------------------+-------------------------------+
                    | (I2C Bus: GPIO 4 / 5)     | (SPI Bus: GPIO 10 / 11 / 12)
                    v                           v
          +-------------------+       +-------------------+
          |  BNO085 9-DOF IMU |       |  ADS1220 24-bit   |
          |  Strata Tilt &    |       |  Rockbolt Strain  |
          |  Displacement     |       |  Rosette Bridge   |
          +-------------------+       +-------------------+
                    |
                    | (SPI Bus: GPIO 14 / 15 / 16 / 17)
                    v
          +-------------------+
          |  SX1262 LoRa TX   |
          |  IN865 (865.2 MHz)|
          +-------------------+
```

---

## 2. Sensor Bus Interfaces & Pin Configuration

| Subsystem | Component | Bus / Protocol | ESP32-S3 Pins | Operating Voltage | Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tilt / IMU** | CEVA / Hillcrest BNO085 | `I2C` (Fast Mode 400 kHz) | `SDA: GPIO 4`<br>`SCL: GPIO 5`<br>`INT: GPIO 6`<br>`RST: GPIO 7` | 3.3 V DC | 3-axis accelerometer, 3-axis gyroscope, magnetometer; SH-2 quaternion sensor fusion. |
| **Rockbolt Strain** | TI ADS1220 | `SPI` (Mode 1, 2 MHz) | `CS: GPIO 10`<br>`SCLK: GPIO 11`<br>`MOSI: GPIO 12`<br>`MISO: GPIO 13`<br>`DRDY: GPIO 8` | 3.3 V DC | 24-bit delta-sigma ADC with integrated low-noise programmable gain amplifier (PGA up to 128x). |
| **Sub-GHz LoRa** | Semtech SX1262 | `SPI` (Mode 0, 8 MHz) | `NSS: GPIO 14`<br>`SCK: GPIO 15`<br>`MOSI: GPIO 16`<br>`MISO: GPIO 17`<br>`BUSY: GPIO 18`<br>`DIO1: GPIO 19` | 3.3 V DC | RadioLib-driven RF packet transceiver operating at 865.20 MHz (IN865 band). |

---

## 3. Communication & Telemetry Protocol

- **Modulation**: LoRa Chirp Spread Spectrum (CSS).
- **Center Frequency**: $865.20\text{ MHz}$ (India license-free sub-GHz band).
- **Bandwidth**: $125\text{ kHz}$.
- **Spreading Factor (SF)**: Adaptive SF7 (near face) to SF10 (deep drift).
- **Coding Rate (CR)**: 4/5.
- **Preamble Length**: 12 symbols with explicit header and CRC check.

---

## 4. Statutory & Engineering Safety Disclaimers

> [!CAUTION]
> **Statutory Colliery Safety Boundary:**
> - Intrinsic safety (Ex 'i') guidelines under IS/IEC 60079-11 were incorporated into PCB routing, power decoupling, and current limit budgets.
> - **Formal certification by CIMFR Dhanbad and statutory approval from the Directorate General of Mines Safety (DGMS) CMR 2017 have not been undertaken.**
> - Physical deployment in active underground coal or metal mines is strictly prohibited without formal DGMS type-approval and certified flameproof/intrinsically safe enclosures.
