
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  status: string;
}

export default function StudentAttendance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<{ present: number; absent: number; total: number }>({
    present: 0,
    absent: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Get student profile from localStorage
        const profileStr = localStorage.getItem('profile');
        if (!profileStr) {
          throw new Error("No student profile found. Please log in again.");
        }
        
        const profile = JSON.parse(profileStr);
        
        // First get the student's ID using their enrollment number
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select('id')
          .eq('enrollment_number', profile.enrollment_number)
          .maybeSingle();
        
        if (studentError) throw studentError;
        if (!studentData) throw new Error("Student record not found");
        
        // Now fetch attendance records for this student
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('id, date, subject, status')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        
        if (attendanceError) throw attendanceError;
        
        // Update state with fetched attendance
        setAttendance(attendanceData || []);
        
        // Calculate statistics
        const present = attendanceData?.filter(record => record.status === 'present').length || 0;
        const total = attendanceData?.length || 0;
        
        setStats({
          present,
          absent: total - present,
          total
        });
        
      } catch (error: any) {
        console.error('Error fetching attendance:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, [toast]);

  // Data for pie chart
  const chartData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
  ];
  
  const COLORS = ['#22c55e', '#ef4444'];

  const getAttendancePercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <main className="container mx-auto p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <main className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Your Attendance</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.total === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-gray-500">No attendance data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-100 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Total Classes</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Present</p>
                      <p className="text-xl font-bold text-green-600">{stats.present}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Absent</p>
                      <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md text-center">
                    <p className="text-sm text-gray-500 mb-1">Attendance Percentage</p>
                    <p className={`text-2xl font-bold ${
                      getAttendancePercentage() >= 75 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {getAttendancePercentage()}%
                    </p>
                    {getAttendancePercentage() < 75 && (
                      <p className="text-sm text-red-500 mt-1">
                        Your attendance is below 75%. Please improve your attendance.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No attendance records found</p>
              ) : (
                <div className="overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
