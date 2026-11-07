---
name: Hardware integration report
about: Document a bench test, sensor bus integration, or RF measurement
title: "[HARDWARE] "
labels: hardware, verification
assignees: ''
---

**Hardware Node & Subsystem**
- Microcontroller: ESP32-S3-WROOM-1 / DevKitC-1
- Peripheral: [BNO085 9-DOF IMU, TI ADS1220 24-bit ADC, SX1262 LoRa module]
- Bus Interface: [I2C Fast Mode 400 kHz / SPI Mode 1 2 MHz / SPI Mode 0 8 MHz]
- Power Rail: 3.3 V DC regulated

**Maturity Stage**
- [ ] Stage 4: Hardware bench tested (Isolated dev board verification)
- [ ] Stage 5: Hardware integrated (Connected to multi-sensor bus)
- [ ] Stage 6: Integrated prototype tested (Bench telemetry packet verification)

**RF / Bus Telemetry Observations**
Provide serial monitor logs, I2C logic analyzer waveforms, or LoRa RSSI/SNR packet logs.

**Statutory Safety Review**
Confirm current-limiting resistors, 3.3V rail boundaries, and intrinsic safety isolation.
