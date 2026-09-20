/**
 * SIH26025 Hardware Telemetry Ingestion API Endpoint
 * 
 * Target: Edge Microcontroller (ESP32-S3) / LoRaWAN Gateway Telemetry Relays
 * Endpoint: POST /api/telemetry/ingest
 * 
 * Validations:
 * 1. Unauthorized Payload -> 401 Unauthorized (x-api-key)
 * 2. Malformed JSON -> 400 Bad Request
 * 3. Invalid Payload Schema -> 400 Bad Request (missing/invalid fields)
 * 4. Duplicate Payload -> 409 Conflict (identical node_code + timestamp)
 * 5. Rate Limit -> 429 Too Many Requests (burst protection)
 * 6. Valid Ingestion -> 201 Created
 */

import { NextRequest, NextResponse } from 'next/server';
import { TelemetryEngine } from '@/lib/telemetry/telemetry-engine';
import { NormalizedTelemetrySample } from '@/lib/domain/telemetry-contract';

// Rate limiter storage: key -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

// Duplicate detection LRU set: signature -> receivedAt
const duplicateCache = new Map<string, number>();
const DUPLICATE_CACHE_MAX = 5_000;

export async function POST(req: NextRequest) {
  // 1. Authentication Check
  const apiKey = req.headers.get('x-api-key');
  const validKey = process.env.TELEMETRY_API_KEY || 'sih26025-edge-telemetry-secret-key';

  if (!apiKey || apiKey !== validKey) {
    return NextResponse.json(
      {
        error: 'Unauthorized: Invalid or missing x-api-key header',
        code: 'UNAUTHORIZED',
      },
      { status: 401 }
    );
  }

  // 2. Rate Limiting Check
  const clientIp = req.headers.get('x-forwarded-for') || 'edge-client';
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded: maximum 120 requests per minute per gateway client',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      { status: 429 }
    );
  }
  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);

  // 3. Body Parsing (Malformed Check)
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Malformed JSON payload: unable to parse request body',
        code: 'MALFORMED_JSON',
      },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      {
        error: 'Invalid payload: JSON object expected',
        code: 'INVALID_PAYLOAD',
      },
      { status: 400 }
    );
  }

  // 4. Schema Validation
  const payload = body as Record<string, unknown>;
  const errors: string[] = [];

  const { node_code, timestamp, readings } = payload;

  if (!node_code || typeof node_code !== 'string' || !/^SN-\d{3}$/.test(node_code)) {
    errors.push('node_code must be a valid string formatted like "SN-101"');
  }

  if (!timestamp || typeof timestamp !== 'string' || isNaN(Date.parse(timestamp))) {
    errors.push('timestamp must be a valid ISO 8601 parseable date string');
  }

  if (!Array.isArray(readings) || readings.length === 0) {
    errors.push('readings must be a non-empty array of sensor channel measurements');
  } else {
    readings.forEach((r, idx) => {
      if (!r || typeof r !== 'object') {
        errors.push(`readings[${idx}] must be an object`);
        return;
      }
      const item = r as Record<string, unknown>;
      if (!item.channel || typeof item.channel !== 'string') {
        errors.push(`readings[${idx}].channel must be a non-empty string`);
      }
      if (typeof item.value !== 'number' || isNaN(item.value) || !isFinite(item.value)) {
        errors.push(`readings[${idx}].value must be a finite number`);
      }
    });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Payload failed schema validation',
        code: 'SCHEMA_VALIDATION_ERROR',
        details: errors,
      },
      { status: 400 }
    );
  }

  // 5. Duplicate Detection (Idempotency)
  const duplicateKey = `${node_code}:${timestamp}`;
  if (duplicateCache.has(duplicateKey)) {
    return NextResponse.json(
      {
        error: 'Duplicate telemetry payload detected',
        code: 'DUPLICATE_PAYLOAD',
        duplicateSignature: duplicateKey,
      },
      { status: 409 }
    );
  }

  // Store in duplicate cache with eviction
  if (duplicateCache.size >= DUPLICATE_CACHE_MAX) {
    const oldestKey = duplicateCache.keys().next().value;
    if (oldestKey) duplicateCache.delete(oldestKey);
  }
  duplicateCache.set(duplicateKey, now);

  // 6. Ingestion & Transformation into Normalized Telemetry
  const validReadings = readings as Array<{ channel: string; value: number; unit?: string; raw_value?: number }>;
  const normalizedSamples: NormalizedTelemetrySample[] = validReadings.map((r) => {
    let sensorType: import('@/lib/domain/constants').SensorType = 'displacement';
    if (r.channel.includes('TILT_X') || r.channel.toLowerCase() === 'tilt_x') sensorType = 'tilt_x';
    else if (r.channel.includes('TILT_Y') || r.channel.toLowerCase() === 'tilt_y') sensorType = 'tilt_y';
    else if (r.channel.includes('VIB') || r.channel.toLowerCase() === 'vibration') sensorType = 'vibration';
    else if (r.channel.includes('STRAIN') || r.channel.toLowerCase() === 'strain') sensorType = 'strain';

    return {
      nodeId: node_code as string,
      sensorCode: `${node_code}-${r.channel}`,
      sensorType,
      timestamp: timestamp as string,
      value: r.value,
      unit: r.unit || (sensorType === 'displacement' ? 'mm' : sensorType === 'vibration' ? 'mm/s' : 'arcsec'),
      qualityScore: 1.0,
      batteryPct: (payload.battery_pct as number) ?? 95.0,
      signalRssiDbm: (payload.rssi_dbm as number) ?? -68,
      provenance: 'LIVE',
    };
  });

  try {
    const engine = TelemetryEngine.getInstance();
    for (const sample of normalizedSamples) {
      engine.ingestExternalSample(sample);
    }
  } catch (err) {
    console.error('Failed to ingest normalized sample into TelemetryEngine:', err);
  }

  return NextResponse.json(
    {
      success: true,
      node_code,
      ingested_count: normalizedSamples.length,
      timestamp,
      provenance: 'LIVE',
      message: 'Telemetry successfully ingested into SIH26025 pipeline',
    },
    { status: 201 }
  );
}
