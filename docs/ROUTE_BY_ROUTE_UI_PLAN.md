# SIH26025 — Route-by-Route UI Reconstruction Plan
**Document Version:** 1.0.0  
**Target:** Granular Architectural Blueprint for All 12 Operational Routes  
**Execution Standard:** Ready for direct implementation without design ambiguity.  

---

## Route 1: `/dashboard` (Command Surface)

### 1. Purpose
The primary situational awareness hub for the Colliery Mine Manager and Safety Officer. Answers within 3 seconds: Is the mine safe? Where is subsidence accelerating? What immediate statutory action is required?

### 2. Primary User Task
Monitor real-time strata condition across panels, inspect active early warnings, verify explainable risk evidence, and execute statutory incident sign-offs.

### 3. Information Hierarchy
1. **Level 1 (Dominant):** Colliery Operational Status & Active Alert Banner (Immediate condition & pending evacuation orders).
2. **Level 2 (Core Spatial Surface):** Underground GIS Surveillance Canvas (65% width) paired with Live Evidence Dossier (35% width).
3. **Level 3 (Supporting Tabular Detail):** Station Fleet Telemetry & Transducer Status Table (Full width, sortable by deformation rate).

### 4. Layout Structure
- **Top:** Calm Operational Status Bar (48px height) displaying Mine Risk State (`NORMAL [L0]`), Active Alert count (`1 ADVISORY`), Telemetry Health (`16/16 Online`), and Colliery ID (`Bhowra-West Colliery`).
- **Middle (Split Grid 65/35):** 
  - Left (65%): Central GIS Map Canvas (520px height) showing panels, 45m railway buffer, and live station rings.
  - Right (35%): Evidence Dossier Panel with live hazard explanation, contributing transducers, and direct `Sign Off (CMR 112)` button.
- **Bottom:** Full-width Station Telemetry Data Table showing all 16 stations, recent rates-of-change, and battery states.

### 5. Components & Elements
- Status Header Bar (inline metrics separated by vertical rules).
- Active Alert Banner (conditional card, only renders if Risk $\ge$ Advisory).
- GIS Interactive Canvas (SVG/Map with pan/zoom toolbar).
- Evidence Dossier Panel (clean section with progress bars and parameter metrics).
- Regulatory Sign-Off Modal (accessible via button in dossier or banner).
- Tabular Station Fleet Grid (standard striped data table).

### 6. Density & Spacing
- Page padding: 24px horizontal, 20px vertical.
- Split pane gap: 20px.
- Typography: Page title 28px, Section headings 18px, Table cells 13px, Mono technical values 15px.
- Card count: Exactly 2 (Active Incident Banner if active, and Evidence Dossier). Zero cards in station list.

### 7. Interaction & State Transitions
- Clicking any node on GIS map instantly focuses that station in the Evidence Dossier and highlights its row in the bottom table.
- Clicking `Sign Off (CMR 112)` opens the modal dialog with operator name pre-filled from active persona.
- Live telemetry ticks update values in-place without page jitter.

### 8. Responsive Behavior
- **Desktop (1440px+):** 65/35 horizontal split; full-width bottom table.
- **Laptop (1024px–1366px):** 60/40 horizontal split; 450px map height.
- **Tablet (768px–1023px):** Stacked vertical layout: Map Canvas (400px height) full width, followed by Evidence Dossier, followed by horizontally scrollable Station Table.

---

## Route 2: `/mine` (Mine & Panels)

### 1. Purpose
Defines the geotechnical and structural geometry of Bhowra-West Colliery: seam depth, coal extraction methods, hydraulic stowing parameters, and panel boundary perimeters.

### 2. Primary User Task
Review panel operational status, depillaring flexure limits, extraction schedules, and strata characteristics.

### 3. Information Hierarchy
1. **Level 1:** Colliery Stratigraphic Profile (Seam VII/VIII, 185m–265m depth, sandstone/shale overburden ratio).
2. **Level 2:** Active Panels Comparative Data Table (Panels P-101 to P-104 with extraction method, status, sensor density).
3. **Level 3:** Geotechnical Rock Mass Rating (RMR) & Structural Discontinuity Matrix.

### 4. Layout Structure
- **Header:** Title (28px), Colliery Summary Narrative (14px).
- **Upper Section:** Two-column split pane:
  - Left (50%): Stratigraphic Column & Overburden Cross-Section (SVG geomechanical visualizer).
  - Right (50%): Mining Method & Hydraulic Stowing Specification Panel.
- **Lower Section:** Panel Comparison Table replacing previous 4 metric cards and 4 panel cards.

### 5. Components & Elements
- Geomechanical Stratigraphic Canvas (SVG layer rendering sandstone, shale, coal seam).
- Panel Comparison Data Table (Columns: Panel Code, Seam Depth, Extraction Method, Monitoring Nodes, Cumulative Subsidence, Status).
- Zero standalone metric cards.

### 6. Density & Spacing
- Section gap: 24px. Table row height: 44px. Font size: 14px body, 13px table.

### 7. Interaction & State Transitions
- Selecting a panel in the table highlights its perimeter on the cross-section diagram.

### 8. Responsive Behavior
- Desktop: 50/50 split upper section.
- Tablet: Single-column vertical flow with full-width table.

---

## Route 3: `/gis` (Underground Spatial Surveillance)

### 1. Purpose
Full-screen dedicated GIS exploration workspace for mapping subsidence troughs, InSAR ground-deformation velocity vectors, and surface infrastructure proximities.

### 2. Primary User Task
Investigate spatial correlation of ground deformation, analyze proximity to Indian Railways 45m safety perimeter, and inspect station clusters.

### 3. Information Hierarchy
1. **Level 1:** Primary Map Canvas (Dominant 70% viewport).
2. **Level 2:** Map Layer Controls & Filter Bar (Integrated horizontal header, not floating pills).
3. **Level 3:** Persistent Station Investigator Inspector (30% right sidebar).

### 4. Layout Structure
- **Top:** Map Toolbar (40px height) with layer toggles (`Panels`, `Stations`, `Railway 45m Buffer`, `Deformation Contours`, `InSAR Overlay`).
- **Main Area (Split View):**
  - Left (70%): High-resolution GIS Canvas with pan, zoom, scale bar (1:5000), coordinate graticule.
  - Right (30%): Station Detail Inspector Panel showing 5-channel real-time readouts, tilt vector diagram, and local risk classification.

### 5. Components & Elements
- Interactive SVG/Canvas GIS Engine.
- Coordinate Grid Overlay (12px Mono text).
- Station Inspector Sheet (Tabular transducer readouts, 13px text).
- Coordinate status bar at bottom showing cursor latitude/longitude.

### 6. Density & Spacing
- Zero margin around map; maximizes workspace. Inspector padding: 16px.

### 7. Interaction & State Transitions
- Hovering over a station displays clean tooltip with Station ID and current rate.
- Clicking a station pins the inspector pane to that station.
- Layer toggles instantly update visual layers without canvas re-rendering.

### 8. Responsive Behavior
- Desktop/Laptop: Two-column split view (70/30).
- Tablet: Map canvas 100% width; Inspector collapses into a bottom sliding drawer toggled by station tap.

---

## Route 4: `/sensors` (Station & Transducer Analytics)

### 1. Purpose
Comprehensive fleet telemetry matrix and transducer health surveillance across all 80 monitoring channels.

### 2. Primary User Task
Identify sensor drift, compare transducer readings across stations, inspect battery voltages, and verify LoRa packet delivery.

### 3. Information Hierarchy
1. **Level 1:** Fleet Summary Bar (16 Stations, 80 Channels, Link Quality, Battery Average).
2. **Level 2:** Multi-Station Transducer Comparison Table (Replaces all 208 former cards with a single high-efficiency table).
3. **Level 3:** Single-Station Historical Time-Series Sparkline Drill-Down.

### 4. Layout Structure
- **Top:** Fleet Health Strip (40px) with clean inline statistics.
- **Filter Bar:** Filter by Panel (`All`, `P-101`, `P-102`, `P-103`, `P-104`), Channel (`Disp`, `Tilt`, `Vib`, `Strain`), Health (`Normal`, `Drift`, `Low Battery`).
- **Main View:** High-Density Telemetry Matrix Table:
  - Columns: Station ID | Panel | Disp-Z (mm) | Tilt-X (mm/m) | Tilt-Y (mm/m) | Vib RMS (mm/s) | Strain ($\mu\epsilon$) | RSSI | Battery | Status | Actions.

### 5. Components & Elements
- High-Density Data Table (striped rows, 13px Mono values, subtle colored dots for out-of-spec readings).
- Quick Filter Segmented Control.
- Channel Trend Modal (sparkline graph on demand).

### 6. Density & Spacing
- Row height: 38px. Table font: 13px. Card count: 0 (completely eliminated all 208 cards).

### 7. Interaction & State Transitions
- Clicking any row expands inline micro-trend chart for that station's channels.
- Sortable column headers (e.g., sort by highest deformation rate).

### 8. Responsive Behavior
- Desktop: Full 11-column table visible.
- Tablet: Sticky left Station ID column with horizontal table scroll.

---

## Route 5: `/events` (Geotechnical Event Log)

### 1. Purpose
Statutory chronological log of all detected strata anomalies, risk state transitions, and operator interventions required under DGMS CMR 2017 Reg 112.

### 2. Primary User Task
Trace event timelines, audit event duration and escalation steps, and filter historical events by severity.

### 3. Information Hierarchy
1. **Level 1:** Chronological Event Timeline & Ledger.
2. **Level 2:** Severity Filter Tabs (`All (3)`, `Critical (0)`, `Warning (0)`, `Watch (1)`, `Advisory (2)`, `Normal`).
3. **Level 3:** Event Evidence Detail View (Affected nodes, peak values, triggered directives).

### 4. Layout Structure
- **Top:** Header with Title, Regulatory Note, and Severity Filter Strip.
- **Main Area:** Structured Continuous Event Timeline:
  - Vertical 2px axis with timestamps (`17:15:00 IST`).
  - Event entries displayed as clean horizontal rows (Timestamp, Panel, Severity, Triggering Cause, Affected Stations, Action Taken).

### 5. Components & Elements
- Unified Timeline / Ledger component (not separate floating cards).
- Severity Filter Buttons (subtle industrial styling).
- Detail Accordion / Slide-out for full forensic event trace.

### 6. Density & Spacing
- Event item padding: 12px vertical. Spacing between timeline nodes: 16px.

### 7. Interaction & State Transitions
- Clicking an event opens its associated evidence dossier and affected GIS perimeter.

### 8. Responsive Behavior
- Stacks cleanly on mobile and tablet without horizontal overflow.

---

## Route 6: `/analytics` (AI Risk & Statistical Engine)

### 1. Purpose
Explainable geotechnical intelligence engine: multi-station Pearson spatial correlation, EWMA baseline smoothing, and rolling Z-score persistence analysis.

### 2. Primary User Task
Understand the mathematical and empirical evidence driving risk state transitions; verify lack of single-sensor false positives.

### 3. Information Hierarchy
1. **Level 1:** Composite Geotechnical Risk Summary & Explanation Narrative.
2. **Level 2:** Multi-Station Spatial Correlation Matrix (Pearson $r$ heatmap).
3. **Level 3:** Transducer Concordance & Rolling Z-Score Persistence Chart.

### 4. Layout Structure
- **Upper Section:** Operational Narrative Banner (*"Why the current risk state is NORMAL [L0]"*).
- **Middle Section (Two-Column Split 50/50):**
  - Left: Pearson Spatial Correlation Matrix Table (Station-to-station $r$-values).
  - Right: Multi-Modal Concordance Graph (Tilt vs Displacement vs Vibration).
- **Lower Section:** Anomaly Detection Model Diagnostics Table (Algorithm, Parameters, Sample Window, False-Positive Rejection Filter).

### 5. Components & Elements
- Spatial Correlation Matrix (Compact tabular heatmap with clean numeric text).
- Multi-Axis Telemetry Correlation Chart.
- Model Parameter Specification Table.

### 6. Density & Spacing
- 20px padding. Clear section titles. Card count: 2.

### 7. Interaction & State Transitions
- Hovering over any cell in the correlation matrix highlights the two corresponding stations on the GIS map.

### 8. Responsive Behavior
- Desktop: 50/50 split middle section. Tablet: Stacked single column.

---

## Route 7: `/alerts` (Alerts & Evacuation Center)

### 1. Purpose
Emergency response coordination center for dispatching safety directives, activating industrial sirens, and recording statutory CMR 2017 Reg 112 acknowledgements.

### 2. Primary User Task
Acknowledge active warnings, review evacuation perimeter recommendations, test siren readiness, and inspect multi-channel notification dispatch logs.

### 3. Information Hierarchy
1. **Level 1 (Highest Urgency):** Active Unacknowledged Incidents Queue.
2. **Level 2:** Statutory Regulatory Sign-Off Action Button & Directives.
3. **Level 3:** Acknowledged Incidents History & Dispatch Log.

### 4. Layout Structure
- **Top:** Emergency Command Header with Mine Status indicator and Siren Status.
- **Upper Section:** Active Incident Action Queue (High-contrast alert card with full statutory sign-off workflow).
- **Lower Section (Tabbed View):**
  - Tab 1: Historical Acknowledged Incidents Table.
  - Tab 2: Multi-Channel Dispatch Logs (SMS, Email, Radio, Siren activation logs).

### 5. Components & Elements
- Active Incident Banner (Red/Amber border, clear mitigation directive).
- Statutory Sign-Off Modal Dialog.
- Audio Siren Control (Restrained button with clear audio status indicator).
- Historical Incidents Data Table.

### 6. Density & Spacing
- High visual priority for unacknowledged incidents. 24px vertical separation.

### 7. Interaction & State Transitions
- Clicking `Acknowledge Incident` opens modal with mandatory shift note certification.
- Submitting sign-off immediately transitions incident from Active to Acknowledged and commits audit log entry.

### 8. Responsive Behavior
- Form inputs and action buttons maintain minimum 40px touch targets on tablet.

---

## Route 8: `/infrastructure` (Surface Infrastructure)

### 1. Purpose
Surveillance of critical surface structures within the mining leasehold: Indian Railways siding, high-tension powerlines, surface water bodies, and mine shafts.

### 2. Primary User Task
Monitor ground subsidence rates directly beneath or adjacent to railway tracks and surface buildings.

### 3. Information Hierarchy
1. **Level 1:** Critical Asset Protection Summary (Railway track proximity, maximum permitted subsidence threshold).
2. **Level 2:** Infrastructure Asset Inventory Table (Coordinates, structural category, nearest station, distance, current subsidence).
3. **Level 3:** Cross-Section Elevation & Subsidence Profile.

### 4. Layout Structure
- **Header:** Asset Overview and Statutory Proximity Regulations (DGMS circular regarding 45m railway reserve).
- **Main View:** Asset Inventory Table with direct status indicators (`● Nominal`, `▲ Advisory Buffer`).
- **Inspection Panel:** Detail view of selected asset with historic displacement curve.

### 5. Components & Elements
- Infrastructure Asset Table.
- Proximity Distance Indicator.
- Cross-Section Displacement Profile.

### 6. Density & Spacing
- Clean tabular layout. 0 cards.

### 7. Responsive Behavior
- Horizontal table scrolling with sticky asset name on tablet.

---

## Route 9: `/audit` (Statutory Shift Log & Audit Trail)

### 1. Purpose
Immutable, cryptographically auditable compliance ledger recording all safety directives, threshold modifications, sensor calibrations, and shift sign-offs.

### 2. Primary User Task
Verify statutory compliance under DGMS CMR 2017 Regulation 112; export verified CSV/PDF logs for mine safety inspectors.

### 3. Information Hierarchy
1. **Level 1:** Ledger Integrity Status & Cryptographic Hash Verification.
2. **Level 2:** Audit Event Records Data Table.
3. **Level 3:** Detailed Before/After Delta Payload Inspector.

### 4. Layout Structure
- **Top:** Header with Search Bar, Role Filter (`MineManager`, `SafetyOfficer`, `Engineer`, `Administrator`), and `Export DGMS CSV` button.
- **Main View:** Audit Ledger Data Table:
  - Columns: Timestamp (IST) | Signatory Role | Authorized Name | Action Code | Target Entity | Network IP | Signature Hash | Payload Delta.

### 5. Components & Elements
- Full-width Data Table (13px Mono timestamps and hashes).
- Expandable row drawer to view formatted before/after JSON without truncation.
- Export Button.

### 6. Density & Spacing
- Table rows: 42px height. Monospace font for technical hashes.

### 7. Interaction & State Transitions
- Clicking a row expands the full before/after payload delta inline.

### 8. Responsive Behavior
- Table supports horizontal scroll; key columns (Timestamp, Action, Role) remain pinned.

---

## Route 10: `/reports` (DGMS Form IV Reports)

### 1. Purpose
Generates official statutory subsidence reports formatted to DGMS Form IV specifications for submission to Directorate General of Mines Safety.

### 2. Primary User Task
Generate, preview, and print quarterly or emergency geotechnical compliance reports.

### 3. Information Hierarchy
1. **Level 1:** Official Statutory Report Document Preview (Formatted as an A4 printable document).
2. **Level 2:** Report Generation Parameters (Quarter, Panel, Signatory Officer).
3. **Level 3:** Archived Report Submissions Ledger.

### 4. Layout Structure
- **Split Layout (35% Parameters / 65% Document Preview):**
  - Left (35%): Report configuration panel, date range picker, and signature verification.
  - Right (65%): Form IV Document Sheet (`#FFFFFF` with `#D7DEDC` border, official DGMS header, tabular station readings, and signature block).

### 5. Components & Elements
- Printable Document Canvas.
- Statutory Form Controls.
- Print / PDF Export Button.

### 6. Density & Spacing
- Document preview matches standard print typography (12–14px serif/sans).

### 7. Responsive Behavior
- Tablet: Tabs to switch between Parameters and Document Preview.

---

## Route 11: `/settings` (Safety Threshold Settings)

### 1. Purpose
Administrative configuration of statutory safety thresholds: rate-of-change trigger limits, sampling frequencies, and LoRaWAN gateway parameters.

### 2. Primary User Task
Review and calibrate deformation rate thresholds per DGMS Technical Circular 4/2017.

### 3. Information Hierarchy
1. **Level 1:** Active Safety Threshold Matrix (Normal, Advisory, Watch, Warning, Critical trigger values).
2. **Level 2:** Network & Gateway Ingestion Parameters.
3. **Level 3:** Administrative Role-Based Permissions.

### 4. Layout Structure
- **Form Sections (Clean vertical flow with section dividers, not nested cards):**
  - Section 1: Geotechnical Displacement & Tilt Thresholds (Tabular input matrix).
  - Section 2: Vibration & Peak Particle Velocity Limits.
  - Section 3: Telemetry Polling & Watchdog Intervals.

### 5. Components & Elements
- Structured Input Table.
- Save Configuration Button with confirmation dialog.

### 6. Density & Spacing
- Standard form spacing: 16px vertical gap between fields.

### 7. Responsive Behavior
- Single-column vertical flow on all devices.

---

## Route 12: `/simulator` (Strata Simulation Workbench)

### 1. Purpose
Deterministic geotechnical test bench powered by the Mulberry32 PRNG engine for calibrating early warning algorithms and training colliery operators.

### 2. Primary User Task
Run repeatable failure scenarios, adjust clock speeds (1x to 10x), test multi-station correlation, and verify early warning dispatch.

### 3. Information Hierarchy
1. **Level 1:** Simulation Playback Controller (Start, Pause, Reset, Clock Speed, Progress Timeline).
2. **Level 2:** Geotechnical Failure Scenarios List (Vertical master list, replacing former 3x3 dense card grid).
3. **Level 3:** Real-Time Simulated Transducer Telemetry Graph & Seed Configuration.

### 4. Layout Structure
- **Top:** Sticky Simulation Control Header (Play/Pause button, 1x/2x/5x/10x speed selector, elapsed time, PRNG seed).
- **Middle Section (Two-Column Split 40/60):**
  - Left (40%): Scenarios List (Clean vertical list with scenario name, duration, description, and selection radio).
  - Right (60%): Active Scenario Progression Visualizer (Phases I to III progress bar, affected stations list, real-time synthetic waveform sparklines).

### 5. Components & Elements
- Consolidated Playback Controller Bar.
- Vertical Scenario Selector List (1px dividers, active row highlight).
- Multi-Channel Synthetic Waveform Canvas.

### 6. Density & Spacing
- Card count: 0 in scenario list (rendered as structured list). Control header: 52px height.

### 7. Interaction & State Transitions
- Selecting a scenario instantly resets timeline and primes PRNG seed.
- Adjusting speed slider or buttons takes effect immediately on active ticks.

### 8. Responsive Behavior
- Desktop: 40/60 horizontal split. Tablet: Stacked vertical layout.
