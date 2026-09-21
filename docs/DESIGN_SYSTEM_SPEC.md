# SIH26025 — Industrial Design System Specification
**Document Version:** 1.0.0  
**Design Philosophy:** Industrial Geotechnical Credibility, Visual Restraint, Extreme Ergonomic Readability  
**Standard Compliance:** DGMS CMR 2017 Reg 112 Safety-Critical Monitoring Standard  

---

## 1. Design Principles

1. **Information Density with Breathing Room:** Dense operational data must be structured through tabular grids, clean dividers, and deliberate whitespace rather than packed into bordered cards.
2. **Typography as Structure:** Use scale, weight, and tracking to establish clear visual hierarchy. No text element shall be smaller than 11px anywhere in the application.
3. **Restrained Semantic Color:** Color is reserved strictly for operational status and safety risk signaling. Backgrounds, cards, borders, and controls must remain quiet, neutral, and glare-free.
4. **Zero Visual Gimmicks:** Completely eliminate gradients, neon halos, cyberpunk HUDs, glowing borders, card shadows, and decorative pill wrappers.

---

## 2. Color Palette & Semantic System

The color palette is calibrated for high-glare mining control rooms and outdoor laptop viewing:

### 2.1 Neutral Surfaces & Structural Palette

| Token Name | Hex Code | Tailwind Equivalent / CSS Variable | Usage & Application |
| :--- | :---: | :--- | :--- |
| **Canvas Background** | `#F4F6F5` | `bg-neutral-canvas` / `--bg-canvas` | Main viewport background behind all content surfaces. |
| **Surface (Base)** | `#FFFFFF` | `bg-surface` / `--bg-surface` | Primary content panels, tables, split panes, and sheets. |
| **Subtle Surface** | `#EDF1F0` | `bg-surface-subtle` / `--bg-surface-subtle` | Table header rows, zebra striping, sidebar active items, code blocks. |
| **Primary Text** | `#1D2933` | `text-primary` / `--text-primary` | High-contrast body text, headings, data values, table cell text. |
| **Secondary Text** | `#52606D` | `text-secondary` / `--text-secondary` | Descriptive labels, metadata, secondary instructions, subtitles. |
| **Muted Text** | `#74808A` | `text-muted` / `--text-muted` | Inactive controls, placeholder text, units (e.g., `mm/day`, `Hz`). |
| **Structural Border** | `#D7DEDC` | `border-subtle` / `--border-subtle` | 1px horizontal dividers, table borders, panel separators. |

### 2.2 Industrial Brand & Accent Palette

| Token Name | Hex Code | Tailwind Equivalent / CSS Variable | Usage & Application |
| :--- | :---: | :--- | :--- |
| **Industrial Navy** | `#173B57` | `bg-navy` / `text-navy` | Primary interactive buttons, navigation branding, header accents. |
| **Dark Navy** | `#102C42` | `bg-navy-dark` / `text-navy-dark` | Active states, high-priority button focus, sidebar top bar. |
| **Information Blue**| `#35677D` | `text-info` / `bg-info-subtle` | Neutral technical callouts, firmware versions, network telemetry. |

### 2.3 Statutory Safety Risk States (Strict 5-State Architecture)

Semantic colors are strictly reserved for the 5 official risk states defined in DGMS CMR 2017:

| Risk Level | State Name | Hex Code | Background Tint (10%) | Operational Meaning |
| :---: | :--- | :---: | :---: | :--- |
| **L0** | **Normal** | `#2F6B4F` | `#EAF2ED` | Strata nominal, within rolling baseline. |
| **L1** | **Advisory** | `#9A6A00` | `#FBF6E9` | Single transducer drift or transient vibration. |
| **L2** | **Watch** | `#A85A00` | `#FCF2E9` | Multi-window persistence detected; supervisor notified. |
| **L3** | **Warning** | `#B42318` | `#FDF0ED` | Multi-node spatial concordance; inspection team ordered. |
| **L4** | **Critical** | `#91180E` | `#FBEBE9` | Rate-of-change failure threshold exceeded; mandatory evacuation. |

---

## 3. Typography & Hierarchy Scale

### 3.1 Typeface Families
- **Primary Typeface:** `IBM Plex Sans`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Applied to all headings, body text, navigation, table cells, form labels, and buttons.
- **Technical / Monospace Typeface:** `IBM Plex Mono`, `ui-monospace, "SF Mono", Menlo, Consolas, monospace`
  - Strictly reserved for coordinate grids (`86°23'40"E`), sensor channel codes (`SN-102-DISP_Z`), cryptographic SHA-256 hashes, timestamps (`17:15:00.245`), and raw numeric measurements.

### 3.2 Typographic Hierarchy Scale

| Level | Size Range | Weight | Line Height | Tracking | Usage & Application |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Page Title** | 28–32px | SemiBold (600) | 1.2 | -0.02em | Main screen H1 (e.g., *Colliery Operations Command Surface*). |
| **Section Heading** | 18–22px | SemiBold (600) | 1.3 | -0.01em | Primary division H2 (e.g., *Underground Spatial Surveillance*). |
| **Subsection / Group** | 15–17px | Medium (500) | 1.4 | normal | Panel headers, table titles, modal headings H3. |
| **Primary Body Text** | 14–16px | Regular (400) | 1.5 | normal | Explanatory narratives, shift notes, audit payloads, evidence descriptions. |
| **Table & List Text** | 13–14px | Regular (400) | 1.4 | normal | Table row content, station lists, event log entries. |
| **Navigation Items** | 13–14px | Medium (500) | 1.0 | normal | Sidebar links, tab buttons, breadcrumb trails. |
| **Technical Values** | 14–18px | Medium / Bold | 1.0 | 0.02em | Live readings (`18.5 mm`, `1.24 mm/m`, `92.3%`). Mono font. |
| **Micro Labels (Cap)**| 11–12px | Medium (500) | 1.0 | 0.05em | **Strict maximum minimum.** Uppercase column headers (`TIMESTAMP`, `NODE ID`, `STATUS`). |

> **STRICT COMPLIANCE RULE:** No font size below 11px is permitted in any component under any circumstances. All previous instances of 8px, 8.5px, 9px, and 10px are banned.

---

## 4. Spacing, Elevation & Layout Grid

### 4.1 Spacing Scale
- `space-1`: 4px (micro-gap between icon and adjacent label)
- `space-2`: 8px (tight gap between form label and input)
- `space-3`: 12px (standard gap between list items, table cell padding)
- `space-4`: 16px (standard content padding inside panels)
- `space-5`: 20px (generous panel padding, split pane dividers)
- `space-6`: 24px (gap between major sections)
- `space-8`: 32px (page margin padding, top header separation)
- `space-12`: 48px (major functional division)

### 4.2 Elevation & Borders
- **Borders:** Single `1px solid #D7DEDC` used exclusively for functional division.
- **Shadows:** Flat design standard. Only floating elements (modals, context menus, dropdowns) utilize a subtle utility shadow: `0 4px 12px rgba(29, 41, 51, 0.08)`. Standard panels have zero drop shadows.
- **Border Radius:** Restrained industrial radius: `rounded-md` (4px to 6px). No pill shapes (`rounded-full`) except for circular status indicator dots (6px $\times$ 6px).

---

## 5. Form Controls & Interactive Primitives

1. **Buttons:**
   - **Primary Action:** Solid Industrial Navy (`#173B57`), white text, 36px height, font-size 14px medium, 12px horizontal padding.
   - **Secondary Action:** White surface, border `#D7DEDC`, text `#1D2933`, hover `#EDF1F0`.
   - **Danger / Evacuation Action:** Solid `#B42318`, white text.
2. **Form Inputs:**
   - Background: `#FFFFFF`, border: `1px solid #D7DEDC`, text: `14px #1D2933`, focus ring: `2px solid #173B57`. Minimum touch/click target height: 36px.
3. **Data Tables:**
   - Header Row: Background `#EDF1F0`, text 12px uppercase tracking-wider `#52606D`, border-bottom `2px solid #D7DEDC`.
   - Body Row: Background `#FFFFFF`, hover `#F4F6F5`, border-bottom `1px solid #D7DEDC`, height 40px, cell text 13–14px.
