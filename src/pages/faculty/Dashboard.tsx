import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardNav } from "@/components/DashboardNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FacultyProfile {
  id: string;
  role: string;
  department: string | null;
  designation: string | null;
  qualification: string | null;
  experience_years: number | null;
  specialization: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    enrollment_number: string | null;
    profile_image_url: string | null;
  };
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/faculty-auth");
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('faculty_profiles')
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              enrollment_number,
              profile_image_url
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        if (!profile) {
          toast({
            title: "Profile not found",
            description: "Please contact administrator",
            variant: "destructive",
          });
          return;
        }

        setFacultyProfile(profile as FacultyProfile);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!facultyProfile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={facultyProfile.profiles.profile_image_url || ''} 
                  alt={`${facultyProfile.profiles.first_name} ${facultyProfile.profiles.last_name}`} 
                />
                <AvatarFallback>
                  {facultyProfile.profiles.first_name[0]}
                  {facultyProfile.profiles.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>
                  {facultyProfile.profiles.first_name} {facultyProfile.profiles.last_name}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Employee ID: {facultyProfile.profiles.enrollment_number}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}