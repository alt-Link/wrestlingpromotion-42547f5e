export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      championships: {
        Row: {
          brand: Database["public"]["Enums"]["brand_type"] | null
          created_at: string
          current_champion: string | null
          event: string | null
          history: Json | null
          id: string
          name: string
          reign_end: string | null
          reign_start: string | null
          retired: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          current_champion?: string | null
          event?: string | null
          history?: Json | null
          id?: string
          name: string
          reign_end?: string | null
          reign_start?: string | null
          retired?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          current_champion?: string | null
          event?: string | null
          history?: Json | null
          id?: string
          name?: string
          reign_end?: string | null
          reign_start?: string | null
          retired?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rivalries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          intensity: number | null
          status: Database["public"]["Enums"]["rivalry_status"] | null
          timeline: Json | null
          updated_at: string
          user_id: string
          wrestler1: string
          wrestler2: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          intensity?: number | null
          status?: Database["public"]["Enums"]["rivalry_status"] | null
          timeline?: Json | null
          updated_at?: string
          user_id: string
          wrestler1: string
          wrestler2: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          intensity?: number | null
          status?: Database["public"]["Enums"]["rivalry_status"] | null
          timeline?: Json | null
          updated_at?: string
          user_id?: string
          wrestler1?: string
          wrestler2?: string
        }
        Relationships: []
      }
      shows: {
        Row: {
          base_show_id: string | null
          brand: Database["public"]["Enums"]["brand_type"] | null
          created_at: string
          date: string | null
          description: string | null
          frequency: Database["public"]["Enums"]["show_frequency"] | null
          id: string
          instance_date: string | null
          is_template: boolean | null
          matches: Json | null
          name: string
          updated_at: string
          user_id: string
          venue: string | null
        }
        Insert: {
          base_show_id?: string | null
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          date?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["show_frequency"] | null
          id?: string
          instance_date?: string | null
          is_template?: boolean | null
          matches?: Json | null
          name: string
          updated_at?: string
          user_id: string
          venue?: string | null
        }
        Update: {
          base_show_id?: string | null
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          date?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["show_frequency"] | null
          id?: string
          instance_date?: string | null
          is_template?: boolean | null
          matches?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      storylines: {
        Row: {
          created_at: string
          custom_events: Json | null
          description: string | null
          end_date: string | null
          faction_betrayal_coming: boolean | null
          faction_betrayal_description: string | null
          faction_new_member_coming: boolean | null
          faction_new_member_description: string | null
          faction_new_member_wrestler: string | null
          id: string
          notes: string | null
          priority: string | null
          start_date: string | null
          status: string | null
          timeline: Json | null
          title: string
          updated_at: string
          user_id: string
          wrestlers: string[] | null
        }
        Insert: {
          created_at?: string
          custom_events?: Json | null
          description?: string | null
          end_date?: string | null
          faction_betrayal_coming?: boolean | null
          faction_betrayal_description?: string | null
          faction_new_member_coming?: boolean | null
          faction_new_member_description?: string | null
          faction_new_member_wrestler?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          timeline?: Json | null
          title: string
          updated_at?: string
          user_id: string
          wrestlers?: string[] | null
        }
        Update: {
          created_at?: string
          custom_events?: Json | null
          description?: string | null
          end_date?: string | null
          faction_betrayal_coming?: boolean | null
          faction_betrayal_description?: string | null
          faction_new_member_coming?: boolean | null
          faction_new_member_description?: string | null
          faction_new_member_wrestler?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          timeline?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          wrestlers?: string[] | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_save: boolean | null
          created_at: string
          enable_ai_suggestions: boolean | null
          id: string
          show_match_ratings: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save?: boolean | null
          created_at?: string
          enable_ai_suggestions?: boolean | null
          id?: string
          show_match_ratings?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save?: boolean | null
          created_at?: string
          enable_ai_suggestions?: boolean | null
          id?: string
          show_match_ratings?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wrestlers: {
        Row: {
          alignment: string | null
          brand: Database["public"]["Enums"]["brand_type"] | null
          created_at: string
          faction: string | null
          gender: string | null
          id: string
          injured: boolean | null
          manager: string | null
          name: string
          on_break: boolean | null
          overall_rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment?: string | null
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          faction?: string | null
          gender?: string | null
          id?: string
          injured?: boolean | null
          manager?: string | null
          name: string
          on_break?: boolean | null
          overall_rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment?: string | null
          brand?: Database["public"]["Enums"]["brand_type"] | null
          created_at?: string
          faction?: string | null
          gender?: string | null
          id?: string
          injured?: boolean | null
          manager?: string | null
          name?: string
          on_break?: boolean | null
          overall_rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      brand_type: "Raw" | "SmackDown" | "NXT" | "PPV" | "Special"
      rivalry_status: "active" | "inactive" | "concluded"
      show_frequency: "weekly" | "monthly" | "one-time"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      brand_type: ["Raw", "SmackDown", "NXT", "PPV", "Special"],
      rivalry_status: ["active", "inactive", "concluded"],
      show_frequency: ["weekly", "monthly", "one-time"],
    },
  },
} as const
