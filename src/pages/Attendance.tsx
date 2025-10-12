import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { Calendar, TrendingUp, CheckCircle2, XCircle } from "lucide-react";

interface AttendanceData {
  subject: string;
  status: string;
}

export default function Attendance() {
  const { toast } = useToast();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq('enrollment_number', 'abhirajtawar8@gmail.com')
        .maybeSingle();

      if (profileError) {
        toast({
          title: "Error fetching profile",
          description: profileError.message,
          variant: "destructive",
        });
        throw profileError;
      }

      if (!profile) {
        toast({
          title: "Profile not found",
          description: "No profile found with the given enrollment number",
          variant: "destructive",
        });
        return [];
      }

      const { data, error } = await supabase
        .from("attendance")
        .select("subject, status")
        .eq('student_id', profile.id);

      if (error) {
        toast({
          title: "Error fetching attendance",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as AttendanceData[];
    },
  });

  const processedData = attendance?.reduce((acc: any[], record) => {
    const existingSubject = acc.find((item) => item.subject === record.subject);
    if (existingSubject) {
      existingSubject.value += record.status === "present" ? 1 : 0;
      existingSubject.total += 1;
    } else {
      acc.push({
        subject: record.subject,
        value: record.status === "present" ? 1 : 0,
        total: 1,
      });
    }
    return acc;
  }, []);

  const totalPresent = attendance?.filter(r => r.status === "present").length || 0;
  const totalAbsent = attendance?.filter(r => r.status === "absent").length || 0;
  const totalClasses = attendance?.length || 0;
  const attendancePercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;

  const COLORS = ["#4f46e5", "#06b6d4", "#10b981"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Attendance Overview
            </h1>
            <p className="text-muted-foreground text-lg">Track your class attendance and performance</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading attendance data...</p>
              </div>
            </div>
          ) : !attendance?.length ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <Calendar className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-xl text-muted-foreground">No attendance data available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                        <p className="text-3xl font-bold">{attendancePercentage}%</p>
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
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalPresent}</p>
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
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalAbsent}</p>
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
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalClasses}</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-lg border-2">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      Subject-wise Attendance Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ChartContainer config={{}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={processedData}
                              dataKey="value"
                              nameKey="subject"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              label={({ subject, value, total }) => 
                                `${subject}: ${((value / total) * 100).toFixed(1)}%`
                              }
                              labelLine={true}
                            >
                              {processedData?.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any, name: any, props: any) => 
                                `${value}/${props.payload.total} classes (${((value / props.payload.total) * 100).toFixed(1)}%)`
                              }
                            />
                            <ChartLegend>
                              <ChartLegendContent />
                            </ChartLegend>
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Details */}
                <Card className="shadow-lg border-2">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Subject Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {processedData?.map((subject: any, index: number) => {
                        const percentage = ((subject.value / subject.total) * 100).toFixed(1);
                        return (
                          <div key={index} className="space-y-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{subject.subject}</span>
                              <span className="text-lg font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Present: {subject.value}</span>
                              <span>Total: {subject.total}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
