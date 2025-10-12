
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, CheckCircle2, XCircle, Search } from "lucide-react";
import { Footer } from "@/components/Footer";

interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  status: string;
}

export default function StudentAttendance() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [enrollmentNumber, setEnrollmentNumber] = useState<string | null>(null);
  const [enrollmentInput, setEnrollmentInput] = useState("");
  const [studentInfo, setStudentInfo] = useState<{ 
    id: string; 
    enrollment_number: string;
    name?: string;
  } | null>(null);
  const [stats, setStats] = useState<{ 
    present: number; 
    absent: number; 
    total: number;
    subjectWise: Record<string, { present: number, absent: number, total: number }>
  }>({
    present: 0,
    absent: 0,
    total: 0,
    subjectWise: {}
  });

  useEffect(() => {
    // Try to get enrollment number from different sources
    // 1. URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlEnrollment = queryParams.get('enrollment');
    
    // 2. Check localStorage
    let storedEnrollment = null;
    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        console.log("Student profile from localStorage:", profile);
        if (profile.enrollment_number) {
          storedEnrollment = profile.enrollment_number;
        }
      } catch (e) {
        console.error("Error parsing profile from localStorage:", e);
      }
    }
    
    // Set enrollment number from URL or localStorage
    const foundEnrollment = urlEnrollment || storedEnrollment;
    if (foundEnrollment) {
      setEnrollmentNumber(foundEnrollment);
      console.log("Using enrollment number:", foundEnrollment);
    }
  }, [location.search]);

  // Fetch attendance whenever enrollment number changes
  useEffect(() => {
    if (enrollmentNumber) {
      fetchAttendance(enrollmentNumber);
    } else {
      setLoading(false);
    }
  }, [enrollmentNumber]);

  const fetchAttendance = async (enrollmentNum: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching attendance for enrollment number:", enrollmentNum);
      
      // First get the student's ID using their enrollment number
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, enrollment_number')
        .eq('enrollment_number', enrollmentNum)
        .maybeSingle();
      
      if (studentError) {
        console.error("Error fetching student profile:", studentError);
        throw studentError;
      }
      
      if (!studentData) {
        console.error("Student record not found for enrollment number:", enrollmentNum);
        throw new Error(`Student record not found for enrollment number: ${enrollmentNum}`);
      }
      
      console.log("Found student ID:", studentData.id);
      setStudentInfo({
        id: studentData.id,
        enrollment_number: studentData.enrollment_number,
        name: studentData.first_name && studentData.last_name 
          ? `${studentData.first_name} ${studentData.last_name}`
          : undefined
      });
      
      // Now fetch attendance records for this student
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('id, date, subject, status')
        .eq('student_id', studentData.id)
        .order('date', { ascending: false });
      
      if (attendanceError) {
        console.error("Error fetching attendance data:", attendanceError);
        throw attendanceError;
      }
      
      console.log("Fetched attendance records:", attendanceData);
      
      // Update state with fetched attendance
      setAttendance(attendanceData || []);
      
      // Calculate statistics
      const present = attendanceData?.filter(record => record.status === 'present').length || 0;
      const total = attendanceData?.length || 0;
      
      // Calculate subject-wise statistics
      const subjectWise: Record<string, { present: number, absent: number, total: number }> = {};
      
      attendanceData?.forEach(record => {
        // Initialize subject if not exists
        if (!subjectWise[record.subject]) {
          subjectWise[record.subject] = { present: 0, absent: 0, total: 0 };
        }
        
        // Increment stats
        subjectWise[record.subject].total++;
        
        if (record.status === 'present') {
          subjectWise[record.subject].present++;
        } else {
          subjectWise[record.subject].absent++;
        }
      });
      
      console.log("Subject-wise attendance stats:", subjectWise);
      
      setStats({
        present,
        absent: total - present,
        total,
        subjectWise
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

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (enrollmentInput.trim()) {
      // Update URL to include the enrollment number
      navigate(`/attendance?enrollment=${enrollmentInput.trim()}`);
      setEnrollmentNumber(enrollmentInput.trim());
    }
  };

  // Data for pie chart
  const chartData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
  ];
  
  const COLORS = ['#22c55e', '#ef4444'];

  const getAttendancePercentage = (present: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardNav />
        <main className="flex-1 container mx-auto p-4 md:p-8">
          <div className="space-y-6">
            <Skeleton className="h-16 w-[300px]" />
            <Skeleton className="h-6 w-[250px]" />
            <div className="grid gap-4 md:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardNav />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Attendance Report
          </h1>
          {studentInfo && (
            <p className="text-lg text-muted-foreground">
              {studentInfo.name && <span className="font-semibold">{studentInfo.name}</span>}
              {studentInfo.name && <span className="mx-2">|</span>}
              <span>Enrollment: {studentInfo.enrollment_number}</span>
            </p>
          )}
        </div>
        
        {!enrollmentNumber && !error && (
          <Card className="border-2 border-dashed shadow-lg animate-fade-in">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Enter Enrollment Number
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={enrollmentInput}
                    onChange={(e) => setEnrollmentInput(e.target.value)}
                    placeholder="Enter your enrollment number"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  View Attendance
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Alert variant="destructive" className="animate-fade-in border-2">
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}
        
        {!error && enrollmentNumber && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                      <p className="text-3xl font-bold">{getAttendancePercentage(stats.present, stats.total)}%</p>
                      {getAttendancePercentage(stats.present, stats.total) < 75 && (
                        <p className="text-xs text-red-500 mt-1">Below 75%</p>
                      )}
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Classes Present</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Classes Absent</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {stats.total === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Calendar className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-xl text-muted-foreground">No attendance data available</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Chart Section */}
                  <Card className="lg:col-span-2 shadow-lg border-2">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        Overall Attendance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
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
                    </CardContent>
                  </Card>

                  {/* Subject Details */}
                  <Card className="shadow-lg border-2">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle>Subject-wise Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {Object.keys(stats.subjectWise).length === 0 ? (
                        <p className="text-muted-foreground text-center py-10">No subject-wise data available</p>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                          {Object.entries(stats.subjectWise).map(([subject, data]) => {
                            const percentage = getAttendancePercentage(data.present, data.total);
                            return (
                              <div key={subject} className="space-y-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm">{subject}</span>
                                  <span className={`text-lg font-bold px-2 py-1 rounded ${
                                    percentage >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Present: {data.present}</span>
                                  <span>Absent: {data.absent}</span>
                                  <span>Total: {data.total}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Records Table */}
                <Card className="shadow-lg border-2">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {attendance.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">No attendance records found</p>
                    ) : (
                      <div className="overflow-auto max-h-[400px] rounded-lg border">
                        <Table>
                          <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                            <TableRow>
                              <TableHead className="font-semibold">Date</TableHead>
                              <TableHead className="font-semibold">Subject</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attendance.map((record) => (
                              <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                                <TableCell>{record.subject}</TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                    record.status === 'present' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {record.status === 'present' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
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
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
