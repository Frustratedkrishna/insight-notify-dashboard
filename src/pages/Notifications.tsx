import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationCard } from "@/components/NotificationCard";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  course_name: string;
  year: number;
  section: string;
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

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("course_name, year, section")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;
        
        setProfile(profileData);

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .or(`type.eq.general,and(type.eq.course_specific,department.eq.${profileData.course_name},semester.eq.${profileData.year * 2})`)
          .order("created_at", { ascending: false });

        if (notificationsError) throw notificationsError;

        setNotifications(notificationsData);
      } catch (error: any) {
        console.error("Error:", error);
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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardNav />
          <main className="flex-1 p-6">
            <div>Loading...</div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          <div className="space-y-4">
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}