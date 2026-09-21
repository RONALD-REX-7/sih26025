# SIH26025 — Phase 10 Professional UI/UX Redesign Plan

> Date: 2026-09-21  
> Focus: Implementation Architecture for Full Presentation Layer Reconstruction  
> Constraints: 100% preservation of backend, domain logic, AI engine, simulator, Supabase RLS, and APIs.

---

## 1. Visual Design Tokens & Typography Architecture

### 1.1 Fonts
- **Sans Serif**: `Inter` loaded via `next/font/google` (`--font-inter`).
- **Monospace**: `IBM Plex Mono` loaded via `next/font/google` (`--font-ibm-plex-mono`).
- Selective Monospace usage: Node codes (`SN-102`), coordinates (`23.7042°N`), engineering values (`18.50 mm`), timestamps (`11:14:02 IST`), channel codes (`TILT_X`), and statutory regulation references (`CMR 2017 Reg. 112`).

### 1.2 Color & Surface Palette
- **Neutral Industrial Surfaces**:
  - Light mode: Canvas `bg-slate-100` / `bg-white`, panels `bg-white` with `border-slate-200`, subtle dividers `border-slate-200/80`.
  - Dark mode: Canvas `dark:bg-slate-950`, panels `dark:bg-slate-900` with `dark:border-slate-800`, subtle dividers `dark:border-slate-800/80`.
- **Restrained Industrial Accent**:
  - Steel blue / Slate: `text-slate-900 dark:text-slate-100`, accents `sky-700 dark:text-sky-400`.
- **Semantic Risk States** (Exact 5 DGMS states):
  - `Normal`: Emerald (`emerald-700 dark:text-emerald-400`, `bg-emerald-50 dark:bg-emerald-950/40`, `border-emerald-200 dark:border-emerald-800`)
  - `Advisory`: Sky Blue (`sky-700 dark:text-sky-400`, `bg-sky-50 dark:bg-sky-950/40`, `border-sky-200 dark:border-sky-800`)
  - `Watch`: Amber (`amber-700 dark:text-amber-400`, `bg-amber-50 dark:bg-amber-950/40`, `border-amber-300 dark:border-amber-800`)
  - `Warning`: Orange (`orange-700 dark:text-orange-400`, `bg-orange-50 dark:bg-orange-950/40`, `border-orange-300 dark:border-orange-800`)
  - `Critical`: Rose / Crimson (`rose-700 dark:text-rose-400`, `bg-rose-50 dark:bg-rose-950/40`, `border-rose-300 dark:border-rose-800`)

---

## 2. Redesign Specification by Subsystem

### 2.1 Global Header (`src/components/layout/top-header.tsx`)
1. **Mine Identity**:
   - `Bhowra-West Colliery` • `Jharia Coalfield` • `Seam VII/VIII`
2. **Operational Mode Badge**:
   - Clean, restrained `LIVE`, `SIMULATED`, or `DEMO` badge.
3. **Consolidated System Health**:
   - `16/16 Nodes Online` + `Risk: [CURRENT STATE]`.
4. **Active Alert & Siren Control**:
   - Immediate visual indicator if active incident exists. Audio mute/unmute button.
5. **Evaluator Persona Switcher**:
   - Dropdown for `SafetyOfficer`, `MineManager`, `Engineer`, `Administrator`.

### 2.2 Navigation Sidebar (`src/components/layout/sidebar-nav.tsx`)
1. **Brand**:
   - `SIH26025` • `Subsidence Early Warning` (Clean typography, no flashy gradients).
2. **Groups & Items**:
   - **MONITOR**: `Dashboard` (`/dashboard`), `Mine & Panels` (`/mine`), `Underground GIS` (`/gis`), `Live Telemetry` (`/telemetry`)
   - **INTELLIGENCE**: `Node Fleet` (`/nodes`), `Sensor Analytics` (`/sensors`), `Subsidence Events` (`/events`), `AI Risk Analytics` (`/analytics`), `Mine Simulator` (`/simulator`)
   - **RESPONSE**: `Alerts & Evacuation` (`/alerts`), `Infrastructure` (`/infrastructure`)
   - **TRACEABILITY**: `Audit Trail` (`/audit`), `DGMS Reports` (`/reports`)
   - **SYSTEM**: `Safety Settings` (`/settings`)
3. **Badges**:
   - Active alert count on `Alerts & Evacuation` when > 0. All unnecessary decorative badges eliminated.

### 2.3 Operations Dashboard (`src/app/(dashboard)/page.tsx`)
**Primary First-Viewport Architecture**:
- **Zone A: Command Bar**:
  - Title: `Bhowra-West Colliery • Operations Command Surface`
  - Current Risk Badge + Provenance + DGMS CMR 2017 Reg. 112 Compliance state.
  - Active Alert Action Callout (if active incident exists: immediate sign-off / escalation button; if nominal: clean single-line nominal status).
- **Zone B: Central Operational Workspace (Split View)**:
  - **Left (60% width)**: **Interactive GIS Map** with live node markers, panel boundaries, and active subsidence highlights. Direct click-to-inspect node/event.
  - **Right (40% width)**: **"Why This Risk Changed" Evidence Dossier & Action Directives**:
    - Current state rationale.
    - Specific evidence points (rate of change, persistence duration, modality agreement, spatial correlation score).
    - Recommended action for the on-duty safety officer.
- **Zone C: Operational Telemetry & Fleet Summary Strip**:
  - High-density tabular telemetry summary (Tilt, Displacement, Vibration, Strain) with rate-of-change deltas.
  - Quick fleet health summary (Online / Degraded / Offline counts).

### 2.4 Mine Simulator (`src/app/(dashboard)/simulator/page.tsx`)
**Engineering Test Station Layout**:
- **Zone A: Station Header**:
  - Title: `Deterministic Geotechnical Simulator & Calibration Test Bench`
  - Mulberry32 PRNG status + tick counter.
- **Zone B: Control Bench (Left Panel)**:
  - Scenario Selector with geotechnical failure descriptions (e.g. `MULTI_NODE_CORRELATED_DEFORMATION`).
  - Seed controller (input, randomize, copy).
  - Playback controls: Start, Pause, Resume, Reset, Speed multipliers (1x, 2x, 5x, 10x).
  - Panel & Node injection toggles.
- **Zone C: Telemetry & Event Response (Right Panel)**:
  - Real-time channel readouts in compact tabular form.
  - Progression phase timeline (Initiation → Acceleration → Goaf Consolidation).
  - Risk engine output and evidence explanation in real time.

### 2.5 Mine & Panels (`src/app/(dashboard)/mine/page.tsx`)
- Architectural geological dossier:
  - Seam stratigraphy specifications (Depth, thickness, sandstone/shale ratio).
  - Bord & Pillar extraction parameters with hydraulic sand stowing.
  - Panel status register (P-101 to P-104) with extraction status, depillaring stage, active sensor nodes, and GIS jump links.

### 2.6 Underground GIS (`src/app/(dashboard)/gis/page.tsx`)
- Full-bleed geospatial surveillance workstation:
  - Top HUD for layer toggles (Panels, Nodes, InSAR, Geomechanical Profile, Infrastructure).
  - Split layout or sliding inspector drawer for Node Inspector and Event Inspector.
  - Geomechanical subsidence limit curve (CMPDI empirical hyperbolic tangent) as an expandable reference drawer.

### 2.7 Sensor Fleet & Analytics (`src/app/(dashboard)/nodes/page.tsx`, `sensors/page.tsx`)
- Node Fleet (`/nodes`): Industrial inventory table with live battery level bars, LoRa RSSI link budgets, firmware version, and status.
- Sensor Analytics (`/sensors`): Transducer channel metrology, calibration tare registry (zero offsets), physical sensor specifications.

### 2.8 Subsidence Events (`src/app/(dashboard)/events/page.tsx`)
- Chronological event register with epicenter, affected radius, peak displacement, goaf line association, and drill-down evidence.

### 2.9 AI Risk Analytics (`src/app/(dashboard)/analytics/page.tsx`)
- Scientific anomaly analytics:
  - Multi-station Pearson spatial correlation matrix.
  - Cross-modality concordance (Tilt X/Y vs Extensometer Disp Z vs Seismograph PPV).
  - Rolling Z-score distribution and persistence window analysis.
  - Zero fake confidence percentages. Clear statistical evidence statements.

### 2.10 Alerts & Evacuation (`src/app/(dashboard)/alerts/page.tsx`)
- Active incident queue prioritized by severity (`Critical` > `Warning` > `Watch`).
- Web Audio industrial siren control.
- CMR 2017 Reg 112 Statutory Sign-Off modal dialog.
- Chronological dispatch history.

### 2.11 Audit Trail & Reports (`src/app/(dashboard)/audit/page.tsx`, `reports/page.tsx`)
- Audit Trail: Immutable append-only operational ledger with role filtering, event payload inspection, and CSV/JSON export.
- DGMS Reports: Formal document-oriented layouts for Form-IV Monthly Return and Shift Handover Log.

### 2.12 Safety Settings (`src/app/(dashboard)/settings/page.tsx`)
- Operational threshold calibration (Tilt warning arcsec, Displacement mm, Vibration mm/s).
- Notification routing rules and simulation baseline settings.

---

## 3. Humanization & Terminology Standards

- **Scrubbed**: "AI Danger Detected", "AI Confidence 97%", "Intelligence Score", "Super AI Model".
- **Standardized**: "Persistent multi-node deformation anomaly", "Evidence: 4/5 nearby nodes show correlated deviation", "Statistical Anomaly Detection", "Geotechnical Risk Assessment".

---

## 4. Verification Workflow

1. `npx tsc --noEmit` & `npm run lint` & `npm test` after all UI updates.
2. Production build verification: `npm run build`.
3. Browser verification with `@ChromeDevTools` across breakpoints:
   - 1440px (Desktop Control Room)
   - 1280px (Standard Display)
   - 1024px (Compact Workstation)
   - 768px (Tablet)
   - 390px (Mobile Field Inspector)
