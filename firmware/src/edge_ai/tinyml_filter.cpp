/**
 * @file tinyml_filter.cpp
 * @brief On-device TinyML / statistical anomaly filter implementation
 */

#include "tinyml_filter.h"
#include "config.h"
#include <math.h>

TinyMLFilter::TinyMLFilter() {
    reset();
}

void TinyMLFilter::reset() {
    _bufferIndex = 0;
    _samplesCollected = 0;
    _ewmaTilt = 0.0f;
    _ewmaDisp = 0.0f;
    _prevTilt = 0.0f;
    _prevDisp = 0.0f;
    _consecutiveViolations = 0;

    for (int i = 0; i < BUFFER_SIZE; i++) {
        _tiltBuffer[i] = 0.0f;
        _dispBuffer[i] = 0.0f;
    }
}

void TinyMLFilter::calculateStats(const float* buffer, uint8_t count, float& mean, float& stdDev) {
    if (count == 0) {
        mean = 0.0f;
        stdDev = 1.0f;
        return;
    }

    float sum = 0.0f;
    for (uint8_t i = 0; i < count; i++) {
        sum += buffer[i];
    }
    mean = sum / count;

    float sqDiffSum = 0.0f;
    for (uint8_t i = 0; i < count; i++) {
        float diff = buffer[i] - mean;
        sqDiffSum += diff * diff;
    }
    stdDev = sqrt(sqDiffSum / count);
    if (stdDev < 0.01f) {
        stdDev = 0.01f; // Prevent division by zero
    }
}

AnomalyVerdict TinyMLFilter::process(float tiltDeg, float dispMm, float vibRms, uint32_t deltaMs) {
    AnomalyVerdict verdict;
    verdict.isAnomaly = false;
    verdict.anomalyConfidencePct = 0;

    // Rate of change calculation (deg/hr and mm/hr)
    float deltaHours = (deltaMs > 0) ? (deltaMs / 3600000.0f) : (1.0f / 360.0f);
    verdict.rateOfChangeTiltDegHr = fabs(tiltDeg - _prevTilt) / deltaHours;
    float rateOfChangeDispHr = fabs(dispMm - _prevDisp) / deltaHours;

    _prevTilt = tiltDeg;
    _prevDisp = dispMm;

    // Store in circular history buffer
    _tiltBuffer[_bufferIndex] = tiltDeg;
    _dispBuffer[_bufferIndex] = dispMm;
    _bufferIndex = (_bufferIndex + 1) % BUFFER_SIZE;
    if (_samplesCollected < BUFFER_SIZE) {
        _samplesCollected++;
    }

    // Baseline statistics
    float meanTilt, stdTilt;
    float meanDisp, stdDisp;
    calculateStats(_tiltBuffer, _samplesCollected, meanTilt, stdTilt);
    calculateStats(_dispBuffer, _samplesCollected, meanDisp, stdDisp);

    // Compute robust Z-Scores
    verdict.zScoreTilt = fabs(tiltDeg - meanTilt) / stdTilt;
    verdict.zScoreDisp = fabs(dispMm - meanDisp) / stdDisp;

    // Check multi-condition anomaly rule
    bool zScoreTrigger = (verdict.zScoreTilt > Z_SCORE_ANOMALY_TRIGGER) || (verdict.zScoreDisp > Z_SCORE_ANOMALY_TRIGGER);
    bool rateTrigger = (verdict.rateOfChangeTiltDegHr > THRESHOLD_TILT_RATE_DEG_PER_HR) || (rateOfChangeDispHr > THRESHOLD_DISP_RATE_MM_PER_HR);
    bool acousticEmission = (vibRms > THRESHOLD_VIB_RMS_WARNING);

    if ((zScoreTrigger && rateTrigger) || (acousticEmission && rateTrigger)) {
        _consecutiveViolations++;
    } else {
        if (_consecutiveViolations > 0) {
            _consecutiveViolations--;
        }
    }

    // Persistence rule: require 2 consecutive cycles to avoid transient spike false alarms
    if (_consecutiveViolations >= 2) {
        verdict.isAnomaly = true;
        verdict.anomalyConfidencePct = min(98, 65 + (_consecutiveViolations * 10));
    }

    return verdict;
}
