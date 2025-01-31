import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/DashboardNav";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  profile_image_url: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, toast]);

  const getProfileImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "";
    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(imageUrl);
    return data.publicUrl;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="min-h-screen flex w-full">
      <DashboardNav />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={getProfileImageUrl(profile.profile_image_url)}
                  alt="Profile" 
                />
                <AvatarFallback>
                  {profile.first_name[0]}
                  {profile.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-500">
                  Enrollment: {profile.enrollment_number}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Course</h3>
                <p>{profile.course_name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Year</h3>
                <p>{profile.year}</p>
              </div>
              <div>
                <h3 className="font-semibold">Section</h3>
                <p>{profile.section}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}