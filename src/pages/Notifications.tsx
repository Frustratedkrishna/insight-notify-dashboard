
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/types/supabase";

// Import refactored components
import { NotificationsLoading } from "@/components/notifications/NotificationsLoading";
import { NotificationsEmpty } from "@/components/notifications/NotificationsEmpty";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationsError } from "@/components/notifications/NotificationsError";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";

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
        const userStr = localStorage.getItem('user');
        const profileStr = localStorage.getItem('profile');
        
        if (!userStr && !profileStr) {
          setError("Authentication required. Please login again.");
          navigate("/auth");
          return;
        }

        // Try to get profile from localStorage
        let storedProfile = null;
        if (profileStr) {
          storedProfile = JSON.parse(profileStr);
        } else if (userStr) {
          const user = JSON.parse(userStr);
          
          // Fetch from profiles table using enrollment number from user object
          if (user.enrollment_number) {
            const { data: dbProfile, error: profileError } = await supabase
              .from("profiles")
              .select("course_name, year, section")
              .eq("enrollment_number", user.enrollment_number)
              .maybeSingle();
              
            if (profileError) throw profileError;
            if (!dbProfile) throw new Error("Profile not found");
            
            storedProfile = dbProfile;
          } else {
            throw new Error("Invalid user data");
          }
        }
        
        if (!storedProfile) {
          throw new Error("Profile data not available");
        }
        
        setProfile(storedProfile);
        console.log("Student profile loaded:", storedProfile);

        // Build filters for notifications
        const filters = [];
        
        // Always include general notifications
        filters.push('type.eq.general');
        
        // Add course-specific notifications from HOD (all sections, all years of the course)
        if (storedProfile.course_name) {
          filters.push(`and(type.eq.course_specific,department.eq.${storedProfile.course_name},semester.is.null)`);
        }
        
        // Add year-specific notifications for this course 
        // (notifications meant for all sections of a specific year)
        if (storedProfile.course_name && storedProfile.year) {
          const semester = String(storedProfile.year * 2);
          filters.push(`and(type.eq.course_specific,department.eq.${storedProfile.course_name},semester.eq.${semester},section.is.null)`);
        }
        
        // Add section-specific notifications
        // (notifications meant for specific section from class coordinator)
        if (storedProfile.course_name && storedProfile.year && storedProfile.section) {
          const semester = String(storedProfile.year * 2);
          filters.push(`and(type.eq.course_specific,department.eq.${storedProfile.course_name},semester.eq.${semester},section.eq.${storedProfile.section})`);
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
          <main className="flex-1 flex justify-center items-center p-4">
            <NotificationsError error={error} />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-8 lg:p-12 flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <NotificationsHeader />
              <div className="space-y-4">
                {loading ? (
                  <NotificationsLoading />
                ) : notifications.length === 0 ? (
                  <NotificationsEmpty />
                ) : (
                  <NotificationsList notifications={notifications} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
