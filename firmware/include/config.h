/**
 * @file config.h
 * @brief Master hardware pinout and configuration constants for SIH26025
 */

#pragma once

#include <Arduino.h>

// ==============================================================================
// 1. Node Identity & Network Parameters
// ==============================================================================
#define NODE_ID_DEFAULT         "SN-102"
#define PANEL_CODE_DEFAULT      "P-101"
#define LORA_FREQUENCY_HZ       865200000UL   // 865.2 MHz (India IN865 band)
#define LORA_BANDWIDTH_KHZ      125.0         // 125 kHz
#define LORA_SPREADING_FACTOR   10            // SF10 for underground penetration
#define LORA_CODING_RATE        7             // 4/7 coding rate
#define LORA_TX_POWER_DBM       20            // +20 dBm (100 mW EIRP compliant)
#define LORA_SYNC_WORD          0x12          // Private industrial network

// ==============================================================================
// 2. Telemetry Intervals & Power Cycling
// ==============================================================================
#define TELEMETRY_INTERVAL_NOMINAL_SEC   300   // 5 minutes nominal
#define TELEMETRY_INTERVAL_ALERT_SEC     10    // 10 seconds under anomaly
#define SENSOR_WARMUP_DELAY_MS           50    // Sensor power stabilization

// ==============================================================================
// 3. Pin Mapping (ESP32-S3)
// ==============================================================================
// I2C Bus (BNO085 Inclinometer)
#define PIN_I2C_SDA             1
#define PIN_I2C_SCL             2

// SPI Bus Shared (SX1262 LoRa + ADS1220 ADC)
#define PIN_SPI_MOSI            11
#define PIN_SPI_SCK             12
#define PIN_SPI_MISO            13

// SX1262 Dedicated Pins
#define PIN_SX1262_NSS          5
#define PIN_SX1262_BUSY         6
#define PIN_SX1262_DIO1         7
#define PIN_SX1262_RST          8

// ADS1220 24-bit ADC Dedicated Pins
#define PIN_ADS1220_CS          3
#define PIN_ADS1220_DRDY        4

// Analog Vibration Sensor (Piezo-Geophone)
#define PIN_VIBRATION_ADC       9

// High-Side Power Switch (AO3401A P-MOSFET)
#define PIN_POWER_SENSOR_GATE   10

// Battery Voltage Sensing (1:2 Voltage Divider)
#define PIN_VBAT_SENSE          14

// ==============================================================================
// 4. Edge Anomaly Thresholds (DGMS CMR 2017 Ground Control Guideline)
// ==============================================================================
#define THRESHOLD_TILT_RATE_DEG_PER_HR   0.50f   // Roof sag warning threshold
#define THRESHOLD_DISP_RATE_MM_PER_HR    2.00f   // Displacement rate threshold
#define THRESHOLD_VIB_RMS_WARNING        4.50f   // Acoustic emission threshold
#define THRESHOLD_STRAIN_MICROSTRAIN     800.0f  // Rockbolt tension alert
#define Z_SCORE_ANOMALY_TRIGGER          2.50f   // Robust Z-score edge trigger
