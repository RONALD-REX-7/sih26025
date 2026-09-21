# SIH26025 — Forensic Product-Design Audit
**Document Version:** 1.0.0  
**Audit Date:** 2026-09-21  
**Target Platform:** SIH26025 — Real-Time Underground Mine Subsidence Monitoring & Early Warning Platform (DGMS CMR 2017 Reg 112 Compliance)  
**Evaluation Scope:** Live Production Deployment (https://sih26025.vercel.app) & Local Verification Engine via Chrome DevTools MCP  

---

## 1. Executive Summary & Forensic Verdict

A forensic design and interface audit was executed across all 12 primary operational routes of the SIH26025 platform. The system backend, data contracts, AI risk engine, Mulberry32 deterministic simulator, and regulatory compliance layers are robust and verified. However, the frontend presentation suffers from severe product-design compromises characteristic of iterative AI generation:

1. **Severe Text Micro-Compression:** Over **1,360 text nodes** across 12 screens are rendered at $\le 11\text{px}$ (with extensive use of 8px, 8.5px, 9px, and 10px). Critical engineering units, time stamps, and regulatory directives are compressed into unreadable fine print.
2. **Pathological Container Proliferation ("Card-Everything Syndrome"):** The 12 routes contain over **880 discrete card/bordered containers**. `/sensors` alone renders **208 container cards**, wrapping every individual transducer channel in an isolated bordered box.
3. **Badge & Pill Inflation ("Badge Soup"):** Non-critical operational metadata (node IDs, protocol types, sampling frequencies, battery states) are rendered in rounded badge pills, creating chaotic visual noise and destroying semantic risk signaling.
4. **Weak Information Hierarchy & Cognitive Overload:** Pages lack a dominant focal point. Secondary telemetry metrics compete with primary safety directives at identical visual weights and font sizes.
5. **Cookie-Cutter Dashboard Mimicry:** Multiple internal pages (`/mine`, `/infrastructure`, `/sensors`, `/reports`) mechanically replicate the top 4-metric-card header pattern from `/dashboard`, regardless of operational context.
6. **Harsh Monochrome Contrast:** The current surface palette relies on pure white (`#FFFFFF`) cards against harsh dark borders (`#000000` / `#1F2937`) without nuanced industrial mid-tones.

---

## 2. Quantitative Route-by-Route Forensic Metrics

The table below summarizes computed typography and DOM container metrics captured via live Chrome DevTools script evaluation on the production environment:

| Route Path | Micro-Text ($\le 11\text{px}$) | Card / Border Containers | Badges & Pills | Primary Font Sizes Observed | Severe Ergonomic Defects |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/dashboard` | **125** | **89** | **14** | 8px, 8.5px, 9px, 10px, 11px, 12px, 16px | Over-containerized layout; GIS canvas boxed in small card; tiny map coordinates; 4 KPI boxes compete with active incident banner. |
| `/mine` | **62** | **45** | **5** | 9px, 10px, 11px, 12px, 14px, 16px | Repetitive metric cards; panel specifications fragmented into mini containers instead of structured comparison table. |
| `/gis` | **110** | **70** | **8** | 8px, 8.5px, 9px, 10px, 11px, 12px, 16px | Map zoom and coordinate labels rendered at 8px and 8.5px; inspector sidebar is a stack of 12 nested cards. |
| `/sensors` | **603** | **208** | **1** | 9px, 10px, 11px, 12px, 14px, 16px | **Worst offender.** 208 individual cards; 406 text nodes at 11px and 191 at 10px; sensor matrix unreadable on standard laptop displays. |
| `/events` | **37** | **54** | **10** | 9px, 10px, 11px, 12px, 16px | Chronological log rendered as disconnected cards rather than a clean, high-density operational timeline or data table. |
| `/analytics` | **60** | **64** | **4** | 9px, 10px, 11px, 12px, 14px, 16px, 18px | Pearson spatial matrix and EWMA parameters boxed in isolated widgets; lack of continuous analytical reading flow. |
| `/alerts` | **65** | **74** | **10** | 9px, 10px, 10.5px, 11px, 12px, 14px, 16px | Incident queue has nested cards and repetitive badges; siren controls and test buttons dominate statutory sign-off queue. |
| `/infrastructure` | **57** | **40** | **4** | 9px, 10px, 11px, 12px, 14px, 16px | Railway siding, borehole stations, and shafts forced into generic KPI card structures instead of an asset hierarchy. |
| `/audit` | **63** | **53** | **7** | 9px, 10px, 11px, 12px, 14px, 16px | Cryptographic hash and payload JSON forced into cramped horizontal table cells with micro-copy; truncation issues. |
| `/reports` | **47** | **43** | **4** | 9px, 10px, 11px, 12px, 14px, 16px | Statutory Form IV outputs presented as cards rather than official printable document sheets or ledger lists. |
| `/settings` | **37** | **52** | **4** | 9px, 10px, 11px, 12px, 14px, 16px | Standard form inputs wrapped in heavy bordered cards with excessive padding and micro label text. |
| `/simulator` | **95** | **87** | **3** | 9px, 10px, 11px, 12px, 14px, 16px | 9 scenarios displayed as small dense cards; parameter inputs cramped; seed controller disconnected from timeline. |
| **Total System** | **1,361** | **880** | **74** | **Dominant: 10px & 11px** | **Systemic visual fragmentation and unreadable typography.** |

---

## 3. Systematic Anti-Pattern Catalog

### Anti-Pattern 1: Micro-Typography & Readability Collapse
- **Observation:** Body text, table rows, and telemetry labels routinely drop to 8px, 8.5px, 9px, 10px, and 11px (e.g., `text-[9px]`, `text-[10px]`, `text-xs`).
- **Impact:** Legibility fails completely at 100% zoom on standard 1080p and 1440p displays. Mining control room operators cannot scan critical values (e.g., deformation rates, battery voltages, LoRa link quality) without eye strain.
- **Root Cause:** Squeezing large quantities of metadata into fixed small card containers forced font sizes downward rather than using structured layout tables or progressive disclosure.

### Anti-Pattern 2: Pathological Containerization ("Card-Everything")
- **Observation:** Nearly every data element is encapsulated in a `<Card>` or `border rounded-md` div. On `/sensors`, 16 stations $\times$ 5 channels = 80 mini cards, plus 20 summary cards, totaling 208 bordered boxes on one page.
- **Impact:** The screen becomes a "prison of boxes". Horizontal and vertical border lines dominate the visual field, creating eye fatigue and distracting from actual data values.
- **Root Cause:** Absence of a component grammar defining when to use tables, lists, split panes, and sections versus standalone cards.

### Anti-Pattern 3: Decorative Semantic Colors & Badge Inflation
- **Observation:** Badges and colored pill wrappers are applied to non-urgent states (e.g., `ESP32 LoRa` in blue, `1025` seed in gray pill, `Bord & Pillar` in purple pill, `Active` in green pill).
- **Impact:** Dilutes true statutory safety signals. When genuine **Critical** or **Warning** subsidence occurs, its visual urgency is drowned out in a sea of multi-colored badges.
- **Root Cause:** Misuse of shadcn/ui `<Badge>` components as decorative text holders rather than reserved safety-state indicators.

### Anti-Pattern 4: Metric Equality & Lack of Focal Hierarchy
- **Observation:** The main dashboard places 4 metric cards (`PPV Rate`, `Link Budget`, `Active Anomalies`, `Incident Queue`) in a single row above the GIS map, all with identical visual weight.
- **Impact:** The operator cannot discern whether the mine is safe or in imminent danger within the first 3 seconds of viewing. The central operational question (*"What is the condition of Panel P-101 right now?"*) is not given visual supremacy.
- **Root Cause:** Adopting generic SaaS dashboard templates where 4 KPI cards are reflexively placed at the top of every view.

### Anti-Pattern 5: Artificial / AI Microcopy
- **Observation:** Labels like *"Mulberry32 Deterministic Telemetry Test Bench"*, *"Multi-Transducer Fusion Engine"*, and *"Statistical Anomaly Detection Timeline"* read like academic thesis chapter headings rather than industrial software.
- **Impact:** Decreases technical credibility among mining engineers and DGMS inspectors who expect standard geotechnical and mining terminology (e.g., *Strata Simulator*, *Station Telemetry*, *Event Log*).

---

## 4. Route-by-Route Deep Forensic Findings

### 4.1 `/dashboard` (Command Surface)
- **Primary Failure:** The GIS underground layout is squeezed into a 450px card on the left while a secondary telemetry card takes up the right, leaving the Explainable Evidence Dossier buried at the bottom.
- **Cognitive Flaw:** An operator must scroll through multiple card layers to answer *"Why did the alert trigger?"*.
- **Visual Defect:** Coordinates on the canvas (`86°23'40"E`) render at 8px monospace.

### 4.2 `/gis` (Underground Spatial Surveillance)
- **Primary Failure:** The map canvas is surrounded by disjointed toolbars. Station markers and event epicenters have inconsistent hitboxes.
- **Cognitive Flaw:** The station investigation drawer overlaps critical map areas instead of functioning as a clean split pane.
- **Visual Defect:** 70 card containers encircle the map.

### 4.3 `/sensors` (Station & Transducer Analytics)
- **Primary Failure:** 208 container cards create an unnavigable labyrinth. Transducers cannot be compared across stations horizontally.
- **Cognitive Flaw:** Identifying which station is failing requires scrolling past dozens of identical cards.
- **Visual Defect:** 603 text elements at 10–11px. Zero tabular alignment.

### 4.4 `/events` (Geotechnical Incident Log)
- **Primary Failure:** Chronological events are rendered as separate cards floating in whitespace rather than a unified operational ledger.
- **Cognitive Flaw:** Lack of vertical continuity makes it impossible to trace the evolution of an event from initiation to peak acceleration.

### 4.5 `/analytics` (Statistical & Anomaly Intelligence)
- **Primary Failure:** Pearson correlation matrix, EWMA smoothing parameters, and Z-score charts are trapped in isolated containers.
- **Cognitive Flaw:** Scientific correlation is fragmented; operator cannot see how tilt acceleration directly correlates with acoustic emission in real time.

### 4.6 `/alerts` (Early Warning & Incident Center)
- **Primary Failure:** Test sound buttons (`Sound Ready`, `Test Beep`) are placed adjacent to regulatory sign-off actions, compromising operational seriousness.
- **Cognitive Flaw:** Incident queue does not cleanly separate active unacknowledged incidents from historical signed-off records.

### 4.7 `/audit` (Statutory Governance Ledger)
- **Primary Failure:** Cryptographic SHA-256 hashes and before/after delta JSON are crammed into tiny table cells with horizontal ellipsis truncation.
- **Cognitive Flaw:** An inspector cannot read the audit payload without opening browser dev tools.

### 4.8 `/simulator` (Strata Test Bench)
- **Primary Failure:** The 9 pre-calibrated failure scenarios are laid out as a 3x3 grid of dense cards with tiny text, making scenario selection visually overwhelming.
- **Cognitive Flaw:** Simulation speed (1x, 2x, 5x, 10x) and seed controls are decoupled from the real-time playback bar.

---

## 5. Conclusion & Mandatory Directive

The current frontend must be completely restructured. Superficial CSS patches cannot resolve the structural flaw of 880 cards and 1,360 micro-text nodes. Phase 13 mandates a definitive, implementation-ready architectural specification for a professional industrial reconstruction.
