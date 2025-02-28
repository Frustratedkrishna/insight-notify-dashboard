
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Clock, Bell, CalendarDays, Pencil } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const user = localStorage.getItem("user");
      const profileStr = localStorage.getItem("profile");
      
      if (!user || !profileStr) {
        navigate("/auth");
        return;
      }
      
      const profile = JSON.parse(profileStr);
      setProfile(profile);
      
      try {
        // Get attendance data
        if (profile?.id) {
          const { data, error } = await supabase
            .from("attendance")
            .select("*")
            .eq("student_id", profile.id)
            .order("date", { ascending: false })
            .limit(5);
          
          if (error) throw error;
          setAttendanceData(data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Calculate attendance statistics
  const totalClasses = attendanceData.length;
  const presentClasses = attendanceData.filter(item => item.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardNav />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
          
          {profile && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Welcome, {profile.first_name}!</h2>
              <p className="text-muted-foreground">Enrollment: {profile.enrollment_number}</p>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Attendance Overview Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Attendance Overview</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendancePercentage}%</div>
                <p className="text-xs text-muted-foreground">
                  Present {presentClasses} out of {totalClasses} classes
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate("/attendance")}
                >
                  View Attendance
                </Button>
              </CardContent>
            </Card>
            
            {/* Academic Calendar Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Academic Calendar</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Upcoming</div>
                <p className="text-xs text-muted-foreground">
                  Mid-term exams starting next week
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>May 15</span>
                    <span className="text-muted-foreground">Mathematics Exam</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>May 17</span>
                    <span className="text-muted-foreground">Physics Exam</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Latest Marks Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Latest Marks</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78<span className="text-sm font-normal text-muted-foreground">/100</span></div>
                <p className="text-xs text-muted-foreground">
                  Last Assessment: Database Systems
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate("/marks")}
                >
                  View All Marks
                </Button>
              </CardContent>
            </Card>
            
            {/* Recent Notifications Card */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Pencil className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assignment Submission</p>
                      <p className="text-xs text-muted-foreground">
                        Data Structures assignment due on May 10, 2023
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Class Cancelled</p>
                      <p className="text-xs text-muted-foreground">
                        Computer Networks class cancelled tomorrow
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate("/notifications")}
                >
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
            
            {/* Student Profile Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                {profile && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Department</span>
                      <span className="text-xs font-medium">{profile.department || 'Computer Science'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Batch</span>
                      <span className="text-xs font-medium">{profile.batch || '2023-2027'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <span className="text-xs font-medium">{profile.email || 'student@example.com'}</span>
                    </div>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  size="sm"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
