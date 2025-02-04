import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";

interface FacultyProfile {
  id: string;
  role: string;
  department: string | null;
  designation: string | null;
  qualification: string | null;
  experience_years: number | null;
  specialization: string | null;
  first_name: string;
  last_name: string;
  employee_id: string;
  profile_image_url: string | null;
  course_name: string | null;
  year: number | null;
  section: string | null;
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate("/faculty-auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('faculty_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        
        if (!profile) {
          toast({
            title: "Profile not found",
            description: "Please contact administrator to set up your faculty profile",
            variant: "destructive",
          });
          navigate("/faculty-auth");
          return;
        }

        setFacultyProfile(profile as FacultyProfile);
      } catch (error: any) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message || "An error occurred while fetching your profile",
          variant: "destructive",
        });
        navigate("/faculty-auth");
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndFetchProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardNav />
          <main className="container mx-auto px-4 py-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!facultyProfile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center">Profile Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Please contact administrator to set up your faculty profile
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={facultyProfile.profile_image_url || ''} 
                    alt={`${facultyProfile.first_name} ${facultyProfile.last_name}`} 
                  />
                  <AvatarFallback>
                    {facultyProfile.first_name[0]}
                    {facultyProfile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {facultyProfile.first_name} {facultyProfile.last_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Employee ID: {facultyProfile.employee_id}
                  </p>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="capitalize">{facultyProfile.role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p>{facultyProfile.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Designation</p>
                    <p>{facultyProfile.designation || 'Not specified'}</p>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Qualification</p>
                    <p>{facultyProfile.qualification || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p>{facultyProfile.experience_years ? `${facultyProfile.experience_years} years` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Specialization</p>
                    <p>{facultyProfile.specialization || 'Not specified'}</p>
                  </div>
                  {facultyProfile.year && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Year</p>
                      <p>{facultyProfile.year}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
