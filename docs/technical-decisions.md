# SIH26025 — Technical Decisions

> Version: 1.0 (Phase 0 Lock)  
> Date: 2026-09-20

---

## Decision Log

Each decision is classified as:
- **FACT** — verified against current documentation/versions
- **ASSUMPTION** — reasonable engineering judgement, not yet validated in production
- **SIMULATION** — pertains to demo/simulated behaviour only

---

### TD-001: Next.js 16 as Full-Stack Framework

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use Next.js 16.3.5 (App Router) as the single full-stack framework |
| Rationale | Already scaffolded. Active LTS. Turbopack stable. React Compiler built-in. Server Components + Server Actions eliminate need for separate backend. Vercel-native deployment. |
| Alternatives rejected | Separate Express/Fastify backend (unnecessary complexity for this scale). Remix (less Vercel-optimised). |
| Risk | Next.js 16 is the current major version. No compatibility risk identified. |

---

### TD-002: Tailwind CSS 4 (CSS-First)

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use Tailwind CSS 4.x with `@tailwindcss/postcss` plugin and `@theme` directive |
| Rationale | Already configured in scaffold. CSS-first config model (no `tailwind.config.js`). Required by project rules. Compatible with shadcn/ui. |
| Alternatives rejected | Vanilla CSS (project rules specify Tailwind). Tailwind v3 (outdated, v4 already configured). |

---

### TD-003: shadcn/ui for Component Primitives

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use shadcn/ui (CLI-based, copy-paste components) with Base UI as default base |
| Rationale | Accessible. Customisable. Compatible with TW4 + React 19. Project rules specify "accessible component primitives". Not a dependency — code is owned. |
| Alternatives rejected | Headless UI (less component variety). MUI (too opinionated for industrial UI). Ant Design (heavy, wrong aesthetic). |
| Note | shadcn/ui September 2026 uses dedicated `cn` package. |

---

### TD-004: MapLibre GL JS 6.x for GIS

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use MapLibre GL JS 6.10.x via react-map-gl 8.1.x |
| Rationale | Open source, no API key for tiles. ESM-native (v6). WebGL2 required (acceptable — modern browsers). Project rules specify "MapLibre-based GIS unless a justified alternative is selected". |
| Alternatives rejected | Leaflet (less capable for dense data). Mapbox GL JS (proprietary, requires paid API key). OpenLayers (heavier API surface). |
| Tile source | Free: OpenFreeMap, Protomaps, or Stadia Maps (free tier). Decision deferred to implementation. |

---

### TD-005: Recharts for Charting

| Field | Value |
|---|---|
| Classification | FACT (with caveat) |
| Decision | Use Recharts 3.10.x (stable) or 3.11.x-canary if React 19 issues arise |
| Rationale | shadcn/ui chart components wrap Recharts. Wide adoption. Adequate for time-series, bar, line, area charts needed here. |
| Caveat | React 19 compatibility has reported minor blank-chart issues in some configurations. Canary 3.11.x may resolve these. Monitor during Phase 1. |
| Alternatives considered | Apache ECharts (heavier, better for massive datasets — not required here). Nivo (comparable but less shadcn/ui integration). |
| Fallback | If Recharts proves unreliable with React 19, switch to Nivo or lightweight-charts. |

---

### TD-006: Zustand 5.x for State Management

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use Zustand 5.0.x for client-side state management |
| Rationale | Concurrent-safe (`useSyncExternalStore`). Minimal API. React 19 + React Compiler compatible (with `useShallow`). No boilerplate. |
| Alternatives rejected | Redux Toolkit (too heavy for this application). Jotai (atomic model less suited to operational dashboard state). React Context alone (insufficient for complex cross-component state). |

---

### TD-007: Supabase for Backend Services

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use Supabase (managed) for PostgreSQL, Auth, Realtime, and RLS |
| Rationale | Project rules specify Supabase. Managed PostgreSQL 17.x. Built-in Auth. Realtime subscriptions for live telemetry. RLS for security. Free tier adequate for development/demo. |
| Client libraries | `@supabase/supabase-js` 2.116.x + `@supabase/ssr` 0.12.x |
| Region | ap-south-1 (Mumbai) — closest to India deployment context |
| Note | Supabase project does not yet exist. Will be created in Phase 1. |

---

### TD-008: Vitest 5.x for Testing

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use Vitest 5.0.x with React Testing Library and happy-dom |
| Rationale | Fast. Compatible with React 19. Node 26.5.0 satisfies requirement (≥ 22.12.0). Next.js official docs recommend Vitest. |
| Alternatives rejected | Jest (slower, less modern). Playwright (for E2E, not unit/integration). |

---

### TD-009: Interpretable AI Pipeline (No Deep Learning)

| Field | Value |
|---|---|
| Classification | ASSUMPTION |
| Decision | Use statistical methods + Isolation Forest. No deep learning. |
| Rationale | Project rules: "Prefer interpretable hybrid intelligence". Mine subsidence patterns are characterisable with rolling statistics, z-scores, EWMA/CUSUM, and persistence analysis. Isolation Forest handles multivariate anomaly detection without requiring labelled training data (unsupervised). All methods explainable. |
| ML library | `@kanaries/ml` — sklearn-style Isolation Forest, zero deps, browser-native. |
| Constraint | Synthetic training data will be explicitly labelled as SIMULATED. No accuracy claims will reference synthetic data as field validation. |
| What this is NOT | Deterministic collapse prediction. Validated geomechanical model. Proven failure forecaster. |

---

### TD-010: Seeded PRNG for Simulator Determinism

| Field | Value |
|---|---|
| Classification | ASSUMPTION |
| Decision | Use xoshiro128 (or equivalent) seeded PRNG for all simulator randomness |
| Rationale | Same seed + same scenario = identical output sequence. Required by project rules. Essential for reproducible demos and debugging. |
| Standard `Math.random` | NOT used — not seedable. |

---

### TD-011: Demo Mine (Fictional)

| Field | Value |
|---|---|
| Classification | SIMULATION |
| Decision | Use a clearly labelled fictional mine layout for demonstration |
| Rationale | No real mine geospatial data is available. Fabricating real mine infrastructure would violate project rules. |
| Demo mine spec | Fictional mine with 4-6 panels, 15-25 sensor nodes, representative sensor distribution. Centred on a plausible Indian coalfield location (approximate coordinates, labelled DEMO). |

---

### TD-012: InSAR as Illustrative Layer

| Field | Value |
|---|---|
| Classification | SIMULATION |
| Decision | InSAR is a DEMO/SIMULATED contextual overlay, NOT live satellite processing |
| Rationale | No live Sentinel-1 InSAR processing pipeline exists. Project rules explicitly prohibit claiming live InSAR unless actually implemented. |
| Implementation | Simulated surface deformation raster/contour overlay on GIS, clearly labelled "SIMULATED — Illustrative InSAR" |
| Constraint | Never presented as real satellite observation. |

---

### TD-013: FLAC3D as Reference Layer

| Field | Value |
|---|---|
| Classification | SIMULATION |
| Decision | Geomechanical reference boundaries are ILLUSTRATIVE only |
| Rationale | No genuine FLAC3D numerical modelling output is available. Project rules prohibit fabrication. |
| Implementation | Optional reference boundary overlay labelled "ILLUSTRATIVE — Not Validated Model Output" |
| Constraint | Never presented as validated failure threshold or predictor. |

---

### TD-014: No Lock File — Clean Install Required

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Run `npm install` to generate `package-lock.json` before any development |
| Rationale | Scaffold was created but lock file is missing. `node_modules` contains extraneous packages. Clean install ensures deterministic dependency resolution. |

---

### TD-015: npm as Package Manager

| Field | Value |
|---|---|
| Classification | FACT |
| Decision | Use npm (v12.0.1) — the default already present |
| Rationale | Scaffold uses npm conventions. No pnpm/yarn configuration exists. npm is adequate for this project scale. |
| Alternatives considered | pnpm (faster installs, stricter). Not worth migration cost from existing scaffold. |

---

### TD-016: Data Provenance Labelling

| Field | Value |
|---|---|
| Classification | FACT (rule-mandated) |
| Decision | Every data stream must carry a provenance tag |
| Tags | `LIVE`, `SIMULATED`, `DEMO`, `HISTORICAL`, `EXTERNAL`, `EXPERIMENTAL`, `ASSUMPTION` |
| Implementation | `provenance` field on all domain entities. UI must display provenance indicators. |
| Rationale | Core project rule. Judges must be able to distinguish what is real from what is simulated. |
