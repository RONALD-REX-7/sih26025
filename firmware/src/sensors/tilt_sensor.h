/**
 * @file tilt_sensor.h
 * @brief Dual-axis digital inclinometer driver interface
 */

#pragma once

#include <Arduino.h>

struct TiltReading {
    float tiltX_deg;    // Pitch angle (-90.0° to +90.0°)
    float tiltY_deg;    // Roll angle (-90.0° to +90.0°)
    float temperature_c;// Transducer junction temperature
    bool isValid;       // Sensor communication integrity check
};

class TiltSensor {
public:
    TiltSensor();
    bool init();
    TiltReading readSample();
    void sleep();
    void wakeup();

private:
    float _prevTiltX;
    float _prevTiltY;
    bool _isInitialized;
};
