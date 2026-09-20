# SIH26025 — Software Architecture

> Version: 1.0 (Phase 0 Lock)  
> Date: 2026-09-20  
> Status: **Locked — Pending Phase 1 Execution**

---

## 1. System Overview

```
Physical Sensors (future)
  → Sensor Node / ESP32 Edge Layer (future hardware)
  → Wireless Telemetry (future)
  → Telemetry Ingestion API
  → Supabase PostgreSQL + Realtime
  → Anomaly Detection Pipeline
  → Sensor Fusion + Spatial Correlation
  → Risk Assessment Engine
  → Alert Engine
  → Operator Dashboard + GIS
  → Audit Trail
```

The software platform implements everything from "Telemetry Ingestion API" rightward. The simulator replaces the physical sensor layer for demonstration and development.

---

## 2. Technology Stack (Verified September 2026)

### 2.1 Frontend

| Technology | Version | Justification |
|---|---|---|
| **Next.js** | 16.3.5 | Active LTS, App Router, Turbopack, React Compiler. Already scaffolded. |
| **React** | 19.2.8 | Current stable. Required by Next.js 16. |
| **TypeScript** | ^5 | Type safety across domain models, APIs, and UI. |
| **Tailwind CSS** | 4.x | CSS-first configuration, already configured via PostCSS. Rules require Tailwind. |
| **shadcn/ui** | Latest (CLI-based) | Accessible component primitives (Base UI/Radix). Compatible with TW4 + React 19. |
| **MapLibre GL JS** | 6.10.x | Open-source GIS. No API key required. Free tile sources available. |
| **react-map-gl** | 8.1.x | Declarative React wrapper for MapLibre. Verified compatible. |
| **Recharts** | 3.10.x (stable) or 3.11.x-canary | Charting. shadcn/ui chart components use Recharts. React 19 compatibility has minor issues — canary preferred. Monitor. |
| **Zustand** | 5.0.x | Lightweight state management. Concurrent-safe via `useSyncExternalStore`. |
| **Geist** | (via `next/font`) | Typography — already configured in scaffold. |

### 2.2 Backend

| Technology | Version | Justification |
|---|---|---|
| **Next.js API Routes / Server Actions** | 16.3.5 | Server-side logic. No separate backend server needed. |
| **Supabase** | — | PostgreSQL, Auth, Realtime, Row Level Security, Edge Functions. |
| **@supabase/supabase-js** | 2.116.x | Official client library. |
| **@supabase/ssr** | 0.12.x | Cookie-based auth for Next.js SSR/Middleware. |

### 2.3 Database

| Technology | Detail |
|---|---|
| **PostgreSQL** | 17.x via Supabase (managed) |
| **Supabase Realtime** | WebSocket subscriptions for live telemetry updates |
| **Row Level Security** | Enforced on all data tables |
| **Supabase Migrations** | Schema managed via migration files |

### 2.4 Testing

| Technology | Version | Purpose |
|---|---|---|
| **Vitest** | 5.0.x | Unit and integration tests. Requires Node ≥ 22.12.0 (have v26.5.0 ✓). |
| **React Testing Library** | Latest | Component testing. |
| **happy-dom** | Latest | Lightweight DOM environment for Vitest. |

### 2.5 Deployment

| Technology | Detail |
|---|---|
| **Vercel** | Target deployment platform. Next.js optimised. |
| **Environment variables** | All secrets via Vercel env vars / `.env.local` |

### 2.6 AI/ML (Browser-side)

| Technology | Version | Purpose |
|---|---|---|
| **@kanaries/ml** | Latest | Isolation Forest implementation (sklearn-style API, zero deps, browser-native). |
| **Custom TypeScript** | — | Rolling statistics, z-score, EWMA, CUSUM, rate-of-change, persistence analysis. |

> **Note**: The primary anomaly detection pipeline uses interpretable statistical methods. Isolation Forest is the only ML component, and it runs in-browser or in a Server Action — no external ML service required.

---

## 3. Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     1. UI / PRESENTATION                     │
│  Next.js App Router · shadcn/ui · MapLibre · Recharts        │
├─────────────────────────────────────────────────────────────┤
│                   2. APPLICATION STATE                        │
│  Zustand stores · React Server Components · URL state        │
├─────────────────────────────────────────────────────────────┤
│                    3. DOMAIN LOGIC                            │
│  Typed models · Risk assessment · Alert policies             │
│  Sensor fusion · Spatial correlation · Anomaly scoring       │
├─────────────────────────────────────────────────────────────┤
│                 4. TELEMETRY INGESTION                        │
│  Adapter interface · Simulator adapter · Future ESP32 adapter│
├─────────────────────────────────────────────────────────────┤
│                     5. SIMULATOR                             │
│  Deterministic engine · Scenario library · Seed control      │
├─────────────────────────────────────────────────────────────┤
│                6. ANOMALY / RISK ENGINE                      │
│  Statistical detection · Isolation Forest · Persistence      │
│  Multi-sensor fusion · Spatial correlation · Risk scoring    │
├─────────────────────────────────────────────────────────────┤
│                   7. PERSISTENCE                             │
│  Supabase PostgreSQL · Realtime subscriptions · Migrations   │
├─────────────────────────────────────────────────────────────┤
│                   8. ALERT ENGINE                             │
│  Alert policies · Notification dispatch · Escalation         │
│  In-app · Browser audio · (Optional: email/SMS/webhook)      │
├─────────────────────────────────────────────────────────────┤
│                  9. INTEGRATIONS                             │
│  Future: ESP32 telemetry · Email · SMS · Webhook             │
│  Graceful degradation when unavailable                       │
├─────────────────────────────────────────────────────────────┤
│                  10. AUDIT LOGGING                            │
│  Immutable audit entries · User actions · System events      │
│  Risk transitions · Alert lifecycle                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Separation Rules

1. **Domain logic** (risk calculation, anomaly scoring, sensor fusion) lives in `src/lib/domain/` — never inside React components.
2. **Simulator** lives in `src/lib/simulator/` — separate from presentation.
3. **Database queries** go through typed service modules in `src/lib/services/` — never scattered in UI files.
4. **AI/ML calculations** live in `src/lib/ai/` — not in React components.

---

## 4. Directory Structure (Target)

```
sih26025/
├── docs/                          # Architecture, decisions, roadmap
├── public/                        # Static assets, demo mine GeoJSON
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── (auth)/                # Auth routes (login, callback)
│   │   ├── (dashboard)/           # Protected dashboard routes
│   │   │   ├── overview/
│   │   │   ├── telemetry/
│   │   │   ├── gis/
│   │   │   ├── alerts/
│   │   │   ├── nodes/
│   │   │   ├── analytics/
│   │   │   ├── simulator/
│   │   │   ├── audit/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── api/                   # API route handlers
│   │   │   ├── telemetry/
│   │   │   ├── alerts/
│   │   │   └── simulator/
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing/redirect
│   ├── components/                # Shared UI components
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── charts/                # Recharts wrappers
│   │   ├── gis/                   # Map components
│   │   ├── alerts/                # Alert UI components
│   │   └── layout/                # Shell, sidebar, header
│   ├── lib/                       # Non-UI logic
│   │   ├── domain/                # Domain models and types
│   │   │   ├── types.ts           # Core entity types
│   │   │   ├── risk-states.ts     # Normal→Advisory→Watch→Warning→Critical
│   │   │   └── constants.ts       # Sensor types, units, thresholds
│   │   ├── ai/                    # AI/anomaly pipeline
│   │   │   ├── anomaly-detector.ts
│   │   │   ├── persistence-analyzer.ts
│   │   │   ├── sensor-fusion.ts
│   │   │   ├── spatial-correlation.ts
│   │   │   ├── risk-assessor.ts
│   │   │   └── explainer.ts       # Human-readable explanations
│   │   ├── simulator/             # Mine event simulator
│   │   │   ├── engine.ts
│   │   │   ├── scenarios.ts
│   │   │   ├── sensor-models.ts
│   │   │   └── prng.ts            # Seeded PRNG for determinism
│   │   ├── services/              # Database/API service layer
│   │   │   ├── telemetry.ts
│   │   │   ├── alerts.ts
│   │   │   ├── audit.ts
│   │   │   ├── nodes.ts
│   │   │   └── mines.ts
│   │   ├── supabase/              # Supabase client utilities
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client
│   │   │   └── middleware.ts      # Auth middleware helper
│   │   └── utils/                 # General utilities
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand stores
│   └── middleware.ts              # Next.js middleware (auth)
├── supabase/                      # Supabase local config
│   └── migrations/                # SQL migration files
├── tests/                         # Test files
├── .env.example                   # Environment template
├── .env.local                     # Local env (gitignored)
├── vitest.config.ts               # Test config
└── package.json
```

---

## 5. Core Domain Entities

| Entity | Description | Data Provenance |
|---|---|---|
| Mine | Mine site metadata, boundaries, location | DEMO (fictional demo mine) |
| Panel | Underground mining panel within a mine | DEMO |
| SensorNode | Physical or simulated node (ESP32 equivalent) | DEMO / future LIVE |
| Sensor | Individual sensor on a node (tilt, displacement, vibration, strain, moisture) | DEMO / future LIVE |
| TelemetrySample | Time-series reading from a sensor | SIMULATED / future LIVE |
| SensorHealth | Node/sensor operational status | SIMULATED / future LIVE |
| AnomalyEvent | Detected anomalous behaviour | COMPUTED (from telemetry) |
| RiskAssessment | Current risk state for a node/panel/mine | COMPUTED |
| Alert | Generated notification from risk engine | COMPUTED |
| AlertAcknowledgement | Operator acknowledgement of an alert | USER ACTION |
| AuditEntry | Immutable record of system/user events | SYSTEM |
| SimulationSession | Metadata for a simulation run | SIMULATED |
| User | Authenticated operator | AUTH |
| ExternalObservation | InSAR / contextual data layer | DEMO / EXTERNAL |

---

## 6. Risk State Machine

```
Normal ──→ Advisory ──→ Watch ──→ Warning ──→ Critical
  ↑           ↑          ↑          ↑           │
  └───────────┴──────────┴──────────┴───────────┘
                    (recovery)
```

**States** (exactly five, used everywhere):
1. **Normal** — baseline readings, no anomalies
2. **Advisory** — minor deviation detected, low concern
3. **Watch** — persistent or notable deviation, monitoring increased
4. **Warning** — significant multi-sensor or sustained anomaly, action may be needed
5. **Critical** — severe correlated anomaly, immediate attention required

**Escalation requires**:
- Magnitude of deviation from baseline
- Rate of change
- Persistence (duration above threshold)
- Multiple sensor modalities confirming
- Multiple nearby nodes showing correlation
- Spatial relationship analysis
- Data quality / node health check

**A single transient sensor spike does NOT trigger Critical.**

---

## 7. Authentication & Authorization

### Architecture
- Supabase Auth (email/password for demo)
- `@supabase/ssr` cookie-based session management
- Next.js Middleware for route protection
- Server-side session validation via `supabase.auth.getUser()`

### Roles
| Role | Access |
|---|---|
| Administrator | Full system access, user management, settings |
| Mine Manager | All operational data, reports, alert management |
| Safety Officer | Alerts, risk states, GIS, audit logs |
| Engineer | Telemetry, sensor nodes, analytics, simulator |

### Security Constraints
- Service-role key: **server-side only**, never exposed to browser
- Anon key: exposed via `NEXT_PUBLIC_` prefix
- RLS enforced on all data tables
- API route handlers validate auth before processing
- `.env.example` with placeholders only — no real credentials committed

---

## 8. Telemetry Abstraction

```typescript
// Adapter interface — decouples data source from pipeline
interface TelemetryAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
  onSample(callback: (sample: TelemetrySample) => void): void;
  getProvenance(): DataProvenance; // 'SIMULATED' | 'LIVE' | 'DEMO' | etc.
}
```

**Implementations**:
1. `SimulatorAdapter` — connects simulator engine output to the pipeline (Phase 1)
2. `ESP32Adapter` — future hardware integration (architecture path only)

This adapter pattern ensures the entire downstream pipeline (anomaly detection → risk → alerts → UI) is source-agnostic.

---

## 9. Simulation Engine

### Design
- **Deterministic**: seeded PRNG (e.g., xoshiro128) ensures reproducibility
- **Scenario-based**: predefined event sequences with configurable parameters
- **Session-tracked**: every sample linked to a simulation session ID

### Scenarios
| Scenario | Description |
|---|---|
| `baseline` | Normal mine operation, stable readings |
| `transient-vibration` | Machinery disturbance, temporary sensor response |
| `sensor-drift` | Gradual calibration drift on one sensor |
| `comm-failure` | Node goes offline, data loss pattern |
| `gradual-deformation` | Slow subsurface movement across multiple sensors |
| `progressive-crack` | Crack propagation with accelerating displacement |
| `multi-node-correlated` | Coordinated deformation across adjacent nodes |
| `escalating-multi-modal` | Multiple sensor types showing correlated anomaly |
| `recovery` | Return to baseline after event |

### Controls
Start · Pause · Resume · Reset · Speed (1x/2x/5x/10x) · Scenario select · Seed input · Node selection · Event trigger

---

## 10. AI Pipeline

```
Telemetry Sample
  → Preprocessing (validation, NaN handling, unit normalisation)
  → Baseline Analysis (rolling mean/std over configurable window)
  → Feature Extraction (z-score, rate-of-change, EWMA deviation)
  → Anomaly Detection (statistical thresholds + Isolation Forest)
  → Persistence Analysis (duration above threshold, trend direction)
  → Sensor Fusion (cross-modal correlation within a node)
  → Spatial Correlation (cross-node agreement in geographic proximity)
  → Risk Assessment (weighted scoring → risk state)
  → Explanation Generation (human-readable rationale)
  → Alert Decision (policy-based threshold → alert creation)
```

### Techniques

| Technique | Purpose | Implementation |
|---|---|---|
| Rolling statistics | Baseline establishment | Custom TypeScript |
| Z-score | Deviation magnitude | Custom TypeScript |
| Rate-of-change | Acceleration detection | Custom TypeScript |
| EWMA | Smoothed trend tracking | Custom TypeScript |
| CUSUM | Cumulative drift detection | Custom TypeScript |
| Isolation Forest | Multivariate anomaly detection | `@kanaries/ml` |
| Persistence analysis | Sustained vs. transient classification | Custom TypeScript |
| Cross-modal fusion | Agreement across sensor types | Custom TypeScript |
| Spatial clustering | Geographic correlation | Custom TypeScript |

### What This Is NOT

> [!IMPORTANT]
> - This is **anomaly detection + decision support**, NOT deterministic mine-collapse prediction.
> - Synthetic training data does NOT constitute field validation.
> - All ML model metadata (algorithm, features, training data, limitations) will be documented.
> - The system provides **elevated risk indicators**, not guaranteed failure forecasts.

---

## 11. GIS Architecture

### Technology
- **MapLibre GL JS 6.x** via **react-map-gl 8.x**
- Free tile sources (OpenStreetMap, Protomaps, or similar)
- No API key required for base tiles

### Operational Features
- Mine boundary polygon
- Panel outlines
- Sensor node markers (colour-coded by risk state + health)
- Anomaly event clusters
- Affected region highlighting
- Click-to-inspect: node telemetry, health, risk, alerts
- Time-range filtering
- Legend with risk state colours + pattern indicators (not colour-alone)

### Demo Mine
A **fictional mine layout** will be used, clearly labelled as DEMO. No real underground infrastructure will be fabricated.

---

## 12. External Observation Layer

### InSAR Layer
- **Classification**: DEMO / SIMULATED
- Purpose: illustrative macro-scale surface deformation context
- NOT a live Sentinel-1 processing pipeline
- NOT a replacement for real-time sensor telemetry
- Rendered as a reference overlay on GIS with clear SIMULATED label

### Geomechanical Reference
- **Classification**: DEMO / ILLUSTRATIVE
- Purpose: reference boundaries for educational/contextual display
- NOT validated FLAC3D output
- NOT a failure predictor
- Labelled as illustrative reference, not validated model output

---

## 13. Alerting Architecture

```
Risk Assessment
  → Alert Policy (threshold + condition matching)
  → Alert Creation (with evidence snapshot)
  → Notification Dispatch
     ├── In-app notification (always available) ✓
     ├── Browser audio alarm (always available) ✓
     ├── Visual warning banner (always available) ✓
     ├── Email (optional, requires SMTP credentials)
     ├── SMS (optional, requires provider credentials)
     └── Webhook (optional, requires endpoint)
  → Acknowledgement (operator action)
  → Escalation (if unacknowledged within policy window)
  → Audit Entry (immutable record)
```

### Alert Content (every alert must communicate)
- **WHAT** changed
- **WHERE** it occurred (node, panel, mine)
- **WHEN** it was detected
- **WHICH** sensors contributed
- **WHY** the risk increased (explainable evidence)
- **CURRENT STATE** (risk level)
- **RECOMMENDED ACTION**

### Demo Mode Alerts
All in-app mechanisms work without external credentials. External integrations fail gracefully with logged demo-mode status.

---

## 14. Audit Architecture

| Audited Event | Fields |
|---|---|
| Risk state transition | from_state, to_state, node_id, evidence, timestamp |
| Alert created | alert_id, severity, trigger, evidence |
| Alert acknowledged | alert_id, user_id, timestamp, notes |
| Alert escalated | alert_id, escalation_level, reason |
| Simulation started | session_id, scenario, seed, user_id |
| Simulation stopped | session_id, duration |
| User login/logout | user_id, timestamp, role |
| Settings changed | setting_key, old_value, new_value, user_id |

All entries are **append-only**. No audit record is deleted or modified.

---

## 15. Deployment Architecture

```
Developer Machine
  → git push → GitHub
  → Vercel auto-deploy
  → Environment variables (Vercel dashboard)
  → Supabase (managed PostgreSQL + Auth + Realtime)
```

### Vercel Configuration
- Framework: Next.js (auto-detected)
- Build command: `next build`
- Output: `.next/` (Turbopack)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### Graceful Degradation
- No Supabase → demo mode with local simulator data
- No external notification credentials → in-app alerts only
- No map tile server → fallback to cached/bundled tiles or error state

---

## 16. Reporting Architecture

- Dashboard overview metrics (aggregated from realtime data)
- Historical time-series export (CSV)
- Audit log export (CSV/JSON)
- Alert history report
- Risk assessment timeline
- Node health summary
- No fabricated reports — all data sourced from actual system records
