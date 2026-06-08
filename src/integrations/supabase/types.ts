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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          id: string
          property_id: string
          renter_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          id?: string
          property_id: string
          renter_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          id?: string
          property_id?: string
          renter_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          cleanliness_preference:
            | Database["public"]["Enums"]["cleanliness_pref"]
            | null
          created_at: string
          full_name: string | null
          id: string
          national_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["profile_role"]
          selfie_url: string | null
          sleep_schedule:
            | Database["public"]["Enums"]["sleep_schedule_pref"]
            | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          cleanliness_preference?:
            | Database["public"]["Enums"]["cleanliness_pref"]
            | null
          created_at?: string
          full_name?: string | null
          id: string
          national_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          selfie_url?: string | null
          sleep_schedule?:
            | Database["public"]["Enums"]["sleep_schedule_pref"]
            | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          cleanliness_preference?:
            | Database["public"]["Enums"]["cleanliness_pref"]
            | null
          created_at?: string
          full_name?: string | null
          id?: string
          national_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          selfie_url?: string | null
          sleep_schedule?:
            | Database["public"]["Enums"]["sleep_schedule_pref"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available_from: string | null
          baths: number | null
          beds: number | null
          city: string | null
          contact_phone: string | null
          created_at: string
          deposit_months: number | null
          description: string | null
          furnishing: string | null
          id: string
          image_urls: string[] | null
          landlord_id: string
          lat: number | null
          lng: number | null
          neighbourhood: string | null
          occupancy: Database["public"]["Enums"]["occupancy_status"]
          price: number
          property_type: string | null
          size_sqm: number | null
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_from?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          deposit_months?: number | null
          description?: string | null
          furnishing?: string | null
          id?: string
          image_urls?: string[] | null
          landlord_id: string
          lat?: number | null
          lng?: number | null
          neighbourhood?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"]
          price: number
          property_type?: string | null
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_from?: string | null
          baths?: number | null
          beds?: number | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          deposit_months?: number | null
          description?: string | null
          furnishing?: string | null
          id?: string
          image_urls?: string[] | null
          landlord_id?: string
          lat?: number | null
          lng?: number | null
          neighbourhood?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"]
          price?: number
          property_type?: string | null
          size_sqm?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roommate_requests: {
        Row: {
          created_at: string
          id: string
          property_id: string | null
          property_key: string | null
          status: Database["public"]["Enums"]["roommate_request_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id?: string | null
          property_key?: string | null
          status?: Database["public"]["Enums"]["roommate_request_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string | null
          property_key?: string | null
          status?: Database["public"]["Enums"]["roommate_request_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roommate_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roommate_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viewing_requests: {
        Row: {
          contact_phone: string
          created_at: string
          id: string
          landlord_id: string
          message: string | null
          property_id: string
          renter_id: string
          seen: boolean
          updated_at: string
        }
        Insert: {
          contact_phone: string
          created_at?: string
          id?: string
          landlord_id: string
          message?: string | null
          property_id: string
          renter_id: string
          seen?: boolean
          updated_at?: string
        }
        Update: {
          contact_phone?: string
          created_at?: string
          id?: string
          landlord_id?: string
          message?: string | null
          property_id?: string
          renter_id?: string
          seen?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_landlord_public: {
        Args: { _landlord_id: string }
        Returns: {
          full_name: string
          id: string
          selfie_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "landlord" | "admin"
      booking_status: "pending" | "confirmed" | "cancelled"
      cleanliness_pref: "High" | "Medium" | "Flexible"
      occupancy_status: "vacant" | "occupied"
      profile_role: "renter" | "landlord" | "admin"
      property_status: "pending" | "approved" | "rejected"
      roommate_request_status: "searching" | "matched"
      sleep_schedule_pref: "Early Bird" | "Night Owl" | "Flexible"
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
    Enums: {
      app_role: ["student", "landlord", "admin"],
      booking_status: ["pending", "confirmed", "cancelled"],
      cleanliness_pref: ["High", "Medium", "Flexible"],
      occupancy_status: ["vacant", "occupied"],
      profile_role: ["renter", "landlord", "admin"],
      property_status: ["pending", "approved", "rejected"],
      roommate_request_status: ["searching", "matched"],
      sleep_schedule_pref: ["Early Bird", "Night Owl", "Flexible"],
    },
  },
} as const
