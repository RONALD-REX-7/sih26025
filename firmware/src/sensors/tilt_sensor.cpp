/**
 * @file tilt_sensor.cpp
 * @brief Dual-axis digital inclinometer driver implementation
 */

#include "tilt_sensor.h"
#include "config.h"
#include <Wire.h>

#define BNO085_I2C_ADDR 0x4A

TiltSensor::TiltSensor() : _prevTiltX(0.0f), _prevTiltY(0.0f), _isInitialized(false) {}

bool TiltSensor::init() {
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 100000);
    
    // Probe I2C address
    Wire.beginTransmission(BNO085_I2C_ADDR);
    uint8_t error = Wire.endTransmission();
    
    if (error == 0) {
        _isInitialized = true;
        log_i("BNO085 inclinometer detected at 0x%02X", BNO085_I2C_ADDR);
        return true;
    } else {
        log_w("BNO085 not responding (err %d), testing 0x68 fallback...", error);
        Wire.beginTransmission(0x68);
        if (Wire.endTransmission() == 0) {
            _isInitialized = true;
            log_i("MPU6050 fallback detected at 0x68");
            return true;
        }
    }
    
    _isInitialized = false;
    log_e("No inclinometer detected on I2C bus");
    return false;
}

TiltReading TiltSensor::readSample() {
    TiltReading reading;
    reading.isValid = false;
    reading.temperature_c = 26.5f;

    if (!_isInitialized) {
        // Return nominal failsafe values
        reading.tiltX_deg = _prevTiltX;
        reading.tiltY_deg = _prevTiltY;
        return reading;
    }

    // Read 6 bytes of acceleration data from 0x3B (standard register map)
    Wire.beginTransmission(0x68);
    Wire.write(0x3B);
    if (Wire.endTransmission(false) == 0 && Wire.requestFrom(0x68, 6) == 6) {
        int16_t rawX = (Wire.read() << 8) | Wire.read();
        int16_t rawY = (Wire.read() << 8) | Wire.read();
        int16_t rawZ = (Wire.read() << 8) | Wire.read();

        // Convert to G-force (±2g range -> 16384 LSB/g)
        float ax = rawX / 16384.0f;
        float ay = rawY / 16384.0f;
        float az = rawZ / 16384.0f;

        // Calculate pitch and roll in degrees
        float pitch = atan2(ax, sqrt(ay * ay + az * az)) * 180.0f / PI;
        float roll = atan2(ay, sqrt(ax * ax + az * az)) * 180.0f / PI;

        // Exponential smoothing (alpha = 0.2)
        reading.tiltX_deg = (_prevTiltX * 0.8f) + (pitch * 0.2f);
        reading.tiltY_deg = (_prevTiltY * 0.8f) + (roll * 0.2f);
        reading.isValid = true;

        _prevTiltX = reading.tiltX_deg;
        _prevTiltY = reading.tiltY_deg;
    } else {
        reading.tiltX_deg = _prevTiltX;
        reading.tiltY_deg = _prevTiltY;
    }

    return reading;
}

void TiltSensor::sleep() {
    // Put sensor into low-power sleep mode
    Wire.beginTransmission(0x68);
    Wire.write(0x6B); // PWR_MGMT_1
    Wire.write(0x40); // Sleep bit set
    Wire.endTransmission();
}

void TiltSensor::wakeup() {
    Wire.beginTransmission(0x68);
    Wire.write(0x6B);
    Wire.write(0x00); // Clear sleep bit
    Wire.endTransmission();
    delay(SENSOR_WARMUP_DELAY_MS);
}
