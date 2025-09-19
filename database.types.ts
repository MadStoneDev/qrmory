export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      error_reports: {
        Row: {
          client_ip: string | null
          context: Json | null
          created_at: string | null
          fingerprint: string | null
          id: string
          message: string
          stack: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          client_ip?: string | null
          context?: Json | null
          created_at?: string | null
          fingerprint?: string | null
          id: string
          message: string
          stack?: string | null
          timestamp: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          client_ip?: string | null
          context?: Json | null
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          message?: string
          stack?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          dynamic_qr_quota: number
          id: string
          paddle_customer_id: string | null
          queued_for_delete: string | null
          subscription_level: number | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dynamic_qr_quota?: number
          id: string
          paddle_customer_id?: string | null
          queued_for_delete?: string | null
          subscription_level?: number | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dynamic_qr_quota?: number
          id?: string
          paddle_customer_id?: string | null
          queued_for_delete?: string | null
          subscription_level?: number | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_subscription_level"
            columns: ["subscription_level"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["level"]
          },
        ]
      }
      qr_code_analytics: {
        Row: {
          browser: string | null
          country: string | null
          device_type: string | null
          id: string
          qr_code_id: string
          referrer: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          qr_code_id: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          qr_code_id?: string
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_analytics_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean | null
          qr_value: string | null
          shortcode: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          qr_value?: string | null
          shortcode?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          qr_value?: string | null
          shortcode?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          billing_interval: string
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean
          level: number
          name: string
          paddle_price_id: string | null
          price_in_cents: number
          quota_amount: number
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          billing_interval?: string
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          level: number
          name: string
          paddle_price_id?: string | null
          price_in_cents?: number
          quota_amount?: number
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          billing_interval?: string
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          level?: number
          name?: string
          paddle_price_id?: string | null
          price_in_cents?: number
          quota_amount?: number
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          paddle_checkout_id: string | null
          paddle_price_id: string | null
          paddle_subscription_id: string | null
          plan_name: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: string
          paddle_checkout_id?: string | null
          paddle_price_id?: string | null
          paddle_subscription_id?: string | null
          plan_name?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          paddle_checkout_id?: string | null
          paddle_price_id?: string | null
          paddle_subscription_id?: string | null
          plan_name?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_subscription_packages: {
        Row: {
          billing_interval: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string | null
          is_active: boolean | null
          name: string | null
          paddle_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          paddle_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          paddle_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_dynamic_qr_quota: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cleanup_old_error_reports: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_subscription_details: {
        Args: { p_user_id: string }
        Returns: {
          booster_quota: number
          can_create_more: boolean
          remaining_quota: number
          subscription_level: number
          subscription_name: string
          subscription_quota: number
          total_quota: number
          used_quota: number
        }[]
      }
      get_user_total_quota: {
        Args: { p_user_id: string }
        Returns: number
      }
      handle_new_subscription: {
        Args:
          | {
              p_current_period_end: string
              p_plan_name: string
              p_price_id: string
              p_quota_amount: number
              p_status: string
              p_subscription_id: string
              p_user_id: string
            }
          | {
              p_current_period_end: string
              p_plan_name: string
              p_price_id: string
              p_quota_amount: number
              p_status: string
              p_subscription_id: string
              p_user_id: string
            }
        Returns: undefined
      }
      handle_quota_purchase: {
        Args:
          | {
              p_amount_paid: number
              p_expires_at?: string
              p_package_id: string
              p_quantity: number
              p_stripe_checkout_id: string
              p_user_id: string
            }
          | {
              p_amount_paid: number
              p_expires_at?: string
              p_package_id: string
              p_quantity: number
              p_stripe_checkout_id: string
              p_user_id: string
            }
        Returns: undefined
      }
      handle_subscription_updated: {
        Args:
          | {
              p_current_period_end: string
              p_plan_name: string
              p_price_id: string
              p_status: string
              p_subscription_id: string
            }
          | {
              p_current_period_end: string
              p_plan_name: string
              p_price_id: string
              p_status: string
              p_subscription_id: string
            }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
