# SIH26025 — Data Repository & Geotechnical Reference Profiles

## 1. Data Classification

All data in this repository is categorized in accordance with the project's engineering truth standards:

| Classification | Meaning & Scope | Examples |
|---|---|---|
| **SYNTHETIC** | Algorithmic simulation generated using geomechanical parameters | `baseline_nominal.json`, `subsidence_event.json` |
| **REFERENCE** | Published stratigraphy and empirical curves from published literature | `moonidih_strata.json` (CMPDI Jharia Coalfield bore-hole logs) |
| **EXPERIMENTAL** | Laboratory bench test data measured during prototype hardware testing | Transducer ADC noise floor, LoRa packet loss tests |

> [!IMPORTANT]
> **Real Mine Data Disclosure:**
> In accordance with SIH engineering rules, this repository **explicitly acknowledges that live continuous telemetry from active producing underground coal faces is NOT yet collected** due to statutory DGMS certification prerequisites. All demonstration datasets are mathematically modeled synthetic representations grounded in published CMPDI and CSIR-CIMFR strata mechanics research.

---

## 2. Spatial & Coordinate Reference Systems (CRS)

* **Projection:** Universal Transverse Mercator (UTM) Zone 45N (**EPSG:32645**)
* **Geodetic Datum:** World Geodetic System 1984 (**WGS84**, EPSG:4326)
* **Colliery Location:** Moonidih Underground Colliery, Jharia Coalfield, Dhanbad District, Jharkhand, India.
* **Geographic Coordinates:** 23°44'18" N, 86°21'04" E.

---

## 3. Data Dictionary (Telemetry Schema)

| Field Name | Type | Unit | Description |
|---|---|---|---|
| `timestamp` | Number (int64) | Unix Epoch (seconds) | Sampling timestamp |
| `node_code` | String | Identifier | Station code (e.g., `SN-101`, `SN-102`) |
| `panel_code` | String | Identifier | Working extraction panel (e.g., `P-101`) |
| `tilt_x_deg` | Number (float) | Degrees (°) | Pitch angle relative to horizontal |
| `tilt_y_deg` | Number (float) | Degrees (°) | Roll angle relative to horizontal |
| `displacement_mm` | Number (float) | Millimeters (mm) | Extensometer sag from borehole collar |
| `vibration_rms` | Number (float) | mm/s | Root-Mean-Square acoustic emission velocity |
| `strain_microstrain` | Number (float) | $\mu\epsilon$ | Tensile strain measured on roof bolt shank |
| `battery_voltage_mv`| Number (uint16) | Millivolts (mV) | Node battery potential |
| `rssi_dbm` | Number (int8) | dBm | LoRa received signal strength at gateway |
