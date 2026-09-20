export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_acknowledgements: {
        Row: {
          acknowledged_at: string
          action_taken: string
          alert_id: string
          comment: string | null
          id: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          acknowledged_at?: string
          action_taken: string
          alert_id: string
          comment?: string | null
          id?: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          acknowledged_at?: string
          action_taken?: string
          alert_id?: string
          comment?: string | null
          id?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "alert_acknowledgements_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          id: string
          message: string
          mine_id: string
          panel_id: string | null
          resolved_at: string | null
          risk_assessment_id: string | null
          risk_state: Database["public"]["Enums"]["risk_state"]
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          message: string
          mine_id: string
          panel_id?: string | null
          resolved_at?: string | null
          risk_assessment_id?: string | null
          risk_state: Database["public"]["Enums"]["risk_state"]
          severity: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          message?: string
          mine_id?: string
          panel_id?: string | null
          resolved_at?: string | null
          risk_assessment_id?: string | null
          risk_state?: Database["public"]["Enums"]["risk_state"]
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_events: {
        Row: {
          anomaly_type: string
          confidence: number
          details: Json | null
          detected_at: string
          id: string
          node_id: string
          persistence_sec: number
          rate_of_change: number | null
          sensor_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: string
          z_score: number | null
        }
        Insert: {
          anomaly_type: string
          confidence?: number
          details?: Json | null
          detected_at?: string
          id?: string
          node_id: string
          persistence_sec?: number
          rate_of_change?: number | null
          sensor_id?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status?: string
          z_score?: number | null
        }
        Update: {
          anomaly_type?: string
          confidence?: number
          details?: Json | null
          detected_at?: string
          id?: string
          node_id?: string
          persistence_sec?: number
          rate_of_change?: number | null
          sensor_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: string
          z_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_events_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_events_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_entries: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          payload_after: Json | null
          payload_before: Json | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          payload_after?: Json | null
          payload_before?: Json | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          payload_after?: Json | null
          payload_before?: Json | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      deployment_zones: {
        Row: {
          created_at: string
          description: string | null
          geometry_geojson: Json
          id: string
          mine_id: string
          name: string
          risk_level: Database["public"]["Enums"]["risk_state"]
          zone_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          geometry_geojson: Json
          id?: string
          mine_id: string
          name: string
          risk_level?: Database["public"]["Enums"]["risk_state"]
          zone_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          geometry_geojson?: Json
          id?: string
          mine_id?: string
          name?: string
          risk_level?: Database["public"]["Enums"]["risk_state"]
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_zones_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      external_observations: {
        Row: {
          created_at: string
          cumulative_disp_mm: number | null
          data_quality: string | null
          id: string
          mean_velocity_mm_yr: number | null
          metadata: Json | null
          mine_id: string
          observation_date: string
          observation_type: string
          provenance: Database["public"]["Enums"]["data_provenance"]
          sensor_source: string
        }
        Insert: {
          created_at?: string
          cumulative_disp_mm?: number | null
          data_quality?: string | null
          id?: string
          mean_velocity_mm_yr?: number | null
          metadata?: Json | null
          mine_id: string
          observation_date: string
          observation_type: string
          provenance?: Database["public"]["Enums"]["data_provenance"]
          sensor_source: string
        }
        Update: {
          created_at?: string
          cumulative_disp_mm?: number | null
          data_quality?: string | null
          id?: string
          mean_velocity_mm_yr?: number | null
          metadata?: Json | null
          mine_id?: string
          observation_date?: string
          observation_type?: string
          provenance?: Database["public"]["Enums"]["data_provenance"]
          sensor_source?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_observations_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      mines: {
        Row: {
          boundary_geojson: Json | null
          code: string
          created_at: string
          id: string
          is_demo: boolean
          latitude: number
          location_name: string
          longitude: number
          metadata: Json | null
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          boundary_geojson?: Json | null
          code: string
          created_at?: string
          id?: string
          is_demo?: boolean
          latitude: number
          location_name: string
          longitude: number
          metadata?: Json | null
          name: string
          state?: string
          updated_at?: string
        }
        Update: {
          boundary_geojson?: Json | null
          code?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          latitude?: number
          location_name?: string
          longitude?: number
          metadata?: Json | null
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      panels: {
        Row: {
          code: string
          coordinates_geojson: Json | null
          created_at: string
          depth_m: number
          extraction_method: string
          extraction_status: string
          id: string
          mine_id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          coordinates_geojson?: Json | null
          created_at?: string
          depth_m: number
          extraction_method?: string
          extraction_status?: string
          id?: string
          mine_id: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          coordinates_geojson?: Json | null
          created_at?: string
          depth_m?: number
          extraction_method?: string
          extraction_status?: string
          id?: string
          mine_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panels_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          mine_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          mine_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          mine_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          assessed_at: string
          confidence: number
          contributing_factors: Json
          evidence_summary: string
          id: string
          mine_id: string
          model_version: string
          panel_id: string | null
          provenance: Database["public"]["Enums"]["data_provenance"]
          risk_state: Database["public"]["Enums"]["risk_state"]
          score: number
        }
        Insert: {
          assessed_at?: string
          confidence: number
          contributing_factors?: Json
          evidence_summary: string
          id?: string
          mine_id: string
          model_version?: string
          panel_id?: string | null
          provenance?: Database["public"]["Enums"]["data_provenance"]
          risk_state: Database["public"]["Enums"]["risk_state"]
          score: number
        }
        Update: {
          assessed_at?: string
          confidence?: number
          contributing_factors?: Json
          evidence_summary?: string
          id?: string
          mine_id?: string
          model_version?: string
          panel_id?: string | null
          provenance?: Database["public"]["Enums"]["data_provenance"]
          risk_state?: Database["public"]["Enums"]["risk_state"]
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_health: {
        Row: {
          battery_pct: number
          drift_detected: boolean | null
          id: string
          node_id: string
          packet_loss_pct: number | null
          signal_rssi: number | null
          status: Database["public"]["Enums"]["node_status"]
          timestamp: string
        }
        Insert: {
          battery_pct?: number
          drift_detected?: boolean | null
          id?: string
          node_id: string
          packet_loss_pct?: number | null
          signal_rssi?: number | null
          status?: Database["public"]["Enums"]["node_status"]
          timestamp?: string
        }
        Update: {
          battery_pct?: number
          drift_detected?: boolean | null
          id?: string
          node_id?: string
          packet_loss_pct?: number | null
          signal_rssi?: number | null
          status?: Database["public"]["Enums"]["node_status"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_health_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_nodes: {
        Row: {
          battery_level: number
          created_at: string
          elevation_m: number
          firmware_version: string | null
          hardware_version: string | null
          id: string
          last_heartbeat: string | null
          latitude: number
          longitude: number
          mine_id: string
          node_code: string
          panel_id: string | null
          provenance: Database["public"]["Enums"]["data_provenance"]
          status: Database["public"]["Enums"]["node_status"]
          updated_at: string
        }
        Insert: {
          battery_level?: number
          created_at?: string
          elevation_m?: number
          firmware_version?: string | null
          hardware_version?: string | null
          id?: string
          last_heartbeat?: string | null
          latitude: number
          longitude: number
          mine_id: string
          node_code: string
          panel_id?: string | null
          provenance?: Database["public"]["Enums"]["data_provenance"]
          status?: Database["public"]["Enums"]["node_status"]
          updated_at?: string
        }
        Update: {
          battery_level?: number
          created_at?: string
          elevation_m?: number
          firmware_version?: string | null
          hardware_version?: string | null
          id?: string
          last_heartbeat?: string | null
          latitude?: number
          longitude?: number
          mine_id?: string
          node_code?: string
          panel_id?: string | null
          provenance?: Database["public"]["Enums"]["data_provenance"]
          status?: Database["public"]["Enums"]["node_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_nodes_mine_id_fkey"
            columns: ["mine_id"]
            isOneToOne: false
            referencedRelation: "mines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_nodes_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          calibration_factor: number
          created_at: string
          id: string
          is_active: boolean
          max_threshold: number | null
          min_threshold: number | null
          node_id: string
          rate_threshold: number | null
          sensor_code: string
          sensor_type: Database["public"]["Enums"]["sensor_type"]
          unit: string
        }
        Insert: {
          calibration_factor?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_threshold?: number | null
          min_threshold?: number | null
          node_id: string
          rate_threshold?: number | null
          sensor_code: string
          sensor_type: Database["public"]["Enums"]["sensor_type"]
          unit: string
        }
        Update: {
          calibration_factor?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_threshold?: number | null
          min_threshold?: number | null
          node_id?: string
          rate_threshold?: number | null
          sensor_code?: string
          sensor_type?: Database["public"]["Enums"]["sensor_type"]
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensors_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_sessions: {
        Row: {
          affected_node_codes: string[] | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          scenario: string
          seed: number
          session_code: string
          speed: number
          started_at: string | null
          status: string
          stopped_at: string | null
        }
        Insert: {
          affected_node_codes?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          scenario: string
          seed?: number
          session_code: string
          speed?: number
          started_at?: string | null
          status?: string
          stopped_at?: string | null
        }
        Update: {
          affected_node_codes?: string[] | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          scenario?: string
          seed?: number
          session_code?: string
          speed?: number
          started_at?: string | null
          status?: string
          stopped_at?: string | null
        }
        Relationships: []
      }
      telemetry_samples: {
        Row: {
          id: string
          node_id: string
          provenance: Database["public"]["Enums"]["data_provenance"]
          quality_score: number
          raw_value: number | null
          sensor_id: string
          timestamp: string
          value: number
        }
        Insert: {
          id?: string
          node_id: string
          provenance?: Database["public"]["Enums"]["data_provenance"]
          quality_score?: number
          raw_value?: number | null
          sensor_id: string
          timestamp?: string
          value: number
        }
        Update: {
          id?: string
          node_id?: string
          provenance?: Database["public"]["Enums"]["data_provenance"]
          quality_score?: number
          raw_value?: number | null
          sensor_id?: string
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_samples_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "sensor_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_samples_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_severity: "info" | "low" | "medium" | "high" | "critical"
      alert_status: "active" | "acknowledged" | "escalated" | "resolved"
      data_provenance:
        | "LIVE"
        | "SIMULATED"
        | "DEMO"
        | "HISTORICAL"
        | "EXTERNAL"
        | "EXPERIMENTAL"
        | "ASSUMPTION"
      node_status: "online" | "offline" | "degraded" | "maintenance"
      risk_state: "Normal" | "Advisory" | "Watch" | "Warning" | "Critical"
      sensor_type:
        | "tilt_x"
        | "tilt_y"
        | "displacement"
        | "vibration"
        | "strain"
        | "moisture"
        | "pore_pressure"
        | "acoustic_emission"
      user_role: "MineManager" | "SafetyOfficer" | "Engineer" | "Administrator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
