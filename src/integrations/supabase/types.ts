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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
