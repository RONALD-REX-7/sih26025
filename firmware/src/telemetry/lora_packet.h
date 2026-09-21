/**
 * @file lora_packet.h
 * @brief Binary telemetry packet definition and serializer
 */

#pragma once

#include <Arduino.h>

#pragma pack(push, 1)
struct TelemetryPayload {
    uint8_t  magic[2];       // 'S', 'I' (0x53, 0x49)
    uint16_t sequenceId;     // Monotonic sequence number
    uint16_t vbatMv;         // Battery voltage (e.g., 3250 mV)
    int16_t  tiltX_centiDeg; // Tilt X (deg * 100)
    int16_t  tiltY_centiDeg; // Tilt Y (deg * 100)
    uint16_t disp_centiMm;   // Borehole sag displacement (mm * 100)
    uint16_t vib_centiRms;   // Vibration RMS (mm/s * 100)
    uint16_t strain_micro;   // Strain in microstrain (µε)
    uint8_t  flags;          // Bit 0: Anomaly detected, Bit 1: Emergency rate active
    uint16_t crc16;          // CCITT CRC-16 checksum
};
#pragma pack(pop)

class PacketSerializer {
public:
    static size_t serialize(
        uint16_t seq,
        uint16_t vbatMv,
        float tiltX,
        float tiltY,
        float dispMm,
        float vibRms,
        float strain,
        bool isAnomaly,
        bool isEmergencyRate,
        uint8_t* buffer,
        size_t maxLen
    );

    static uint16_t calculateCRC16(const uint8_t* data, size_t length);
};
