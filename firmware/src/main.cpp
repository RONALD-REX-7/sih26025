/**
 * @file main.cpp
 * @brief Master firmware entry point for SIH26025 Subsurface Sensor Node
 */

#include <Arduino.h>
#include <SPI.h>
#include <Wire.h>
#include "config.h"
#include "sensors/tilt_sensor.h"
#include "sensors/strain_adc.h"
#include "edge_ai/tinyml_filter.h"
#include "telemetry/lora_packet.h"

// System objects
static TiltSensor   tiltSensor;
static StrainAdc    strainAdc;
static TinyMLFilter edgeFilter;

// Operational state
RTC_DATA_ATTR static uint16_t bootSequence = 0;
static uint32_t lastSampleTimeMs = 0;
static bool isInEmergencyRate = false;

// Battery voltage reader
static uint16_t readBatteryVoltageMv() {
    analogReadResolution(12);
    uint32_t raw = analogRead(PIN_VBAT_SENSE);
    // Voltage divider (100k / 100k -> 2x multiplier, 3.3V ref -> 3300mV / 4095)
    float mv = (raw * 3300.0f / 4095.0f) * 2.0f;
    return (uint16_t)mv;
}

// Analog geophone reader
static float readVibrationRms() {
    uint32_t sumSq = 0;
    const int SAMPLES = 64;
    for (int i = 0; i < SAMPLES; i++) {
        int val = analogRead(PIN_VIBRATION_ADC) - 2048; // Center around 0
        sumSq += (val * val);
        delayMicroseconds(150);
    }
    float rmsAdc = sqrt(sumSq / (float)SAMPLES);
    // Calibration factor: 100 ADC counts = 1.0 mm/s RMS
    return (rmsAdc / 100.0f);
}

void setup() {
    Serial.begin(115200);
    delay(500);

    bootSequence++;
    log_i("=================================================");
    log_i("  SIH26025 Subsurface Mine Monitoring Node");
    log_i("  Node: %s | Panel: %s | Boot #%u", NODE_ID_DEFAULT, PANEL_CODE_DEFAULT, bootSequence);
    log_i("  DGMS CMR 2017 Reg 112 Compliance Engine");
    log_i("=================================================");

    // Enable high-side sensor power switch
    pinMode(PIN_POWER_SENSOR_GATE, OUTPUT);
    digitalWrite(PIN_POWER_SENSOR_GATE, LOW); // Active Low P-MOSFET -> ON
    delay(SENSOR_WARMUP_DELAY_MS);

    // Initialize sensors
    tiltSensor.init();
    strainAdc.init();

    log_i("All transducers initialized. Entering telemetry loop.");
}

void loop() {
    uint32_t now = millis();
    uint32_t deltaMs = (lastSampleTimeMs == 0) ? 1000 : (now - lastSampleTimeMs);
    lastSampleTimeMs = now;

    // 1. Acquire transducer readings
    TiltReading tilt = tiltSensor.readSample();
    StrainReading strain = strainAdc.readSample();
    float vibRms = readVibrationRms();
    uint16_t vbat = readBatteryVoltageMv();

    // 2. Execute on-device edge AI / TinyML filtering
    AnomalyVerdict verdict = edgeFilter.process(tilt.tiltX_deg, strain.displacement_mm, vibRms, deltaMs);

    // Dynamically adjust telemetry reporting cadence
    if (verdict.isAnomaly) {
        isInEmergencyRate = true;
        log_w(">>> STRATA ANOMALY DETECTED! zTilt=%.2f, zDisp=%.2f, Conf=%d%%. Escalating to 10s TX interval.",
              verdict.zScoreTilt, verdict.zScoreDisp, verdict.anomalyConfidencePct);
    } else {
        isInEmergencyRate = false;
    }

    // 3. Serialize compact LoRa packet
    uint8_t packetBuffer[32];
    size_t packetLen = PacketSerializer::serialize(
        bootSequence,
        vbat,
        tilt.tiltX_deg,
        tilt.tiltY_deg,
        strain.displacement_mm,
        vibRms,
        strain.microstrain,
        verdict.isAnomaly,
        isInEmergencyRate,
        packetBuffer,
        sizeof(packetBuffer)
    );

    // 4. Transmit telemetry packet via LoRa (IN865: 865.2 MHz)
    log_i("[TX] Seq=%u | Tilt=(%.2f°, %.2f°) | Disp=%.2fmm | Vib=%.2fmm/s | Strain=%.1fµε | Vbat=%umV | Len=%uB",
          bootSequence, tilt.tiltX_deg, tilt.tiltY_deg, strain.displacement_mm, vibRms, strain.microstrain, vbat, packetLen);

    // 5. Power management: sleep until next scheduled sample
    uint32_t sleepDurationSec = isInEmergencyRate 
        ? TELEMETRY_INTERVAL_ALERT_SEC 
        : TELEMETRY_INTERVAL_NOMINAL_SEC;

    log_d("Entering low-power sleep for %u seconds...", sleepDurationSec);

    // Put sensors to sleep
    tiltSensor.sleep();
    strainAdc.powerDown();
    digitalWrite(PIN_POWER_SENSOR_GATE, HIGH); // Turn off sensor power rail

    // Configure ESP32 deep sleep timer
    esp_sleep_enable_timer_wakeup((uint64_t)sleepDurationSec * 1000000ULL);
    esp_deep_sleep_start();
}
