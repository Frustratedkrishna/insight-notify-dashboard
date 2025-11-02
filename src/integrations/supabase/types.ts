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
      attendance: {
        Row: {
          created_at: string | null
          date: string
          faculty_id: string
          id: string
          status: string
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          date: string
          faculty_id: string
          id?: string
          status: string
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          date?: string
          faculty_id?: string
          id?: string
          status?: string
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string | null
          description: string | null
          election_id: string
          id: string
          name: string
          photo_url: string | null
          position: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          election_id: string
          id?: string
          name: string
          photo_url?: string | null
          position?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          election_id?: string
          id?: string
          name?: string
          photo_url?: string | null
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faculty_profiles: {
        Row: {
          course_name: string | null
          created_at: string | null
          department: string | null
          employee_id: string
          first_name: string
          id: string
          last_name: string
          password: string
          profile_image_url: string | null
          role: Database["public"]["Enums"]["faculty_role"]
          section: string | null
          updated_at: string | null
          verify: boolean | null
          year: number | null
        }
        Insert: {
          course_name?: string | null
          created_at?: string | null
          department?: string | null
          employee_id: string
          first_name: string
          id?: string
          last_name: string
          password: string
          profile_image_url?: string | null
          role: Database["public"]["Enums"]["faculty_role"]
          section?: string | null
          updated_at?: string | null
          verify?: boolean | null
          year?: number | null
        }
        Update: {
          course_name?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["faculty_role"]
          section?: string | null
          updated_at?: string | null
          verify?: boolean | null
          year?: number | null
        }
        Relationships: []
      }
      marks: {
        Row: {
          created_at: string | null
          exam_type: string
          faculty_id: string
          id: string
          marks: number
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          exam_type: string
          faculty_id: string
          id?: string
          marks: number
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          exam_type?: string
          faculty_id?: string
          id?: string
          marks?: number
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_batches: {
        Row: {
          course_name: string
          created_at: string
          exam_type: string
          faculty_id: string
          id: string
          minimum_marks: number
          section: string
          upload_date: string
          year: number
        }
        Insert: {
          course_name: string
          created_at?: string
          exam_type: string
          faculty_id: string
          id?: string
          minimum_marks?: number
          section: string
          upload_date?: string
          year: number
        }
        Update: {
          course_name?: string
          created_at?: string
          exam_type?: string
          faculty_id?: string
          id?: string
          minimum_marks?: number
          section?: string
          upload_date?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "marks_batches_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          department: string | null
          id: string
          section: string | null
          semester: string | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          id?: string
          section?: string | null
          semester?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          id?: string
          section?: string | null
          semester?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          course_name: string | null
          created_at: string | null
          email: string | null
          enrollment_number: string | null
          first_name: string
          id: string
          last_name: string
          password: string
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          section: string | null
          updated_at: string | null
          verify: boolean | null
          year: number | null
        }
        Insert: {
          course_name?: string | null
          created_at?: string | null
          email?: string | null
          enrollment_number?: string | null
          first_name: string
          id: string
          last_name: string
          password?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          section?: string | null
          updated_at?: string | null
          verify?: boolean | null
          year?: number | null
        }
        Update: {
          course_name?: string | null
          created_at?: string | null
          email?: string | null
          enrollment_number?: string | null
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          section?: string | null
          updated_at?: string | null
          verify?: boolean | null
          year?: number | null
        }
        Relationships: []
      }
      student_marks: {
        Row: {
          batch_id: string
          created_at: string
          enrollment_number: string
          id: string
          percentage: number | null
          result_status: string | null
          student_name: string
          subject_marks: Json
          total_marks: number | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          enrollment_number: string
          id?: string
          percentage?: number | null
          result_status?: string | null
          student_name: string
          subject_marks: Json
          total_marks?: number | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          enrollment_number?: string
          id?: string
          percentage?: number | null
          result_status?: string | null
          student_name?: string
          subject_marks?: Json
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_marks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "marks_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          allow_faculty_registration: boolean | null
          allow_student_registration: boolean | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          allow_faculty_registration?: boolean | null
          allow_student_registration?: boolean | null
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          allow_faculty_registration?: boolean | null
          allow_student_registration?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string
          election_id: string
          id: string
          user_id: string
          voted_at: string | null
        }
        Insert: {
          candidate_id: string
          election_id: string
          id?: string
          user_id: string
          voted_at?: string | null
        }
        Update: {
          candidate_id?: string
          election_id?: string
          id?: string
          user_id?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      update_election_status: { Args: never; Returns: undefined }
    }
    Enums: {
      faculty_role:
        | "admin"
        | "chairman"
        | "director"
        | "hod"
        | "class_coordinator"
      user_role: "student" | "faculty"
      UserRole: "STUDENT" | "FACULTY" | "HOD" | "CHAIRMAN" | "ADMIN"
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
      faculty_role: [
        "admin",
        "chairman",
        "director",
        "hod",
        "class_coordinator",
      ],
      user_role: ["student", "faculty"],
      UserRole: ["STUDENT", "FACULTY", "HOD", "CHAIRMAN", "ADMIN"],
    },
  },
} as const
