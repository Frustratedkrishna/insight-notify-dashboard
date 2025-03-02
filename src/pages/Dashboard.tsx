
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/DashboardNav";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationCard } from "@/components/NotificationCard";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  profile_image_url: string;
  verify: boolean;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  department?: string;
  semester?: number;
  created_at: string;
}

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

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .or(`type.eq.general,and(type.eq.course_specific,department.eq.${profileData.course_name},semester.eq.${profileData.year * 2})`)
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
    return <div>Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <DashboardNav />
        <main className="flex-1 p-6 space-y-6">
          {!profile.verify && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is pending verification by your class coordinator. Some features may be limited.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.profile_image_url}
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

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-muted-foreground">No notifications to display</p>
              ) : (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    title={notification.title}
                    content={notification.content}
                    createdAt={notification.created_at}
                    type={notification.type}
                    department={notification.department}
                    semester={notification.semester}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
