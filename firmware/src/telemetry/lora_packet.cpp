/**
 * @file lora_packet.cpp
 * @brief Binary telemetry packet serializer implementation
 */

#include "lora_packet.h"

uint16_t PacketSerializer::calculateCRC16(const uint8_t* data, size_t length) {
    uint16_t crc = 0xFFFF;
    for (size_t i = 0; i < length; i++) {
        crc ^= (uint16_t)data[i] << 8;
        for (uint8_t bit = 0; bit < 8; bit++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021; // CRC-16-CCITT polynomial
            } else {
                crc = crc << 1;
            }
        }
    }
    return crc;
}

size_t PacketSerializer::serialize(
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
) {
    if (maxLen < sizeof(TelemetryPayload)) {
        return 0;
    }

    TelemetryPayload payload;
    payload.magic[0] = 'S';
    payload.magic[1] = 'I';
    payload.sequenceId = seq;
    payload.vbatMv = vbatMv;
    payload.tiltX_centiDeg = (int16_t)(tiltX * 100.0f);
    payload.tiltY_centiDeg = (int16_t)(tiltY * 100.0f);
    payload.disp_centiMm = (uint16_t)(dispMm * 100.0f);
    payload.vib_centiRms = (uint16_t)(vibRms * 100.0f);
    payload.strain_micro = (uint16_t)strain;

    payload.flags = 0;
    if (isAnomaly)        payload.flags |= (1 << 0);
    if (isEmergencyRate)  payload.flags |= (1 << 1);

    // Calculate CRC over all bytes except the last 2 bytes (the crc field itself)
    payload.crc16 = calculateCRC16((const uint8_t*)&payload, sizeof(TelemetryPayload) - 2);

    memcpy(buffer, &payload, sizeof(TelemetryPayload));
    return sizeof(TelemetryPayload);
}
