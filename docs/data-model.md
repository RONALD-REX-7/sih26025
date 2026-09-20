# SIH26025 Data Model & Entity Relationship Architecture

## 1. Overview
The SIH26025 data platform is built on Supabase PostgreSQL (Project `sih26025` / `dbnkuycxiooibsnoauwv` in `ap-south-1`). It models physical mining infrastructure, edge sensing topology, continuous time-series telemetry, AI anomaly assessments, regulatory early warnings, and immutable compliance audit logs.

---

## 2. Core Enums

| Enum Name | Permissible Values | Operational Context |
|---|---|---|
| `risk_state` | `Normal`, `Advisory`, `Watch`, `Warning`, `Critical` | Exactly 5 states locked across entire system |
| `alert_severity` | `info`, `low`, `medium`, `high`, `critical` | Notification priority levels |
| `sensor_type` | `tilt_x`, `tilt_y`, `displacement`, `vibration`, `strain`, `moisture`, `pore_pressure`, `acoustic_emission` | Geotechnical sensing channels |
| `data_provenance` | `LIVE`, `SIMULATED`, `DEMO`, `HISTORICAL`, `EXTERNAL`, `EXPERIMENTAL`, `ASSUMPTION` | Provenance classification |
| `user_role` | `MineManager`, `SafetyOfficer`, `Engineer`, `Administrator` | Role-based authorization |
| `node_status` | `online`, `offline`, `degraded`, `maintenance` | Physical node operational state |
| `alert_status` | `active`, `acknowledged`, `escalated`, `resolved` | Alert workflow lifecycle |

---

## 3. Entity Definitions

### 3.1 Infrastructure & Spatial Hierarchy
```
Mines (1) ────< Panels (N) ────< Sensor Nodes (N) ────< Sensors (N)
  │
  ├────< Deployment Zones (N)
  └────< External Observations (N) [InSAR Satellite Baseline]
```

#### `mines`
- `id` (UUID PK): Primary key
- `code` (TEXT UNIQUE): E.g. `MINE-JHR-001`
- `name` (TEXT): Colliery name (e.g. `Bhowra-West Colliery (Demo Mine)`)
- `location_name` (TEXT): Geographical coalfield
- `state` (TEXT): Indian state (Jharkhand)
- `latitude`, `longitude` (DOUBLE PRECISION): Colliery center
- `boundary_geojson` (JSONB): Polygon spatial boundary
- `is_demo` (BOOLEAN): Distinction between demo vs live colliery
- `metadata` (JSONB): DGMS circle, seam info, strata properties

#### `panels`
- `id` (UUID PK)
- `mine_id` (UUID FK -> mines)
- `code` (TEXT): E.g. `P-101`, `P-102`
- `name` (TEXT): Descriptive working name
- `depth_m` (DOUBLE PRECISION): Underground seam depth in meters
- `extraction_method` (TEXT): `Bord and Pillar`, `Continuous Miner`, `Longwall`
- `extraction_status` (TEXT): `active`, `depillaring`, `standing`
- `coordinates_geojson` (JSONB): Underground panel polygon

#### `deployment_zones`
- `id` (UUID PK)
- `mine_id` (UUID FK -> mines)
- `name` (TEXT): Zone identifier (e.g. `Active Goaf Margin`, `Surface Railway Overlay`)
- `zone_type` (TEXT): Risk boundary category
- `geometry_geojson` (JSONB): Zone polygon
- `risk_level` (risk_state)

---

### 3.2 Sensor & Telemetry Layer

#### `sensor_nodes`
- `id` (UUID PK)
- `node_code` (TEXT): E.g. `SN-101` to `SN-116`
- `mine_id` (UUID FK -> mines)
- `panel_id` (UUID FK -> panels, nullable)
- `latitude`, `longitude` (DOUBLE PRECISION): Georeferenced coordinates
- `elevation_m` (DOUBLE PRECISION): Surface or underground elevation
- `status` (node_status): Fleet operational status
- `battery_level` (DOUBLE PRECISION): Percentage (0-100%)
- `hardware_version` (TEXT): `ESP32-S3-LoraWAN-v1.2`
- `firmware_version` (TEXT): Edge controller firmware
- `provenance` (data_provenance): `DEMO`, `SIMULATED`, or `LIVE`
- `last_heartbeat` (TIMESTAMPTZ): Edge alive ping

#### `sensors`
- `id` (UUID PK)
- `sensor_code` (TEXT): `TILT_X`, `TILT_Y`, `DISP_Z`, `VIB_RMS`, `STRAIN`
- `node_id` (UUID FK -> sensor_nodes)
- `sensor_type` (sensor_type)
- `unit` (TEXT): `arcsec`, `mm`, `mm/s`, `microstrain`, `kPa`
- `min_threshold`, `max_threshold`, `rate_threshold` (DOUBLE PRECISION)
- `calibration_factor` (DOUBLE PRECISION)
- `is_active` (BOOLEAN)

#### `telemetry_samples`
- `id` (UUID PK)
- `sensor_id` (UUID FK -> sensors)
- `node_id` (UUID FK -> sensor_nodes)
- `timestamp` (TIMESTAMPTZ): Sample acquisition time
- `value` (DOUBLE PRECISION): Calibrated physical engineering reading
- `raw_value` (DOUBLE PRECISION): Uncalibrated ADC output
- `quality_score` (DOUBLE PRECISION): 0.0 to 1.0 integrity score
- `provenance` (data_provenance): Mandatory data origin classification

#### `sensor_health`
- `id` (UUID PK)
- `node_id` (UUID FK -> sensor_nodes)
- `timestamp` (TIMESTAMPTZ)
- `battery_pct` (DOUBLE PRECISION)
- `signal_rssi` (INTEGER): dBm signal strength
- `packet_loss_pct` (DOUBLE PRECISION)
- `drift_detected` (BOOLEAN)
- `status` (node_status)

---

### 3.3 Intelligence, Risk & Early Warning

#### `anomaly_events`
- `id` (UUID PK)
- `node_id` (UUID FK -> sensor_nodes)
- `sensor_id` (UUID FK -> sensors, nullable)
- `detected_at` (TIMESTAMPTZ)
- `anomaly_type` (TEXT): E.g. `persistent_tilt_deflection`, `vibration_burst`
- `severity` (alert_severity)
- `z_score`, `rate_of_change` (DOUBLE PRECISION)
- `persistence_sec` (DOUBLE PRECISION): Window duration
- `confidence` (DOUBLE PRECISION): Statistical confidence score
- `status` (TEXT): `active`, `resolved`
- `details` (JSONB): Sensor fusion parameters

#### `risk_assessments`
- `id` (UUID PK)
- `mine_id` (UUID FK -> mines)
- `panel_id` (UUID FK -> panels, nullable)
- `assessed_at` (TIMESTAMPTZ)
- `risk_state` (risk_state): 1 of 5 states
- `confidence` (DOUBLE PRECISION): 0.0 to 1.0
- `score` (DOUBLE PRECISION): Normalized severity index
- `contributing_factors` (JSONB): Array of weighted factors
- `evidence_summary` (TEXT): Explainable human-readable justification
- `model_version` (TEXT): `sih-ensemble-v1`
- `provenance` (data_provenance)

#### `alerts` & `alert_acknowledgements`
- `alerts`: Alert notifications generated from risk assessments
- `alert_acknowledgements`: Mandatory operator sign-off (user_id, role, action_taken, timestamp)

#### `audit_entries`
- Append-only immutable log for all administrative, safety-critical and emergency actions.
- No `UPDATE` or `DELETE` RLS policies exist on this table.
