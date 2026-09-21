# SIH26025 Vercel Production Deployment & Verification Report

**Smart India Hackathon 2026 — Ministry of Coal**  
**Problem Statement SIH26025**: *Development of an AI-Enabled Low Cost Real Time Mine Subsidence Monitoring, Prediction and Early Warning System for Underground Coal Mines in India*

---

## 1. System Identity & Production Configuration

- **Target Platform**: Vercel (Production Cloud Infrastructure)
- **Deployment URL (Canonical Production)**: [https://sih26025.vercel.app](https://sih26025.vercel.app)
- **Team / Organization**: `spirit16` (Team Name: `SPIRIT`)
- **Project ID**: `prj_Ace0t9IThUbnnBqs3avuhiTrCukP`
- **Deployment ID**: `dpl_DQb4p8erY5oTL9jp7aX4RxqUk48g`
- **Framework Preset**: Next.js 16.3.5 (Turbopack, App Router)
- **React Runtime**: 19.2.8
- **Node Engine**: `24.x` (Assigned: 2 vCPU, 8192 MiB RAM)
- **Package Manager & Lockfile**: `npm` with deterministic `package-lock.json`
- **Build Duration**: 33 seconds
- **Production Status**: `● Ready`

---

## 2. Root Cause Forensic Analysis & Resolution (Vercel Block Diagnostic)

### Observed Symptoms
- Git and CLI deployments were flagged on Vercel as `This deployment has been blocked`.
- Build states showed `status: UNKNOWN` with `0ms build duration` and `0 cores assigned`.

### Forensic Root Cause
- **Category A — Git Author Identity Mismatch (Hobby Tier Collaboration Policy)**:
  - Repository local commits were authored with `ronaldrexch@gmail.com`.
  - GitHub REST API inspection of commit `edf1b9f` revealed `"author": null` and `"committer": null`, proving `ronaldrexch@gmail.com` was not registered or verified on GitHub account `RONALD-REX-7`.
  - The GitHub account `RONALD-REX-7` (ID: `211186833`) has primary verified email `ronaldrex21.2007@gmail.com`.
  - Under Vercel Hobby plan terms, third-party collaboration is disallowed; when Vercel received webhook commits with an unlinked author, it treated them as external collaborator pushes and blocked them at the gateway.

### Engineering Resolution
- Configured repository-local Git identity:
  ```bash
  git config --local user.name "RONALD REX C H"
  git config --local user.email "ronaldrex21.2007@gmail.com"
  ```
- Created verified diagnostic commit `bfe22074f261853a16dcc364a59126503cce3c47`.
- Verified GitHub API attribution:
  - `"author": { "login": "RONALD-REX-7", "id": 211186833 }`
  - `"committer": { "login": "RONALD-REX-7", "id": 211186833 }`
- Pushed to both `origin/main` and `origin/master`.
- **Immediate Outcome**: Vercel instantly unblocked and queued deployment `dpl_DQb4p8erY5oTL9jp7aX4RxqUk48g`, achieving `● Ready` status in 33 seconds.

---

## 3. Live Edge Telemetry API Ingestion Verification

Tested directly against the live Vercel production endpoint: `https://sih26025.vercel.app/api/telemetry/ingest`

| Test Case | Request Headers & Payload | Expected Status | Live Production Status | Response Body Verification |
|---|---|---|---|---|
| **Missing API Key** | `POST` without `x-api-key` | `401 Unauthorized` | **401** (PASS) | `{"error":"Unauthorized: Invalid or missing x-api-key header","code":"UNAUTHORIZED"}` |
| **Malformed JSON** | `POST` with `x-api-key`, body: `{bad-json` | `400 Bad Request` | **400** (PASS) | `{"error":"Malformed JSON payload: unable to parse request body","code":"MALFORMED_JSON"}` |
| **Invalid Schema** | `POST` with invalid `node_code` & empty readings | `400 Bad Request` | **400** (PASS) | `{"error":"Payload failed schema validation","code":"SCHEMA_VALIDATION_ERROR", ...}` |
| **Valid Telemetry Ingestion** | Node `SN-101`, 2 channels (`DISP_MM`, `TILT_X`) | `201 Created` | **201** (PASS) | `{"success":true,"node_code":"SN-101","ingested_count":2,"provenance":"LIVE"}` |
| **Duplicate Telemetry Prevention** | Same `node_code` and ISO timestamp replay | `409 Conflict` | **409** (PASS) | `{"error":"Duplicate telemetry payload detected","code":"DUPLICATE_PAYLOAD"}` |

---

## 4. Live Production Route Status & Payload Verification

All 15 operational routes tested directly on `https://sih26025.vercel.app`:

| Route Path | View / Functional Layer | HTTP Status | Response Size | Console Errors |
|---|---|---|---|---|
| `/` | Main Command Dashboard | **200 OK** | 84,215 B | **0** |
| `/dashboard` | Surveillance Command Surface | **200 OK** | 85,040 B | **0** |
| `/mine` | Mine & Panel Stratigraphy Inspection | **200 OK** | 47,750 B | **0** |
| `/gis` | Underground GIS Spatial Workstation | **200 OK** | 69,583 B | **0** |
| `/nodes` | Sensor Node Fleet (16 Extensometer / Tilt Units) | **200 OK** | 76,537 B | **0** |
| `/sensors` | Transducer Matrix (80 Physical Channels) | **200 OK** | 105,911 B | **0** |
| `/events` | Geotechnical Event Ledger & Micro-Seismic Records | **200 OK** | 40,942 B | **0** |
| `/analytics` | AI Risk Engine & EWMA / Isolation Forest Trends | **200 OK** | 48,143 B | **0** |
| `/alerts` | Incident Action Center & DGMS Evacuation Directives | **200 OK** | 43,146 B | **0** |
| `/infrastructure` | Power, Solar, Battery & LoRaWAN Gateway Health | **200 OK** | 50,994 B | **0** |
| `/audit` | Statutory DGMS CMR 2017 Reg. 112 Event Audit Trail | **200 OK** | 47,429 B | **0** |
| `/reports` | Form IV DGMS Regulatory Compliance Exporter | **200 OK** | 53,203 B | **0** |
| `/settings` | Geomechanical Safety Thresholds & Alarm Setpoints | **200 OK** | 45,976 B | **0** |
| `/simulator` | Mulberry32 Deterministic Geotechnical Test Bench | **200 OK** | 60,372 B | **0** |
| `/telemetry` | Raw Transducer Telemetry Time-Series Stream | **200 OK** | 46,032 B | **0** |

---

## 5. End-to-End SIH26025 Functional Smoke Test

Verified interactively via Chrome DevTools on the live Vercel deployment:

1. **Dashboard Initialization**:
   - Live URL `https://sih26025.vercel.app` rendered Bhowra-West Colliery Command.
   - Initial condition verified as `Condition: NORMAL [L0]`, Fleet `16/16 Online`, Active Directives `1 ADVISORY [L1]` on Panel P-101.
   - Zero console errors, zero hydration mismatches.
2. **Deterministic Strata Simulator**:
   - Navigated to `/simulator`.
   - Set simulation speed to `5x` and clicked `Start simulation`.
   - Verified state transitioned from `IDLE` to `RUNNING` with live elapsed time ticking (`01:15 / 02:00`).
   - Transducer channels updated in real-time (`TILT_X: 12.22 arcsec`, `DISP_Z: 18.51 mm`, `VIB_RMS: 1.01 mm/s`).
3. **Statutory Incident Sign-Off (CMR 112 Compliance)**:
   - Navigated to `/alerts`.
   - Selected active incident `alt-001` (*"Multi-Station Tilt Rate Deviation on P-101"*).
   - Opened statutory sign-off modal with mandatory mitigation action: *"Immediate underground evacuation ordered per DGMS CMR 2017 Reg 112"*.
   - Signatory: *"Rajesh Kumar (Safety Officer)"*.
   - Clicked `Commit Sign-Off & Acknowledge`.
   - Verified state changed to `ACKNOWLEDGED` with status badge *"Signed Off"*.
4. **Statutory Audit Log Recording**:
   - Navigated to `/audit`.
   - Verified new record created immediately:
     - **Timestamp**: `21 Sept, 08:26:51 pm`
     - **Signatory Role**: `SafetyOfficer`
     - **Action Code**: `ALERT_ACKNOWLEDGED`
     - **Target Entity**: `alert (alt-001)`
     - **Payload Preview**: `{"status":"acknowledged","action_taken":"Immediate underground evacuation ordered per DGMS CMR 2017 Reg 112","acknowledged_by":"Rajesh Kumar (SafetyOfficer)"}`
5. **Underground GIS Workstation**:
   - Navigated to `/gis`.
   - Scale `1:5,000 WGS84 EPSG:4326`, 16/16 Stations Active.
   - Verified 7 spatial layers: Underground Panels, Sensor Fleet Nodes, Surface Haulage / Railway buffer, Goaf Depillaring Zones, InSAR grid, Geomechanical benchmark, and Subsidence event markers.
   - Interactive zoom controls and layer toggles functional with 0 console errors.

---

## 6. Captured Production Visual Proofs

- **Executive Command Dashboard**: `docs/vercel_live_dashboard.png`
- **Underground GIS Spatial Workstation**: `docs/vercel_live_gis.png`

---

## 7. Security & Compliance Verification Gate

- [x] **No Secrets Exposed**: Zero database credentials, service role keys, or API secrets in source, client bundles, or repository.
- [x] **RLS & Degraded Mode**: Application functions reliably in DEMO mode without requiring live Supabase credentials; handles missing cloud gracefully.
- [x] **DGMS CMR 2017 Reg. 112 Compliance**: Strictly enforces explainable risk levels (`Normal`, `Advisory`, `Watch`, `Warning`, `Critical`) and mandatory audit logging for every shift action.
