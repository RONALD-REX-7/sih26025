# SIH26025 — Risk Register

> Version: 1.0 (Phase 0)  
> Date: 2026-09-20  
> Review cycle: Each phase transition

---

## Severity Definitions

| Severity | Impact |
|---|---|
| **Critical** | Blocks demonstration or makes claims indefensible |
| **High** | Degrades major functionality or credibility |
| **Medium** | Requires workaround but does not block core demo |
| **Low** | Cosmetic or minor inconvenience |

---

## Active Risks

### R-001: Recharts + React 19 Blank Chart Issue

| Field | Value |
|---|---|
| Severity | **High** |
| Category | Dependency compatibility |
| Description | Recharts 3.10.x has reported blank-chart rendering issues with React 19 in certain configurations. |
| Likelihood | Medium — reports exist but not universal |
| Impact | Charts are core to the dashboard. Blank charts would severely degrade the demo. |
| Mitigation | 1. Use Recharts canary (3.11.x) which may contain fixes. 2. Test charts early in Phase 1. 3. If persistent, switch to Nivo or lightweight-charts. |
| Owner | Phase 1 implementation |
| Status | Open |

---

### R-002: Supabase Free Tier Limits

| Field | Value |
|---|---|
| Severity | **Medium** |
| Category | Infrastructure |
| Description | Free tier has limits on database size (500 MB), API requests (500K/month), realtime connections (200 concurrent), and pauses after 7 days of inactivity. |
| Likelihood | Medium — development may trigger inactivity pause |
| Impact | Paused project requires manual resume. Could disrupt demo preparation. |
| Mitigation | 1. Resume project before demos. 2. Monitor usage. 3. Upgrade to Pro if needed for sustained development/demo. |
| Owner | Project team |
| Status | Open |

---

### R-003: No Real Sensor Data Available

| Field | Value |
|---|---|
| Severity | **Medium** |
| Category | Data provenance |
| Description | No physical sensors, no real mine data, no field telemetry. All sensor data is simulated. |
| Likelihood | Certain |
| Impact | Cannot validate AI pipeline against real mine subsidence patterns. Cannot claim field-tested accuracy. |
| Mitigation | 1. Label ALL data as SIMULATED. 2. Document that synthetic data ≠ field validation. 3. Design simulator with geophysically plausible patterns (literature-referenced). 4. Clearly state limitations in UI and documentation. |
| Owner | AI pipeline, simulator |
| Status | Accepted — inherent to hackathon context |

---

### R-004: No Real Mine Geospatial Data

| Field | Value |
|---|---|
| Severity | **Low** |
| Category | GIS |
| Description | No actual mine boundary, panel layout, or underground infrastructure data available. |
| Likelihood | Certain |
| Impact | GIS must use a fictional mine layout. |
| Mitigation | 1. Create a plausible fictional demo mine. 2. Label as DEMO. 3. Design GIS to accept real data when available. |
| Owner | GIS implementation |
| Status | Accepted |

---

### R-005: Browser ML Performance

| Field | Value |
|---|---|
| Severity | **Medium** |
| Category | Performance |
| Description | Isolation Forest running in-browser may be slow on low-end devices with many concurrent sensor streams. |
| Likelihood | Low-Medium — depends on node count and update frequency |
| Impact | Dashboard lag or delayed anomaly detection. |
| Mitigation | 1. Run Isolation Forest in Web Worker. 2. Batch samples. 3. Offload to Server Action if browser perf insufficient. 4. Limit concurrent analysis scope. |
| Owner | AI pipeline implementation |
| Status | Open |

---

### R-006: MapLibre GL JS 6.x WebGL2 Requirement

| Field | Value |
|---|---|
| Severity | **Low** |
| Category | Browser compatibility |
| Description | MapLibre GL JS v6 dropped WebGL1. Requires WebGL2 support. |
| Likelihood | Low — all modern browsers support WebGL2 |
| Impact | GIS would not render on very old browsers/devices. |
| Mitigation | 1. Document WebGL2 requirement. 2. Show fallback error message. 3. SIH judges will use modern browsers. |
| Owner | GIS implementation |
| Status | Accepted |

---

### R-007: Corrupted node_modules (No Lock File)

| Field | Value |
|---|---|
| Severity | **High** |
| Category | Development environment |
| Description | Current `node_modules` was installed without generating a lock file. `npm ls` shows many extraneous packages and invalid dependency resolution. |
| Likelihood | Certain — already observed |
| Impact | Builds may fail. Inconsistent dependency versions across environments. |
| Mitigation | 1. Delete `node_modules`. 2. Run `npm install` to regenerate clean `package-lock.json`. 3. Commit lock file. |
| Owner | Phase 1 Step 1 |
| Status | Open — must be resolved immediately |

---

### R-008: No Git Repository

| Field | Value |
|---|---|
| Severity | **High** |
| Category | Version control |
| Description | No `.git` directory exists. No commit history. No remote. |
| Likelihood | Certain |
| Impact | No change tracking, no rollback capability, no GitHub integration. |
| Mitigation | 1. Initialize git repo. 2. Create initial commit. 3. Push to GitHub. 4. Connect Vercel. |
| Owner | Phase 1 Step 1 |
| Status | Open — must be resolved immediately |

---

### R-009: AI Claims Credibility

| Field | Value |
|---|---|
| Severity | **Critical** |
| Category | Scientific credibility |
| Description | Risk of accidentally making unsupported claims about prediction accuracy, collapse detection, or field validation. |
| Likelihood | Medium — requires constant vigilance during implementation |
| Impact | Judges may reject the solution if claims are scientifically unsupportable. |
| Mitigation | 1. Enforce terminology rules (anomaly detection ≠ collapse prediction). 2. Review all UI text for unsupported claims. 3. Label all data provenance. 4. Document model limitations explicitly. 5. Use adversarial audit before release. |
| Owner | All phases |
| Status | Open — perpetual |

---

### R-010: External Integration Failure

| Field | Value |
|---|---|
| Severity | **Low** |
| Category | Integration |
| Description | Email, SMS, webhook integrations may fail if credentials are not configured. |
| Likelihood | High — credentials unlikely to be available during hackathon |
| Impact | Minimal — all core alert mechanisms (in-app, audio, visual) work without external services. |
| Mitigation | 1. Graceful degradation. 2. Log demo-mode status. 3. Never claim external delivery without confirmation. |
| Owner | Alert engine |
| Status | Accepted |

---

### R-011: Supabase Project Region Selection

| Field | Value |
|---|---|
| Severity | **Low** |
| Category | Infrastructure |
| Description | Free tier allows only one active project. Region selection affects latency. |
| Likelihood | Certain |
| Impact | Minor latency difference. Mumbai (ap-south-1) is closest to India. |
| Mitigation | Select ap-south-1 when creating project. |
| Owner | Phase 1 |
| Status | Open |

---

## Closed/Resolved Risks

_None yet — this is Phase 0._
