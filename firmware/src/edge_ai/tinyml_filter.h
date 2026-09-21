/**
 * @file tinyml_filter.h
 * @brief On-device TinyML / statistical anomaly filter for ESP32-S3
 */

#pragma once

#include <Arduino.h>

#define BUFFER_SIZE 30

struct AnomalyVerdict {
    bool isAnomaly;
    float zScoreTilt;
    float zScoreDisp;
    float rateOfChangeTiltDegHr;
    uint8_t anomalyConfidencePct;
};

class TinyMLFilter {
public:
    TinyMLFilter();
    void reset();
    AnomalyVerdict process(float tiltDeg, float dispMm, float vibRms, uint32_t deltaMs);

private:
    float _tiltBuffer[BUFFER_SIZE];
    float _dispBuffer[BUFFER_SIZE];
    uint8_t _bufferIndex;
    uint8_t _samplesCollected;

    float _ewmaTilt;
    float _ewmaDisp;
    float _prevTilt;
    float _prevDisp;
    uint8_t _consecutiveViolations;

    void calculateStats(const float* buffer, uint8_t count, float& mean, float& stdDev);
};
