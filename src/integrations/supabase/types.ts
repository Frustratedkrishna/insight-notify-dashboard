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
          year?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          department: string | null
          id: string
          semester: number | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          id?: string
          semester?: number | null
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          id?: string
          semester?: number | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          aadharNumber: string
          abcId: string | null
          address: string | null
          createdAt: string
          email: string
          enrollmentNumber: string
          id: string
          name: string
          password: string
          phone: string | null
          profileImage: string | null
          role: Database["public"]["Enums"]["UserRole"]
          updatedAt: string
        }
        Insert: {
          aadharNumber: string
          abcId?: string | null
          address?: string | null
          createdAt?: string
          email: string
          enrollmentNumber: string
          id: string
          name: string
          password: string
          phone?: string | null
          profileImage?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt: string
        }
        Update: {
          aadharNumber?: string
          abcId?: string | null
          address?: string | null
          createdAt?: string
          email?: string
          enrollmentNumber?: string
          id?: string
          name?: string
          password?: string
          phone?: string | null
          profileImage?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt?: string
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
      UserRole: "STUDENT" | "FACULTY" | "HOD" | "CHAIRMAN" | "ADMIN"
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
