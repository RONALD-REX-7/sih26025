# Sensor Node Electrical Schematics & Wiring Specification

## 1. Pin Assignment & Bus Mapping (ESP32-S3)

The ESP32-S3-WROOM-1 provides flexible GPIO routing. The hardware layout assigns non-conflicting dedicated buses for maximum noise immunity in electrically noisy mine environments.

```
                  ┌────────────────────────────────────────┐
                  │          ESP32-S3-WROOM-1              │
                  │                                        │
 (I2C SDA) ───────┤ GPIO 1                                 │
 (I2C SCL) ───────┤ GPIO 2                                 │
 (ADS CS)  ───────┤ GPIO 3                    (SPI MOSI) ──┼─── GPIO 11
 (ADS DRDY)───────┤ GPIO 4                    (SPI MISO) ──┼─── GPIO 13
 (SX CS)   ───────┤ GPIO 5                    (SPI SCK)  ──┼─── GPIO 12
 (SX BUSY) ───────┤ GPIO 6                                 │
 (SX DIO1) ───────┤ GPIO 7                     (UART TX) ──┼─── GPIO 43 (Prog)
 (SX RESET)───────┤ GPIO 8                     (UART RX) ──┼─── GPIO 44 (Prog)
 (VIB ADC) ───────┤ GPIO 9 (ADC1_CH8)          (SYS WAKE)──┼─── GPIO 0  (RTC)
                  └────────────────────────────────────────┘
```

---

## 2. Bus Configurations

### 2.1 I2C Primary Bus (Digital Inclinometer / IMU)
* **Master:** ESP32-S3
* **Speed:** 100 kHz standard mode (chosen for noise resilience over cable runs up to 1.5m).
* **Pull-up Resistors:** 4.7 kΩ tied to 3.3V_SENS.
* **Slave Device:** BNO085 at 7-bit address `0x4A` (or MPU6050 fallback at `0x68`).
* **Shielding:** Belden 9841 twisted-pair with foil + braided shield grounded at the enclosure bulkhead.

### 2.2 SPI High-Speed Bus (LoRa Transceiver & 24-bit ADC)
* **Master:** ESP32-S3
* **Clock Frequency:**
  * SX1262 LoRa: 8 MHz
  * ADS1220 ADC: 1 MHz
* **Lines:**
  * SCK: GPIO 12
  * MOSI: GPIO 11
  * MISO: GPIO 13
  * NSS (SX1262): GPIO 5 (Active Low)
  * CS (ADS1220): GPIO 3 (Active Low)

---

## 3. Analog Conditioning Circuitry

### 3.1 Vibrating Wire & Piezoresistive Strain Bridge Interface
```
  +3.3V_REF ───────────┬───────────────┬────────────┐
                       │               │            │
                     [ R1 ]          [ R3 ]         │
                    1000 Ω          1000 Ω          │
                       │               │            │
                       ├────── AIN0    ├────── AIN1 │
                       │               │            │
                    [ R2 ]          [ R_SG ]        │
                    1000 Ω         Strain Gauge     │
                       │            1000 Ω ± ΔR     │
                       │               │            │
  AGND ────────────────┴───────────────┴────────────┴── ADS1220 (AIN0/AIN1 Diff Input)
                                                       • Internal PGA: Gain = 32x
                                                       • Internal VREF: 2.048 V
                                                       • Effective Resolution: 0.1 µstrain
```

### 3.2 Piezoelectric Vibration Envelope Detector
For detecting stratal micro-fracturing and rockburst precursors:
* Murata PKM13 piezo disc connected to an active low-pass envelope detector.
* Cutoff frequency: 150 Hz.
* DC output fed to ESP32-S3 internal 12-bit ADC (GPIO 9) with 64x oversampling.

---

## 4. Power Conditioning & Isolation

* **Primary Battery:** 3.2V nominal LiFePO4 (Charge cutoff 3.65V, discharge cutoff 2.5V).
* **Regulator:** TI TPS7A2533DBVR 300mA ultra-low noise LDO ($V_{out} = 3.3\text{V} \pm 1\%$).
* **Power Partitioning:**
  * `3.3V_ALWAYS_ON`: Powers ESP32-S3 RTC domain and wake-up timers.
  * `3.3V_SWITCHED`: Controlled via high-side P-channel MOSFET (AO3401A) to completely isolate sensors and radio between sampling cycles, suppressing parasitic leakages.
