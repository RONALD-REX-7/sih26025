# SIH26025 — Frontend Reconstruction Specification
**Document Version:** 1.0.0  
**Target:** Engineering Blueprint for Complete Frontend Modernization & Ergonomic Restructuring  
**Mandate:** Transform the AI-generated card-heavy interface into an authoritative, human-designed industrial operations platform.  

---

## 1. Component Grammar: Structural Classification Rules

To permanently cure "Card-Everything Syndrome", all components must adhere to the strict selection grammar below. A developer or agent is forbidden from wrapping arbitrary data in a `<Card>` without satisfying the specific criteria.

```
                               ┌────────────────────────┐
                               │ What is the data type? │
                               └───────────┬────────────┘
                                           │
         ┌──────────────────┬──────────────┴───────┬──────────────────┐
         ▼                  ▼                      ▼                  ▼
   [Tabular Data]    [Sequential Events]    [Continuous Space]    [Key Stat / Flag]
         │                  │                      │                  │
    Use: TABLE        Use: TIMELINE          Use: MAP CANVAS     Use: INLINE METRIC
 (Stations, Logs,    (Shift Handover,         (GIS Underground,   (Single stat in
   Form IV rows)      Anomaly Sequence)       Borehole Stations)   header bar/banner)
```

### 1.1 Structural Grammar Matrix

| Component Type | Permitted Use Cases | Prohibited Use Cases | Required Visual Treatment |
| :--- | :--- | :--- | :--- |
| **Data Table** | Dense multi-station sensor lists, audit logs, node inventories, threshold configuration matrices. | Never wrap each individual row or item inside its own sub-card. | Clean `#FFFFFF` table with subtle `#EDF1F0` header, 1px `#D7DEDC` borders, sticky headers, zebra hover. |
| **Timeline** | Chronological event progressions, incident timelines, simulation replay ticks. | Never use disconnected floating cards separated by large gaps. | Continuous vertical 2px spine (`#D7DEDC`) with anchored milestone nodes and direct timestamps. |
| **Section** | Conceptual grouping of page content (e.g., *Surface Infrastructure*, *Geotechnical Parameters*). | Never enclose an entire section in a heavy outer card container. | Clean H2 heading (18–22px) with optional 1px horizontal rule divider below. |
| **Split Pane** | Master-detail inspection (e.g., GIS map on left 65%, station telemetry investigator on right 35%). | Never use overlapping floating cards or modals that obscure the map. | Fixed two-column layout separated by a crisp 1px `#D7DEDC` vertical border. |
| **Map Canvas** | Underground spatial layout, borehole extents, panel perimeters, railway buffer zones. | Never restrict map canvas to a small thumbnail card. | Large, primary viewport taking at least 60–70% of available screen real estate. |
| **List** | Alert incident queues, active notifications, document templates. | Never use a grid of 3x3 cards where a single scannable list communicates sequence. | Vertical list with subtle 1px divider between items, hover highlight, direct action button. |
| **Inline Metric** | High-level colliery vitals (e.g., *Active Directives: 1*, *Fleet: 16/16 Online*). | Never create 4 giant identical rectangular KPI cards at the top of every single screen. | Horizontal header bar item with label (12px uppercase) and value (16px mono) separated by subtle pipes. |
| **Card (Spared)** | **Strictly limited:** Standalone operational dossiers, active emergency incident banners, modal dialogs. | Banned for individual telemetry channels, list items, or static text paragraphs. | Max 2–3 per screen. White surface, 1px `#D7DEDC` border, 0px shadow. |
| **Drawer / Sheet** | Deep inspection of a selected station or anomaly evidence dossier. | Never use a drawer when a persistent split pane can maintain spatial orientation. | Right-anchored sliding sheet (400px width), clean typography, tabular sensor breakdown. |
| **Modal Dialog** | Irreversible regulatory commitments (e.g., CMR 2017 Reg 112 Statutory Incident Sign-Off). | Never use for simple data inspection or routine navigation. | Centered modal (max 540px width), dark overlay (`rgba(29, 41, 51, 0.4)`), clear primary/cancel buttons. |

---

## 2. Eradication of Badge & Pill Inflation

### 2.1 The Badge Elimination Rule
- `<Badge>` components are **PROHIBITED** for static metadata, protocol names, firmware versions, node IDs, and sampling rates.
- **Before:** `[ESP32 LoRa]` in blue pill, `[Bord & Pillar]` in purple pill, `[SN-102]` in gray pill.
- **After:** Plain typography: `ESP32 LoRa • Bord & Pillar • Stn: SN-102` in 13px secondary text (`#52606D`).

### 2.2 Reserved Badge Usage
Badges are strictly reserved for dynamic safety risk states:
- `Normal` (Green text `#2F6B4F` on `#EAF2ED` background)
- `Advisory` (Amber text `#9A6A00` on `#FBF6E9` background)
- `Watch` (Orange text `#A85A00` on `#FCF2E9` background)
- `Warning` (Dark Orange text `#A85A00` on `#FCF2E9` background)
- `Critical` (Red text `#B42318` on `#FDF0ED` background)

All other status indicators must use a simple **6px circular dot** followed by plain text (e.g., `● Online`, `○ Disconnected`).

---

## 3. Main Dashboard Architectural Reconstruction Blueprint

The main dashboard (`/dashboard`) must be reconstructed from the ground up as a true **Colliery Operations Command Surface**.

### 3.1 The 7 Operational Questions

Every element on `/dashboard` must directly answer one of seven operational questions:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CURRENT CONDITION & ACTIVE ALERTS: High-Priority Operational Status Bar             │
│    Mine Condition: NORMAL [L0]  |  Active Alert: 1 ADVISORY  |  Fleet: 16/16 Online    │
├───────────────────────────────────────────────────┬────────────────────────────────────┤
│ 2. WHAT IS HAPPENING & WHERE?                     │ 3. WHAT CHANGED & WHY?             │
│    Central GIS Underground Surveillance Canvas    │    Explainable Risk & Evidence     │
│    (65% Width)                                    │    Dossier (35% Width)             │
│                                                   │                                    │
│    - Panel boundaries (P-101 to P-104)            │    - Active Hazard: Multi-Station  │
│    - Station markers with live risk color rings   │      Tilt Rate Acceleration        │
│    - 45m Railway Protection Buffer                │    - Epicenter: Station SN-102     │
│    - Active subsidence depression contours        │    - Contributing Transducers      │
│    - One-click station selection                  │    - Rate: 1.24 mm/m/hr (> 1.00)   │
│                                                   │    - Regulatory Status: CMR 112    │
├───────────────────────────────────────────────────┴────────────────────────────────────┤
│ 4. WHAT SHOULD THE OPERATOR INSPECT?                                                   │
│    Station Fleet Telemetry & Transducer Status Table (Full Width)                      │
│    Columns: Station | Panel | Subsidence (mm) | Tilt X/Y (mm/m) | Vibration | Battery  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Architectural Decisions for `/dashboard`
1. **Eliminate the 4 Generic Top KPI Cards:** Replace with a single, calm **Operational Status Bar** (48px height) providing instant situational awareness without visual clutter.
2. **GIS Map Promoted to Core Primary Surface:** The map canvas expands to 65% width and 520px height, giving operators continuous geographic grounding.
3. **Evidence Dossier Docked Directly Beside GIS:** Eliminates scrolling down to find "Why did the alert trigger?". When an operator clicks a node on the GIS map, the evidence dossier immediately updates on the right.
4. **Simulator Banished to Secondary Mode:** The main dashboard shows real or simulated data seamlessly, but does **not** clutter the screen with PRNG seed inputs or scenario cards. A subtle indicator in the top header (`MODE: SIMULATOR (5x)`) links to `/simulator` for deep workbench calibration.

---

## 4. Navigation & Layout Frame Reconstruction

### 4.1 Global Header (Top Bar — 48px Height)
- **Left:** Colliery Identifier (`Bhowra-West Colliery • Seam VII/VIII • Jharia Coalfield`) in 14px SemiBold text.
- **Center:** Real-time Clock (`13:35:12 IST`) in 13px IBM Plex Mono, followed by `DGMS CMR 2017 Reg 112 Compliance Active`.
- **Right:** 
  - Operator Persona Switcher (`Safety Officer: Rajesh Kumar`).
  - Active Alert Counter (`1 Active Alert` with subtle amber dot).
  - Telemetry Ingestion Mode Indicator (`● Ingestion Active • 16/16 Nodes`).

### 4.2 Sidebar Navigation (Left Column — 240px Width)
- Background: Surface White (`#FFFFFF`) with 1px border-right (`#D7DEDC`).
- Grouped into 4 logical functional modules with clean, understated section labels (11px uppercase `#74808A`):
  1. **OPERATIONS:** Dashboard (`/dashboard`), Mine & Panels (`/mine`), Underground GIS (`/gis`), Live Telemetry (`/telemetry`).
  2. **INTELLIGENCE:** Station Fleet (`/nodes`), Sensor Analytics (`/sensors`), Event Log (`/events`), AI Risk Engine (`/analytics`), Strata Simulator (`/simulator`).
  3. **RESPONSE:** Alert Center (`/alerts`), Surface Infrastructure (`/infrastructure`).
  4. **COMPLIANCE:** Audit Trail (`/audit`), DGMS Reports (`/reports`), Safety Settings (`/settings`).
- Active link: `#EDF1F0` background with `2px solid #173B57` left border indicator. Font size: 14px Medium `#1D2933`.

---

## 5. Linguistic Humanization & Industrial Terminology Dictionary

All artificial, generic AI, and marketing jargon must be eradicated. Use strictly approved industrial and mining terminology:

| Banned AI / Generic Term | Approved Operational Term | Context & Operational Justification |
| :--- | :--- | :--- |
| *Mulberry32 Deterministic Telemetry Test Bench* | **Strata Simulation Workbench** | Mining personnel expect test beds to refer to strata mechanics, not PRNG algorithm names. |
| *Multi-Transducer Fusion Engine* | **Sensor Correlation & Analysis** | Plain technical English understood by DGMS safety officers. |
| *Statistical Anomaly Detection Timeline* | **Geotechnical Event Log** | Matches CMR 2017 Regulation 112 mandatory logbook terminology. |
| *Immutable Regulatory Audit Trail* | **Statutory Shift Log & Audit Trail** | Standard mining regulatory nomenclature. |
| *AI Risk Score: 0.78 / 1.00* | **Deformation Severity Index: 0.78** | Emphasizes physical geotechnical reality over abstract "AI score". |
| *Active Incidents Requiring Action* | **Unacknowledged Alerts** | Standard industrial alarm management (ANSI/ISA-18.2). |
| *Fleet Link Budget* | **Telemetry Gateway Quality** | Clear engineering communication. |
| *Sound Ready / Test Beep* | **Siren Audio Check** | Serious operational procedure rather than toy sound test. |
| *Form IV AI Generation* | **DGMS Form IV Statutory Export** | Reflects legal compliance rather than automated synthesis. |
