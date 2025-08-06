export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      payment_events: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          failure_reason: string | null
          id: string
          processed_at: string
          stripe_invoice_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          failure_reason?: string | null
          id?: string
          processed_at?: string
          stripe_invoice_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          failure_reason?: string | null
          id?: string
          processed_at?: string
          stripe_invoice_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dynamic_qr_quota: number
          extra_quota_from_boosters: number | null
          id: string
          queued_for_delete: string | null
          stripe_customer_id: string | null
          subscription_level: number | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dynamic_qr_quota?: number
          extra_quota_from_boosters?: number | null
          id: string
          queued_for_delete?: string | null
          stripe_customer_id?: string | null
          subscription_level?: number | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dynamic_qr_quota?: number
          extra_quota_from_boosters?: number | null
          id?: string
          queued_for_delete?: string | null
          stripe_customer_id?: string | null
          subscription_level?: number | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_subscription_level"
            columns: ["subscription_level"]
            isOneToOne: false
            referencedRelation: "active_subscription_packages"
            referencedColumns: ["level"]
          },
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
      quota_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_in_cents: number
          quantity: number
          stripe_price_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_in_cents: number
          quantity: number
          stripe_price_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_in_cents?: number
          quantity?: number
          stripe_price_id?: string
        }
        Relationships: []
      }
      quota_purchases: {
        Row: {
          amount_paid_cents: number | null
          expires_at: string | null
          id: string
          package_id: string
          purchased_at: string
          quantity: number
          stripe_checkout_id: string
          user_id: string
        }
        Insert: {
          amount_paid_cents?: number | null
          expires_at?: string | null
          id?: string
          package_id: string
          purchased_at?: string
          quantity: number
          stripe_checkout_id: string
          user_id: string
        }
        Update: {
          amount_paid_cents?: number | null
          expires_at?: string | null
          id?: string
          package_id?: string
          purchased_at?: string
          quantity?: number
          stripe_checkout_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quota_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "quota_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_purchases_user_id_fkey"
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
          price_in_cents: number
          quota_amount: number
          sort_order: number
          stripe_price_id: string | null
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
          price_in_cents?: number
          quota_amount?: number
          sort_order?: number
          stripe_price_id?: string | null
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
          price_in_cents?: number
          quota_amount?: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          id: string
          plan_name: string | null
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string
          subscription_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          id?: string
          plan_name?: string | null
          status: string
          stripe_price_id?: string | null
          stripe_subscription_id: string
          subscription_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          id?: string
          plan_name?: string | null
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string
          subscription_type?: string | null
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
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          processed_at: string | null
          processing_time_ms: number | null
          raw_data: Json | null
          received_at: string
          retry_count: number | null
          status: string
          stripe_event_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          processing_time_ms?: number | null
          raw_data?: Json | null
          received_at?: string
          retry_count?: number | null
          status: string
          stripe_event_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          processing_time_ms?: number | null
          raw_data?: Json | null
          received_at?: string
          retry_count?: number | null
          status?: string
          stripe_event_id?: string
          updated_at?: string | null
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
          level: number | null
          name: string | null
          price_in_cents: number | null
          quota_amount: number | null
          sort_order: number | null
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          level?: number | null
          name?: string | null
          price_in_cents?: number | null
          quota_amount?: number | null
          sort_order?: number | null
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string | null
          is_active?: boolean | null
          level?: number | null
          name?: string | null
          price_in_cents?: number | null
          quota_amount?: number | null
          sort_order?: number | null
          stripe_price_id?: string | null
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
      get_user_subscription_details: {
        Args: { p_user_id: string }
        Returns: {
          subscription_level: number
          subscription_name: string
          subscription_quota: number
          booster_quota: number
          total_quota: number
          used_quota: number
          remaining_quota: number
          can_create_more: boolean
        }[]
      }
      get_user_total_quota: {
        Args: { p_user_id: string }
        Returns: number
      }
      handle_new_subscription: {
        Args:
          | {
              p_user_id: string
              p_subscription_id: string
              p_price_id: string
              p_status: string
              p_plan_name: string
              p_current_period_end: string
              p_quota_amount: number
            }
          | {
              p_user_id: string
              p_subscription_id: string
              p_price_id: string
              p_status: string
              p_plan_name: string
              p_current_period_end: string
              p_quota_amount: number
            }
        Returns: undefined
      }
      handle_quota_purchase: {
        Args:
          | {
              p_user_id: string
              p_package_id: string
              p_quantity: number
              p_amount_paid: number
              p_stripe_checkout_id: string
              p_expires_at?: string
            }
          | {
              p_user_id: string
              p_package_id: string
              p_quantity: number
              p_amount_paid: number
              p_stripe_checkout_id: string
              p_expires_at?: string
            }
        Returns: undefined
      }
      handle_subscription_updated: {
        Args:
          | {
              p_subscription_id: string
              p_price_id: string
              p_status: string
              p_plan_name: string
              p_current_period_end: string
            }
          | {
              p_subscription_id: string
              p_price_id: string
              p_status: string
              p_plan_name: string
              p_current_period_end: string
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
