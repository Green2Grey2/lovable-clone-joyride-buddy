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
      activities: {
        Row: {
          calories_burned: number | null
          created_at: string
          date: string
          distance: number | null
          duration: number | null
          id: string
          steps: number | null
          type: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          duration?: number | null
          id?: string
          steps?: number | null
          type: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          duration?: number | null
          id?: string
          steps?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          target_value?: number | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      editorial_media: {
        Row: {
          author: string
          category: string
          content: string | null
          content_type: string
          created_at: string | null
          created_by: string
          description: string | null
          duration: number | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author: string
          category: string
          content?: string | null
          content_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration?: number | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration?: number | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      event_attendances: {
        Row: {
          attended_at: string
          check_in_time: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          attended_at?: string
          check_in_time?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          attended_at?: string
          check_in_time?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendances_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean
          location: string | null
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          fitness_level: string | null
          height: string | null
          id: string
          join_date: string | null
          name: string | null
          updated_at: string
          user_id: string
          weekly_goal: number | null
          weight: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          fitness_level?: string | null
          height?: string | null
          id?: string
          join_date?: string | null
          name?: string | null
          updated_at?: string
          user_id: string
          weekly_goal?: number | null
          weight?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          fitness_level?: string | null
          height?: string | null
          id?: string
          join_date?: string | null
          name?: string | null
          updated_at?: string
          user_id?: string
          weekly_goal?: number | null
          weight?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          haptic_enabled: boolean | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          privacy_mode: boolean | null
          sound_enabled: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          haptic_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_mode?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          haptic_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          privacy_mode?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_seen: string
          page_path: string | null
          session_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen?: string
          page_path?: string | null
          session_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen?: string
          page_path?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          calories_burned: number | null
          created_at: string
          current_streak: number | null
          heart_rate: number | null
          id: string
          last_activity_date: string | null
          last_updated: string | null
          sleep_hours: number | null
          today_steps: number | null
          updated_at: string
          user_id: string
          water_intake: number | null
          weekly_steps: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          current_streak?: number | null
          heart_rate?: number | null
          id?: string
          last_activity_date?: string | null
          last_updated?: string | null
          sleep_hours?: number | null
          today_steps?: number | null
          updated_at?: string
          user_id: string
          water_intake?: number | null
          weekly_steps?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          current_streak?: number | null
          heart_rate?: number | null
          id?: string
          last_activity_date?: string | null
          last_updated?: string | null
          sleep_hours?: number | null
          today_steps?: number | null
          updated_at?: string
          user_id?: string
          water_intake?: number | null
          weekly_steps?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      media_feed: {
        Row: {
          author: string | null
          category: string | null
          content_type: string | null
          description: string | null
          display_type: string | null
          featured_image: string | null
          hours_ago: number | null
          id: string | null
          published_at: string | null
          tags: string[] | null
          title: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content_type?: string | null
          description?: string | null
          display_type?: never
          featured_image?: string | null
          hours_ago?: never
          id?: string | null
          published_at?: string | null
          tags?: string[] | null
          title?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content_type?: string | null
          description?: string | null
          display_type?: never
          featured_image?: string | null
          hours_ago?: never
          id?: string | null
          published_at?: string | null
          tags?: string[] | null
          title?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_media_view: {
        Args: { media_id: string }
        Returns: undefined
      }
      publish_media: {
        Args: { media_id: string }
        Returns: undefined
      }
      update_user_session: {
        Args: {
          _user_id: string
          _session_id: string
          _page_path: string
          _user_agent: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "manager"
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
      app_role: ["admin", "moderator", "user", "manager"],
    },
  },
} as const
