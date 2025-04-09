
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  email: string;
  profile_image_url?: string;
  verify: boolean;
}

export interface FacultyProfile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'chairman' | 'director' | 'hod' | 'class_coordinator';
  course_name: string | null;
  section: string | null;
  department: string | null;
  year: number | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string | null;
  verify: boolean;
  password: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  department?: string;
  semester?: string;
  section?: string;
  created_by?: string;
  created_at: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  verify: boolean;
}
