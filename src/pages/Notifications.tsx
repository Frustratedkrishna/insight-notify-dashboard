
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationCard } from "@/components/NotificationCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Notification } from "@/types/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Profile {
  course_name: string;
  year: number;
  section: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth from localStorage first
        const profileStr = localStorage.getItem('profile');
        if (!profileStr) {
          setError("Authentication required. Please login again.");
          navigate("/auth");
          return;
        }

        // Get profile from localStorage
        const profile = JSON.parse(profileStr);
        
        // Fetch from profiles table to ensure we have the latest data
        const { data: dbProfile, error: profileError } = await supabase
          .from("profiles")
          .select("course_name, year, section")
          .eq("enrollment_number", profile.enrollment_number)
          .maybeSingle();
          
        if (profileError) throw profileError;
        if (!dbProfile) throw new Error("Profile not found");
        
        setProfile(dbProfile);
        console.log("Student profile loaded:", dbProfile);

        // Convert year to semester (as string)
        const semester = String(dbProfile.year * 2);
        console.log("Calculated semester:", semester);

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .or(`type.eq.general,and(type.eq.course_specific,department.eq.${dbProfile.course_name},semester.eq.${semester})`)
          .order("created_at", { ascending: false });

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
          throw notificationsError;
        }

        console.log("Notifications fetched:", notificationsData);
        setNotifications(notificationsData || []);
      } catch (error: any) {
        console.error("Error:", error);
        setError(error.message);
        toast({
          title: "Error loading notifications",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, toast]);

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardNav />
          <main className="flex-1 p-4 md:p-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Notifications</h1>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="mb-4 border rounded-lg p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))
            ) : notifications.length === 0 ? (
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
