
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import type { FacultyProfile } from "@/types/supabase";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        // Get faculty data from localStorage
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          throw new Error("No faculty session found");
        }

        const faculty = JSON.parse(facultyStr);
        
        // Fetch fresh data from the database
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty_profiles')
          .select('*')
          .eq('employee_id', faculty.employee_id)
          .maybeSingle();

        if (facultyError) {
          console.error('Error fetching faculty profile:', facultyError);
          throw facultyError;
        }

        if (!facultyData) {
          throw new Error("Faculty profile not found");
        }

        console.log('Fetched faculty data:', facultyData);

        // Handle profile image URL
        if (facultyData.profile_image_url && !facultyData.profile_image_url.startsWith('http')) {
          const { data: imageUrl } = await supabase
            .storage
            .from('profile-images')
            .getPublicUrl(facultyData.profile_image_url);
          
          facultyData.profile_image_url = imageUrl.publicUrl;
        }

        setFacultyProfile(facultyData);
      } catch (error: any) {
        console.error('Error fetching faculty profile:', error);
        setError(error.message);
        if (error.message.includes("No faculty session found") || error.message.includes("profile not found")) {
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
      <div className="min-h-screen">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="container mx-auto p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Please contact administrator if this persists.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  if (!facultyProfile) {
    return (
      <div className="min-h-screen">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="container mx-auto p-6">
          <Alert>
            <AlertDescription>
              No faculty profile found. Please contact administrator to set up your profile.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <FacultyNavbar role={facultyProfile.role} />
      <main className="container mx-auto p-6">
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
      </main>
    </div>
  );
}
