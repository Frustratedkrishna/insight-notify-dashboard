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
import { useToast } from "@/components/ui/use-toast";

interface AttendanceData {
  subject: string;
  status: string;
}

export default function Attendance() {
  const { toast } = useToast();

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      // First get the profile with enrollment number
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq('enrollment_number', 'abhirajtawar8@gmail.com')
        .single();

      if (profileError) {
        toast({
          title: "Error fetching profile",
          description: profileError.message,
          variant: "destructive",
        });
        throw profileError;
      }

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Then get attendance using the profile id
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

  const COLORS = ["#4f46e5", "#06b6d4", "#10b981"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading attendance data...</div>
              ) : attendance?.length === 0 ? (
                <div>No attendance data available</div>
              ) : (
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
                          outerRadius={80}
                          label
                        >
                          {processedData?.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <ChartLegend>
                          <ChartLegendContent />
                        </ChartLegend>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
}