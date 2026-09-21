# SIH26025 — Final UI/UX Audit & Defect Catalogue (Phase 10)

> Date: 2026-09-21  
> Focus: Presentation Layer & Industrial UI Quality Audit  
> Benchmark: DGMS Industrial Mining Operations & Geotechnical Control Room Standards

---

## 1. Executive Summary

While the underlying platform is functionally complete (all 8 phases operational, 42/42 tests passing, clean Next.js 16 build, Supabase RLS and deterministic simulation intact), a thorough audit of the presentation layer reveals significant visual design and operational UX defects:

1. **Container Bloat ("Card Everything")**: Virtually every metric, status, and snippet of text is wrapped in individual `<Card>` components with heavy borders, causing visual noise and pushing critical spatial and operational intelligence below the fold.
2. **First-Viewport Failure on Dashboard**: The primary operational screen is dominated by 4 oversized KPI cards and marketing-style headers. The GIS map—the single most important spatial tool for a mining safety officer—is buried in a secondary right-hand column below the fold.
3. **Disguised Engineering Station**: The Mine Simulator is treated as a glossy consumer dashboard with giant metric blocks and non-industrial iconography (`Sparkles`), rather than a disciplined engineering test bench.
4. **Typography & Styling Gaps**: Default Geist fonts remain loaded rather than industrial workhorses `Inter` and `IBM Plex Mono`. Border radiuses and badge styling occasionally lean towards SaaS templates rather than precision instrumentation.
5. **Superficial "AI Slop" & Fake Metrics**: Instances of artificial confidence percentages (e.g., `Confidence: 91.2%` in Analytics) and marketing-style labels detract from technical credibility.
6. **Navigation Redundancy**: Small badges and duplicate pills across the header and sidebar clutter the operational command hierarchy.

---

## 2. Screen-by-Screen Audit Findings

### 2.1 Global Header (`src/components/layout/top-header.tsx`)
- **Issues Identified**:
  - Contains too many micro-indicators competing for visual attention (multiple badges, redundant radio indicators, tiny dots).
  - Colliery name and district context lack authoritative industrial typography.
  - Telemetry node count, risk status, simulation state, siren mute, and role switcher are strung together without clear functional grouping.
- **Remediation**:
  - Restructure into 3 clear operational zones:
    1. **Mine Identity & Location**: `Bhowra-West Colliery • Jharia Coalfield` with clear Seam & District metadata.
    2. **Operational State**: Mode (`LIVE` / `SIMULATED` / `DEMO`) + Consolidated Fleet Link Status (`16/16 Online`) + Global Risk Level (`Normal` / `Warning` / etc.).
    3. **Active Alert Priority & User Role**: Single high-contrast Alert Status banner/button with audio siren toggle + Role Switcher dropdown.

### 2.2 Navigation Sidebar (`src/components/layout/sidebar-nav.tsx`)
- **Issues Identified**:
  - Labels do not match standard mine control room terminology (`Sensor Metrology` instead of `Sensor Analytics`, `Alerts & Evac` instead of `Alerts & Evacuation`).
  - Unnecessary decorative badge containers.
- **Remediation**:
  - Adopt the exact 5-group operational hierarchy:
    - **MONITOR**: Dashboard, Mine & Panels, Underground GIS, Live Telemetry
    - **INTELLIGENCE**: Node Fleet, Sensor Analytics, Subsidence Events, AI Risk Analytics, Mine Simulator
    - **RESPONSE**: Alerts & Evacuation, Infrastructure
    - **TRACEABILITY**: Audit Trail, DGMS Reports
    - **SYSTEM**: Safety Settings
  - Show numerical badges strictly for actionable events (e.g. active unacknowledged alerts).

### 2.3 Operations Dashboard (`src/app/(dashboard)/page.tsx`)
- **Issues Identified**:
  - The first viewport fails to immediately answer the 6 critical operational questions:
    1. *What* is happening?
    2. *Where* is it occurring?
    3. *What* is the current risk state?
    4. *Is* there an active alert requiring evacuation/sign-off?
    5. *Why* did the risk change?
    6. *What* should the operator inspect?
  - 4 large KPI cards consume ~280px of vertical space, pushing GIS and evidence dossier below the fold.
  - The GIS map is demoted to a tiny sidebar box instead of being the centerpiece.
- **Remediation**:
  - Re-architect the first viewport as an **Integrated Operational Command Surface**:
    - **Top Bar**: Instant answer to *What, Where, and Current State* + Active Incident Callout with single-click statutory sign-off.
    - **Core Viewport**: Split layout with **Interactive Underground GIS** on the left (60% width) and **"Why This Risk Changed" Evidence Dossier & Action Directives** on the right (40% width).
    - **Bottom Utility Strip**: Compact tabular telemetry trend strip and fleet health overview—eliminating giant KPI cards.

### 2.4 Mine Simulator (`src/app/(dashboard)/simulator/page.tsx`)
- **Issues Identified**:
  - Uses `Sparkles` icon and fluffy headers.
  - Duplicates the dashboard's large metric cards and alert panels.
  - Feels like a secondary dashboard rather than an engineering calibration and simulation workbench.
- **Remediation**:
  - Redesign as a **Geotechnical Simulation & Test Bench**:
    - **Left Control Console**: Scenario selector with geotechnical failure descriptions, deterministic Mulberry32 seed input, speed multiplier (1x, 2x, 5x, 10x), and execution controls (Start, Pause, Reset).
    - **Right Engineering Telemetry & Progression**: Phase timeline (Initiation → Acceleration → Goaf Consolidation), affected node cluster matrix, live channel delta table, and real-time risk engine output.
    - Zero oversized KPI cards; high-density tabular and time-series telemetry.

### 2.5 Mine & Panels (`src/app/(dashboard)/mine/page.tsx`)
- **Issues Identified**:
  - Uses 3 generic cards for basic parameters like "Extraction Method" and "Depth Range".
- **Remediation**:
  - Redesign as a structured **Colliery Geological & Extraction Specification Dossier**:
    - Clean technical specification grid (Bord & Pillar parameters, Barakar sandstone lithology, sand stowing ratios).
    - Panel status register with extraction progress, goaf status, and direct GIS jump links.

### 2.6 Underground GIS (`src/app/(dashboard)/gis/page.tsx`)
- **Issues Identified**:
  - Canvas is surrounded by redundant cards and padding that restrict map area.
- **Remediation**:
  - Convert into a dedicated **Geospatial Surveillance Workspace**:
    - Maximize canvas viewport with top HUD overlay for layer toggles (Panels, Nodes, InSAR, Geomechanical, Infrastructure).
    - Sliding side-drawer or synchronized lower panel for Node Investigation and Event Investigation.

### 2.7 Sensor Fleet & Metrology (`src/app/(dashboard)/nodes/page.tsx`, `sensors/page.tsx`)
- **Issues Identified**:
  - Fragmented across repetitive cards.
- **Remediation**:
  - High-density industrial table with sortable node codes, installation coordinates, battery percentage bars, LoRa RSSI link quality, and live tare calibration registry.

### 2.8 Subsidence Events (`src/app/(dashboard)/events/page.tsx`)
- **Issues Identified**:
  - Event cards are visually repetitive and lack clear chronological and spatial hierarchy.
- **Remediation**:
  - Geotechnical event chronology table with epicenter node, affected panels, peak displacement velocity, and direct drill-down to evidence and GIS coordinates.

### 2.9 AI Risk Analytics (`src/app/(dashboard)/analytics/page.tsx`)
- **Issues Identified**:
  - Displays fabricated `Confidence: 91.2%` badge.
  - High card fragmentation.
- **Remediation**:
  - Focus strictly on explainable statistical metrics:
    - Robust Z-score progression across channels.
    - Multi-station Pearson correlation matrix.
    - Modality concordance (Tilt vs Displacement vs Vibration).
    - Real evidence statements ("4 of 5 nodes in Panel P-101 exceed 2.5σ baseline") with zero fake percentages.

### 2.10 Alerts & Emergency Response (`src/app/(dashboard)/alerts/page.tsx`)
- **Issues Identified**:
  - Good functionality (statutory sign-off modal and Web Audio siren), but alert queue contains redundant styling.
- **Remediation**:
  - Tighten incident priority hierarchy: Active Unacknowledged Incidents at top with prominent DGMS CMR 2017 Reg 112 sign-off trigger, followed by chronological audit history.

### 2.11 Audit Trail & DGMS Reports (`src/app/(dashboard)/audit/page.tsx`, `reports/page.tsx`)
- **Issues Identified**:
  - Generic card containers around tables.
- **Remediation**:
  - Convert Reports into formal **DGMS Document-Oriented Layouts** (Form-IV Monthly Subsidence Return, Shift Handover Log) with clear print/export readiness.
  - Audit log as an immutable, high-density ledger.

---

## 3. Typography, Tokens & Aesthetic System

| Element | Old / Flawed State | Phase 10 Industrial Standard |
|---|---|---|
| **Primary Sans Font** | Geist Sans | **Inter** (`var(--font-inter)`) |
| **Monospace Font** | Geist Mono | **IBM Plex Mono** (`var(--font-ibm-plex-mono)`) |
| **Surfaces** | Plain white / stark dark with heavy borders | Neutral slate (`bg-slate-50`, `dark:bg-slate-950`, border `slate-200/800`) |
| **Accents** | Inconsistent blues/purples/pinks | Restrained steel blue (`slate-700`, `sky-700`, `indigo-950/30`) |
| **Risk Terminology** | Inconsistent casing / badges | Exact 5 states: `Normal`, `Advisory`, `Watch`, `Warning`, `Critical` |
| **Cards & Containers** | Card-everything with `p-6` | Information hierarchy, subtle section dividers, tabular density |
| **Shadows & Radius** | Rounded-2xl / rounded-3xl | `rounded-sm` (2px) / `rounded-md` (4px), minimal or no shadows |
| **Iconography** | Generic/fluffy (`Sparkles`) | Industrial instruments (`Gauge`, `Compass`, `Radio`, `Layers`, `Shield`) |
