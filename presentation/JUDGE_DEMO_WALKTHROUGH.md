# SIH26025 — 5-Minute Judge Demonstration Script

This repeatable workflow guides evaluators through an end-to-end ground control crisis simulation and statutory response cycle.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Healthy     │────►│ Trigger Roof │────►│ Observe Real-│────►│ AI Anomaly   │
│  Mine State  │     │ Caving Event │     │ time Cadence │     │ Detection    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│ Audit Trail  │◄────│ DGMS Reg 112 │◄────│ Operational  │◄───────────┘
│ Sign-Off     │     │ Action Signed│     │ GIS & Alert  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Step 1: Establish Healthy Baseline (0:00 – 1:00)

1. Navigate to the **Operational Dashboard** (`/`).
2. Show the active colliery status:
   * Colliery Risk State: **Normal (Level 1)** (Green badge).
   * Active extraction panel: **P-101 (Moonidih XVI Seam)**.
   * Telemetry nodes: 16 stations healthy across 4 panels.
   * Statutory Banner: Discloses DEMO / SIMULATION mode transparently.
3. Open **GIS Surveillance** (`/gis`):
   * Highlight the geological strata layers: barakar sandstone main roof, fault lines, active panel goaf boundaries, surface railway, and colliery ventilation shafts.

---

## Step 2: Trigger Geomechanical Anomaly in Simulator (1:00 – 2:00)

1. Open the **Mine Event Simulator** (`/simulator`).
2. Point out the deterministic configuration:
   * PRNG Seed: `102` (ensures 100% reproducible event sequence).
   * Target Working District: **Panel P-101**.
   * Affected Node: **SN-102**.
3. Select Scenario: **"Correlated Multi-Node Caving / Deformation"**.
4. Click **Start Simulation**.
5. Observe live telemetry streaming into the dashboard at 1.0x speed.

---

## Step 3: Observe Telemetry Acceleration & AI Detection (2:00 – 3:00)

1. Open **Live Transducer Streams** (`/telemetry`):
   * Watch **Borehole Sag (DISP_Z)** accelerate beyond $0.50\text{ mm/hr}$.
   * Watch **Tiltmeter (TILT_X)** rise from nominal $12.4^\circ$ to $16.5^\circ$.
   * Watch **Rockbolt Strain** surge towards $780\ \mu\epsilon$.
2. Open **Statistical Intelligence & AI Engine** (`/analytics`):
   * Explain the evidence:
     * **Rolling Z-Score:** Crosses $z = +2.85$ (nominal $< 2.5$).
     * **Pearson Inter-Station Correlation:** Adjacent station **SN-101** corroborates with $r = +0.86$.
     * **Multi-Modal Agreement Score:** $0.88$ (tilt and displacement agree).
     * **Persistence Window:** 18+ seconds sustained deviation.
   * Colliery risk state automatically escalates: **Normal ➔ Advisory ➔ Watch ➔ Warning ➔ Critical**.

---

## Step 4: Early Warning Dispatch & DGMS Sign-Off (3:00 – 4:15)

1. Open **Early Warning & Incident Center** (`/alerts`):
   * Audio siren sounds (if unmuted) indicating **CRITICAL** ground convergence directive.
   * Notice automated dispatch to multi-channel recipients (Shift In-Charge, Surface Dispatcher via LoRa/SMS).
2. Click **Sign Off** on the active Critical alert:
   * The **DGMS CMR 2017 Regulation 112 Statutory Acknowledgment Modal** opens.
   * Select Shift: **Morning Shift (06:00 - 14:00)**.
   * Select Directive: **"Immediate Withdrawal of Face Workforce to Fresh Air Base"**.
   * Enter Signatory: `Rajesh Kumar (Colliery Safety Officer)`.
   * Click **Commit Statutory Sign-Off**.
   * Notice audio siren immediately silences, alert status updates to **Signed Off**.

---

## Step 5: Verify Immutable Audit Trail (4:15 – 5:00)

1. Open **Statutory Compliance & Audit Trail** (`/audit`):
   * Inspect the newly committed audit record.
   * Point out the exact timestamp, signatory role, action taken, and associated alert ID.
   * Explain that this satisfies the DGMS requirement for non-repudiable shift handover records.
2. Return to `/simulator` and click **Reset Engine** to restore the mine to its healthy nominal baseline.
