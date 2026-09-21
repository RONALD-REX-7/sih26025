/**
 * @file strain_adc.cpp
 * @brief ADS1220 24-bit delta-sigma ADC driver implementation
 */

#include "strain_adc.h"
#include "config.h"
#include <SPI.h>

#define ADS1220_CMD_RESET    0x06
#define ADS1220_CMD_START    0x08
#define ADS1220_CMD_POWERDN  0x02
#define ADS1220_CMD_RDATA    0x10

StrainAdc::StrainAdc() 
    : _isInitialized(false), 
      _zeroOffsetMicrostrain(420.0f), 
      _gaugeFactor(0.00392f) {}

bool StrainAdc::init() {
    pinMode(PIN_ADS1220_CS, OUTPUT);
    digitalWrite(PIN_ADS1220_CS, HIGH);
    pinMode(PIN_ADS1220_DRDY, INPUT);

    SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

    // Reset ADS1220
    digitalWrite(PIN_ADS1220_CS, LOW);
    SPI.transfer(ADS1220_CMD_RESET);
    digitalWrite(PIN_ADS1220_CS, HIGH);
    delay(5);

    _isInitialized = true;
    log_i("ADS1220 24-bit strain ADC initialized successfully");
    return true;
}

StrainReading StrainAdc::readSample() {
    StrainReading reading;
    reading.isValid = false;

    if (!_isInitialized) {
        reading.microstrain = _zeroOffsetMicrostrain;
        reading.displacement_mm = 18.5f;
        reading.rawAdcCode = 0;
        return reading;
    }

    // Trigger single conversion
    digitalWrite(PIN_ADS1220_CS, LOW);
    SPI.transfer(ADS1220_CMD_START);
    digitalWrite(PIN_ADS1220_CS, HIGH);

    // Wait for DRDY to go LOW (or timeout after 100ms)
    uint32_t startMs = millis();
    while (digitalRead(PIN_ADS1220_DRDY) == HIGH && (millis() - startMs < 100)) {
        delayMicroseconds(100);
    }

    // Read 24-bit conversion result
    digitalWrite(PIN_ADS1220_CS, LOW);
    SPI.transfer(ADS1220_CMD_RDATA);
    uint32_t b0 = SPI.transfer(0x00);
    uint32_t b1 = SPI.transfer(0x00);
    uint32_t b2 = SPI.transfer(0x00);
    digitalWrite(PIN_ADS1220_CS, HIGH);

    int32_t raw = (b0 << 16) | (b1 << 8) | b2;
    // Sign extend 24-bit to 32-bit
    if (raw & 0x800000) {
        raw |= 0xFF000000;
    }

    reading.rawAdcCode = raw;
    // Voltage in millivolts (VREF = 2048 mV, Gain = 32x)
    float vMv = (raw * 2048.0f) / (8388607.0f * 32.0f);
    
    // Convert to microstrain: microstrain = (V - V0) * k
    reading.microstrain = _zeroOffsetMicrostrain + (vMv * 125.0f);
    // Extensometer displacement derived from strain: 1 mm per 50 µε nominal
    reading.displacement_mm = (reading.microstrain / 50.0f) + 10.0f;
    reading.isValid = true;

    return reading;
}

void StrainAdc::powerDown() {
    digitalWrite(PIN_ADS1220_CS, LOW);
    SPI.transfer(ADS1220_CMD_POWERDN);
    digitalWrite(PIN_ADS1220_CS, HIGH);
}

void StrainAdc::powerUp() {
    digitalWrite(PIN_ADS1220_CS, LOW);
    SPI.transfer(ADS1220_CMD_RESET);
    digitalWrite(PIN_ADS1220_CS, HIGH);
    delay(5);
}
