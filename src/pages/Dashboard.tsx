
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/DashboardNav";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Bell } from "lucide-react";
import { Notification, Profile } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { useNavigate as useNav } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate("/auth");
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.enrollment_number) {
          localStorage.removeItem('user');
          navigate("/auth");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("enrollment_number", user.enrollment_number)
          .single();

        if (profileError || !profileData) {
          console.error("Profile error:", profileError);
          localStorage.removeItem('user');
          navigate("/auth");
          return;
        }

        // Check if user is verified
        if (!profileData.verify) {
          toast({
            title: "Account not verified",
            description: "Your account is pending verification by your class coordinator.",
            variant: "destructive",
          });
          localStorage.removeItem('user');
          navigate("/auth");
          return;
        }

        setProfile(profileData);

        // Build filters for notifications
        const filters = [];
        
        // Always include general notifications
        filters.push('type.eq.general');
        
        // Add course-specific notifications from HOD (all sections, all years of the course)
        if (profileData.course_name) {
          filters.push(`and(type.eq.course_specific,department.eq.${profileData.course_name},semester.is.null)`);
        }
        
        // Add year-specific notifications for this course 
        // (notifications meant for all sections of a specific year)
        if (profileData.course_name && profileData.year) {
          const semester = String(profileData.year * 2);
          filters.push(`and(type.eq.course_specific,department.eq.${profileData.course_name},semester.eq.${semester},section.is.null)`);
        }
        
        // Add section-specific notifications
        // (notifications meant for specific section from class coordinator)
        if (profileData.course_name && profileData.year && profileData.section) {
          const semester = String(profileData.year * 2);
          filters.push(`and(type.eq.course_specific,department.eq.${profileData.course_name},semester.eq.${semester},section.eq.${profileData.section})`);
        }

        console.log("Notification filters:", filters);
        const filterQuery = filters.join(',');
        
        // Fetch notifications with combined filters
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .or(filterQuery)
          .order("created_at", { ascending: false });

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
          toast({
            title: "Error",
            description: "Failed to load notifications",
            variant: "destructive",
          });
        } else {
          setNotifications(notificationsData || []);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem('user');
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-64 bg-gray-200 rounded-md"></div>
          <div className="h-40 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gray-50">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-6 space-y-6 flex justify-center">
          <div className="w-full max-w-4xl space-y-6">
            {!profile.verify && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your account is pending verification by your class coordinator. Some features may be limited.
                </AlertDescription>
              </Alert>
            )}

            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle className="text-xl">Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-20 w-20 border">
                    <AvatarImage 
                      src={profile.profile_image_url}
                      alt="Profile" 
                    />
                    <AvatarFallback className="text-lg bg-red-100 text-red-600">
                      {profile.first_name?.[0]}
                      {profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {profile.first_name} {profile.last_name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Enrollment: {profile.enrollment_number}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-sm text-gray-600">Course</h3>
                    <p className="mt-1">{profile.course_name}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-sm text-gray-600">Year</h3>
                    <p className="mt-1">{profile.year}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-sm text-gray-600">Section</h3>
                    <p className="mt-1">{profile.section}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="h-5 w-5 text-red-500" />
                  <span>Notifications</span>
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/notifications')}
                  className="text-sm h-9"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="bg-gray-50 rounded-b-lg p-4">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No notifications to display</p>
                ) : (
                  <NotificationsList 
                    notifications={notifications.slice(0, 3)} 
                    className="max-h-[400px] overflow-y-auto pr-2"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
