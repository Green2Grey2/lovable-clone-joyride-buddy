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
      achievements: {
        Row: {
          category: string
          created_at: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          points: number
          sort_order: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          points?: number
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          calories_burned: number | null
          created_at: string
          date: string
          distance: number | null
          duration: number | null
          elevation_gain: number | null
          entry_method: string | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          is_manual_entry: boolean | null
          notes: string | null
          steps: number | null
          type: string
          user_id: string
          verification_image_url: string | null
          verification_required: boolean | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          weather_conditions: Json | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          duration?: number | null
          elevation_gain?: number | null
          entry_method?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          is_manual_entry?: boolean | null
          notes?: string | null
          steps?: number | null
          type: string
          user_id: string
          verification_image_url?: string | null
          verification_required?: boolean | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          distance?: number | null
          duration?: number | null
          elevation_gain?: number | null
          entry_method?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          is_manual_entry?: boolean | null
          notes?: string | null
          steps?: number | null
          type?: string
          user_id?: string
          verification_image_url?: string | null
          verification_required?: boolean | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          weather_conditions?: Json | null
        }
        Relationships: []
      }
      activity_likes: {
        Row: {
          activity_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_likes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "social_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_patterns: {
        Row: {
          calculated_at: string | null
          id: string
          pattern_type: string
          period_end: string
          period_start: string
          score: number | null
          trend: string | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          pattern_type: string
          period_end: string
          period_start: string
          score?: number | null
          trend?: string | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          id?: string
          pattern_type?: string
          period_end?: string
          period_start?: string
          score?: number | null
          trend?: string | null
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
      collaborative_goals: {
        Row: {
          created_at: string | null
          created_by: string
          department: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          target_value: number
          title: string
          unit: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          department: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          target_value: number
          title: string
          unit: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          department?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value?: number
          title?: string
          unit?: string
        }
        Relationships: []
      }
      daily_steps: {
        Row: {
          created_at: string
          date: string
          id: string
          steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          steps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      department_settings: {
        Row: {
          created_at: string
          department_name: string
          id: string
          is_active: boolean
          max_size: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_name: string
          id?: string
          is_active?: boolean
          max_size?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_name?: string
          id?: string
          is_active?: boolean
          max_size?: number
          updated_at?: string
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
      goal_participants: {
        Row: {
          goal_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          goal_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          goal_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_participants_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "collaborative_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          created_at: string | null
          department: string
          goal_id: string
          id: string
          progress_value: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department: string
          goal_id: string
          id?: string
          progress_value: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string
          goal_id?: string
          id?: string
          progress_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "collaborative_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      heart_rate_data: {
        Row: {
          activity_id: string | null
          created_at: string | null
          heart_rate: number
          id: string
          timestamp: string
          user_id: string
          zone: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          heart_rate: number
          id?: string
          timestamp: string
          user_id: string
          zone?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          heart_rate?: number
          id?: string
          timestamp?: string
          user_id?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heart_rate_data_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
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
          auto_verify_enabled: boolean | null
          avatar_url: string | null
          created_at: string
          daily_step_goal: number | null
          date_of_birth: string | null
          department: string | null
          email: string | null
          fitness_level: string | null
          height: string | null
          height_cm: number | null
          id: string
          join_date: string | null
          max_heart_rate: number | null
          monthly_step_goal: number | null
          name: string | null
          notification_preferences: Json | null
          privacy_settings: Json | null
          trust_score: number | null
          updated_at: string
          user_id: string
          verifications_completed: number | null
          weekly_goal: number | null
          weekly_step_goal: number | null
          weight: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          auto_verify_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          daily_step_goal?: number | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          fitness_level?: string | null
          height?: string | null
          height_cm?: number | null
          id?: string
          join_date?: string | null
          max_heart_rate?: number | null
          monthly_step_goal?: number | null
          name?: string | null
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          verifications_completed?: number | null
          weekly_goal?: number | null
          weekly_step_goal?: number | null
          weight?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          auto_verify_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          daily_step_goal?: number | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          fitness_level?: string | null
          height?: string | null
          height_cm?: number | null
          id?: string
          join_date?: string | null
          max_heart_rate?: number | null
          monthly_step_goal?: number | null
          name?: string | null
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          verifications_completed?: number | null
          weekly_goal?: number | null
          weekly_step_goal?: number | null
          weight?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      social_activities: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          data: Json | null
          earned_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          data?: Json | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          data?: Json | null
          earned_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
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
          average_streak_length: number | null
          calories_burned: number | null
          created_at: string
          current_streak: number | null
          fitness_level: string | null
          heart_rate: number | null
          id: string
          last_activity_date: string | null
          last_updated: string | null
          lifetime_steps: number | null
          longest_streak: number | null
          monthly_steps: number | null
          pending_steps: number | null
          preferred_workout_time: string | null
          sleep_hours: number | null
          streak_resets: number | null
          today_steps: number | null
          updated_at: string
          user_id: string
          verified_steps: number | null
          water_intake: number | null
          weekly_goal_calories: number | null
          weekly_goal_duration: number | null
          weekly_goal_steps: number | null
          weekly_steps: number | null
          yearly_steps: number | null
        }
        Insert: {
          average_streak_length?: number | null
          calories_burned?: number | null
          created_at?: string
          current_streak?: number | null
          fitness_level?: string | null
          heart_rate?: number | null
          id?: string
          last_activity_date?: string | null
          last_updated?: string | null
          lifetime_steps?: number | null
          longest_streak?: number | null
          monthly_steps?: number | null
          pending_steps?: number | null
          preferred_workout_time?: string | null
          sleep_hours?: number | null
          streak_resets?: number | null
          today_steps?: number | null
          updated_at?: string
          user_id: string
          verified_steps?: number | null
          water_intake?: number | null
          weekly_goal_calories?: number | null
          weekly_goal_duration?: number | null
          weekly_goal_steps?: number | null
          weekly_steps?: number | null
          yearly_steps?: number | null
        }
        Update: {
          average_streak_length?: number | null
          calories_burned?: number | null
          created_at?: string
          current_streak?: number | null
          fitness_level?: string | null
          heart_rate?: number | null
          id?: string
          last_activity_date?: string | null
          last_updated?: string | null
          lifetime_steps?: number | null
          longest_streak?: number | null
          monthly_steps?: number | null
          pending_steps?: number | null
          preferred_workout_time?: string | null
          sleep_hours?: number | null
          streak_resets?: number | null
          today_steps?: number | null
          updated_at?: string
          user_id?: string
          verified_steps?: number | null
          water_intake?: number | null
          weekly_goal_calories?: number | null
          weekly_goal_duration?: number | null
          weekly_goal_steps?: number | null
          weekly_steps?: number | null
          yearly_steps?: number | null
        }
        Relationships: []
      }
      verification_history: {
        Row: {
          action: string | null
          activity_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          activity_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          activity_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_history_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_insights: {
        Row: {
          actionable: boolean | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          insight_type: string
          metrics: Json | null
          priority: number | null
          title: string
          user_id: string
        }
        Insert: {
          actionable?: boolean | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          metrics?: Json | null
          priority?: number | null
          title: string
          user_id: string
        }
        Update: {
          actionable?: boolean | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          metrics?: Json | null
          priority?: number | null
          title?: string
          user_id?: string
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
      verification_analytics: {
        Row: {
          auto_verified_count: number | null
          avg_verification_time_hours: number | null
          date: string | null
          pending_count: number | null
          rejected_count: number | null
          total_entries: number | null
          verified_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_percentile: {
        Args: { p_user_id: string; p_metric: string; p_timeframe?: string }
        Returns: number
      }
      calculate_user_trust_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_and_award_achievement: {
        Args: { p_user_id: string; p_achievement_name: string; p_data?: Json }
        Returns: boolean
      }
      generate_workout_insights: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_social_feed: {
        Args: { p_user_id?: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          user_id: string
          type: string
          title: string
          description: string
          data: Json
          created_at: string
          user_name: string
          user_department: string
          like_count: number
          liked_by_me: boolean
        }[]
      }
      get_user_achievement_summary: {
        Args: { p_user_id: string }
        Returns: {
          total_achievements: number
          total_points: number
          latest_achievement_name: string
          latest_achievement_date: string
          achievements_by_category: Json
        }[]
      }
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
      update_activity_patterns: {
        Args: { p_user_id: string }
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
