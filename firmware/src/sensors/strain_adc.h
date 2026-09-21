/**
 * @file strain_adc.h
 * @brief ADS1220 24-bit delta-sigma ADC driver for vibrating wire strain gauges
 */

#pragma once

#include <Arduino.h>

struct StrainReading {
    float microstrain;       // Microstrain (µε)
    float displacement_mm;   // Borehole extensometer sag in mm
    int32_t rawAdcCode;      // Raw 24-bit ADC code
    bool isValid;            // Integrity check
};

class StrainAdc {
public:
    StrainAdc();
    bool init();
    StrainReading readSample();
    void powerDown();
    void powerUp();

private:
    bool _isInitialized;
    float _zeroOffsetMicrostrain;
    float _gaugeFactor;
};
