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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          created_at: string | null
          cues: string | null
          duration: number | null
          equipment: string | null
          id: string
          left_right: Database["public"]["Enums"]["side_enum"] | null
          level: number | null
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"] | null
          name: string
          reps_seconds:
            | Database["public"]["Enums"]["reps_or_seconds_enum"]
            | null
          sets: number | null
          setup: string | null
          video_link: string | null
        }
        Insert: {
          created_at?: string | null
          cues?: string | null
          duration?: number | null
          equipment?: string | null
          id?: string
          left_right?: Database["public"]["Enums"]["side_enum"] | null
          level?: number | null
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"] | null
          name: string
          reps_seconds?:
            | Database["public"]["Enums"]["reps_or_seconds_enum"]
            | null
          sets?: number | null
          setup?: string | null
          video_link?: string | null
        }
        Update: {
          created_at?: string | null
          cues?: string | null
          duration?: number | null
          equipment?: string | null
          id?: string
          left_right?: Database["public"]["Enums"]["side_enum"] | null
          level?: number | null
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"] | null
          name?: string
          reps_seconds?:
            | Database["public"]["Enums"]["reps_or_seconds_enum"]
            | null
          sets?: number | null
          setup?: string | null
          video_link?: string | null
        }
        Relationships: []
      }
      measurements: {
        Row: {
          created_at: string | null
          id: string
          left_right: Database["public"]["Enums"]["side_enum"] | null
          norm_ratio_id: string | null
          raw_value: number | null
          test_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          left_right?: Database["public"]["Enums"]["side_enum"] | null
          norm_ratio_id?: string | null
          raw_value?: number | null
          test_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          left_right?: Database["public"]["Enums"]["side_enum"] | null
          norm_ratio_id?: string | null
          raw_value?: number | null
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_norm_ratio_id_fkey"
            columns: ["norm_ratio_id"]
            isOneToOne: false
            referencedRelation: "norm_ratios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurements_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      norm_ratios: {
        Row: {
          gender: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          max_age: number | null
          min_age: number | null
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"] | null
          norm_value: number | null
        }
        Insert: {
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"] | null
          norm_value?: number | null
        }
        Update: {
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"] | null
          norm_value?: number | null
        }
        Relationships: []
      }
      tests: {
        Row: {
          created_at: string | null
          id: string
          test_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          test_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          test_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercises: {
        Row: {
          completed_at: string | null
          exercise_id: string | null
          id: string
          order: number | null
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          exercise_id?: string | null
          id?: string
          order?: number | null
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          exercise_id?: string | null
          id?: string
          order?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          height_value_in: number | null
          id: string
          last_name: string | null
          updated_at: string | null
          weight_value_lb: number | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          height_value_in?: number | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          weight_value_lb?: number | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          height_value_in?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          weight_value_lb?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          completed_at: string | null
          day: number | null
          id: string
          test_id: string | null
          week: number | null
        }
        Insert: {
          completed_at?: string | null
          day?: number | null
          id?: string
          test_id?: string | null
          week?: number | null
        }
        Update: {
          completed_at?: string | null
          day?: number | null
          id?: string
          test_id?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
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
      gender_enum: "male" | "female"
      muscle_group_enum: "quad" | "ham" | "glute" | "abductor"
      reps_or_seconds_enum: "reps" | "seconds"
      side_enum: "left" | "right" | "both"
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
      gender_enum: ["male", "female"],
      muscle_group_enum: ["quad", "ham", "glute", "abductor"],
      reps_or_seconds_enum: ["reps", "seconds"],
      side_enum: ["left", "right", "both"],
    },
  },
} as const
