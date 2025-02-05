import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarProvider } from "@/components/ui/sidebar";

interface FacultyProfile {
  id: string;
  role: "admin" | "chairman" | "director" | "hod" | "class_coordinator";
  department: string | null;
  created_at: string;
  updated_at: string;
  employee_id: string;
  password: string;
  first_name: string;
  last_name: string;
  course_name: string | null;
  year: number | null;
  section: string | null;
  profile_image_url: string | null;
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate("/faculty-auth");
          return;
        }

        // First get the employee_id from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('enrollment_number')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData?.enrollment_number) {
          throw new Error("Employee ID not found in profile");
        }

        // Then use the employee_id to fetch faculty profile
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty_profiles')
          .select('*')
          .eq('employee_id', profileData.enrollment_number)
          .maybeSingle();

        if (facultyError) throw facultyError;
        if (!facultyData) {
          throw new Error("Faculty profile not found");
        }

        setFacultyProfile(facultyData as FacultyProfile);
      } catch (error: any) {
        console.error('Error fetching faculty profile:', error);
        setError(error.message);
        if (error.message.includes("profile not found")) {
          navigate("/faculty-auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyProfile();
  }, [navigate]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Please contact administrator to set up your faculty profile.
            </AlertDescription>
          </Alert>
        </div>
      </SidebarProvider>
    );
  }

  if (!facultyProfile) {
    return (
      <SidebarProvider>
        <div className="p-8">
          <Alert>
            <AlertDescription>
              No faculty profile found. Please contact administrator to set up your profile.
            </AlertDescription>
          </Alert>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={facultyProfile.profile_image_url || ""}
                    alt={`${facultyProfile.first_name} ${facultyProfile.last_name}`}
                  />
                  <AvatarFallback>
                    {facultyProfile.first_name[0]}
                    {facultyProfile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">
                    {facultyProfile.first_name} {facultyProfile.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">Employee ID: {facultyProfile.employee_id}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="capitalize">{facultyProfile.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p>{facultyProfile.department || 'Not specified'}</p>
                </div>
                {facultyProfile.course_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Course</p>
                    <p>{facultyProfile.course_name}</p>
                  </div>
                )}
                {facultyProfile.section && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Section</p>
                    <p>{facultyProfile.section}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {facultyProfile.year && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p>{facultyProfile.year}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p>{new Date(facultyProfile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p>{new Date(facultyProfile.updated_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}