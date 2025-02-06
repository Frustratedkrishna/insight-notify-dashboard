import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { NotificationCard } from "@/components/NotificationCard";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  department?: string;
  semester?: number;
  created_at: string;
}

interface FacultyProfile {
  role: string;
  course_name?: string;
  section?: string;
}

export default function FacultyNotifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate("/faculty-auth");
          return;
        }

        const employeeId = session.user.user_metadata.employee_id;
        
        if (!employeeId) {
          throw new Error("Employee ID not found in session");
        }

        // Fetch faculty profile
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty_profiles')
          .select('role, course_name, section')
          .eq('employee_id', employeeId)
          .maybeSingle();

        if (facultyError) throw facultyError;
        if (!facultyData) {
          throw new Error("Faculty profile not found");
        }

        setFacultyProfile(facultyData);

        // Fetch notifications based on role
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (facultyData.role === 'class_coordinator') {
          // Class coordinators see notifications for their specific class
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${facultyData.course_name},semester.eq.${facultyData.section})`);
        } else if (facultyData.role === 'hod') {
          // HODs see notifications for their department
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${facultyData.course_name})`);
        }

        const { data: notificationsData, error: notificationsError } = await query;

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

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
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
        )}
      </main>
    </div>
  );
}