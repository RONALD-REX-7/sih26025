import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const API_KEY = 'sih26025-edge-telemetry-secret-key';
const BASE_URL = 'http://localhost:3000/api/telemetry/ingest';

describe('SIH26025 Hardware Telemetry Ingestion API (POST /api/telemetry/ingest)', () => {
  it('rejects unauthorized request with missing or invalid x-api-key (401)', async () => {
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ node_code: 'SN-102' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.code).toBe('UNAUTHORIZED');
  });

  it('rejects malformed JSON payload (400)', async () => {
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'content-type': 'application/json',
      },
      body: '{"broken_json": true,',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MALFORMED_JSON');
  });

  it('rejects invalid schema payload with missing required fields (400)', async () => {
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        node_code: 'INVALID_NODE',
        timestamp: 'invalid-date',
        readings: [],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('SCHEMA_VALIDATION_ERROR');
    expect(json.details.length).toBeGreaterThanOrEqual(3);
  });

  it('successfully ingests valid ESP32 edge telemetry payload (201)', async () => {
    const validTimestamp = new Date().toISOString();
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        node_code: 'SN-102',
        timestamp: validTimestamp,
        readings: [
          { channel: 'TILT_X', value: 12.8, unit: 'arcsec' },
          { channel: 'TILT_Y', value: -8.1, unit: 'arcsec' },
          { channel: 'DISP_Z', value: 18.9, unit: 'mm' },
          { channel: 'VIB_RMS', value: 1.4, unit: 'mm/s' },
          { channel: 'STRAIN', value: 425.0, unit: 'microstrain' },
        ],
        battery_pct: 94.5,
        rssi_dbm: -68,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.ingested_count).toBe(5);
    expect(json.node_code).toBe('SN-102');
    expect(json.provenance).toBe('LIVE');
  });

  it('detects and rejects duplicate telemetry payload with 409 Conflict', async () => {
    const fixedTimestamp = '2026-09-20T12:00:00.000Z';
    const payload = {
      node_code: 'SN-103',
      timestamp: fixedTimestamp,
      readings: [{ channel: 'DISP_Z', value: 18.6, unit: 'mm' }],
    };

    // First attempt -> 201
    const req1 = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(201);

    // Second identical attempt -> 409
    const req2 = new NextRequest(BASE_URL, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);
    const json2 = await res2.json();
    expect(json2.code).toBe('DUPLICATE_PAYLOAD');
  });

  it('triggers rate limit 429 when client exceeds burst threshold', async () => {
    const clientIp = 'rate-limit-test-client-99';
    let lastStatus = 200;

    // Send rapid burst of 125 requests
    for (let i = 0; i < 125; i++) {
      const req = new NextRequest(BASE_URL, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'content-type': 'application/json',
          'x-forwarded-for': clientIp,
        },
        body: JSON.stringify({
          node_code: 'SN-104',
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          readings: [{ channel: 'TILT_X', value: 12.4 }],
        }),
      });
      const res = await POST(req);
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }

    expect(lastStatus).toBe(429);
  });
});
