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
          created_at: string
          date: string
          id: string
          status: string
          student_id: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          status: string
          student_id?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string | null
          subject?: string
        }
        Relationships: [
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
          created_at: string
          department: string | null
          designation: string | null
          employee_id: string
          experience_years: number | null
          first_name: string
          id: string
          last_name: string
          password: string
          qualification: string | null
          role: Database["public"]["Enums"]["faculty_role"]
          section: string | null
          specialization: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          course_name?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          employee_id: string
          experience_years?: number | null
          first_name: string
          id: string
          last_name: string
          password: string
          qualification?: string | null
          role: Database["public"]["Enums"]["faculty_role"]
          section?: string | null
          specialization?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          course_name?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          employee_id?: string
          experience_years?: number | null
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          qualification?: string | null
          role?: Database["public"]["Enums"]["faculty_role"]
          section?: string | null
          specialization?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          created_at: string
          exam_type: string
          id: string
          marks: number | null
          semester: number | null
          student_id: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          exam_type: string
          id?: string
          marks?: number | null
          semester?: number | null
          student_id?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          exam_type?: string
          id?: string
          marks?: number | null
          semester?: number | null
          student_id?: string | null
          subject?: string
        }
        Relationships: [
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
          created_at: string
          created_by: string | null
          department: string | null
          id: string
          semester: number | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          semester?: number | null
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          semester?: number | null
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
          aadhar_number: string | null
          abc_id: string | null
          course_name: string | null
          created_at: string
          department: string | null
          enrollment_number: string | null
          first_name: string
          id: string
          is_approved: boolean | null
          last_name: string
          password: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          section: string | null
          semester: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          aadhar_number?: string | null
          abc_id?: string | null
          course_name?: string | null
          created_at?: string
          department?: string | null
          enrollment_number?: string | null
          first_name: string
          id: string
          is_approved?: boolean | null
          last_name: string
          password?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          section?: string | null
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          aadhar_number?: string | null
          abc_id?: string | null
          course_name?: string | null
          created_at?: string
          department?: string | null
          enrollment_number?: string | null
          first_name?: string
          id?: string
          is_approved?: boolean | null
          last_name?: string
          password?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          section?: string | null
          semester?: number | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      timetable: {
        Row: {
          created_at: string
          day_of_week: string
          department: string
          end_time: string
          faculty_id: string | null
          id: string
          room_number: string | null
          semester: number | null
          start_time: string
          subject: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          department: string
          end_time: string
          faculty_id?: string | null
          id?: string
          room_number?: string | null
          semester?: number | null
          start_time: string
          subject: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          department?: string
          end_time?: string
          faculty_id?: string | null
          id?: string
          room_number?: string | null
          semester?: number | null
          start_time?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_faculty_id_fkey"
            columns: ["faculty_id"]
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
      check_faculty_password: {
        Args: {
          p_employee_id: string
          p_password: string
        }
        Returns: string
      }
      check_password: {
        Args: {
          p_enrollment_number: string
          p_password: string
        }
        Returns: string
      }
    }
    Enums: {
      faculty_role:
        | "admin"
        | "chairman"
        | "director"
        | "hod"
        | "class_coordinator"
      user_role: "student" | "faculty" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
