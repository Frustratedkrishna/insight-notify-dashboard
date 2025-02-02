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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("attendance")
        .select("subject, status")
        .eq('student_id', user.id);

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

  const processedData = attendance?.reduce((acc: any, record) => {
    const key = `${record.subject}-${record.status}`;
    const existingRecord = acc.find((item: any) => item.name === key);
    if (existingRecord) {
      existingRecord.value += 1;
    } else {
      acc.push({
        name: key,
        value: 1,
        color: record.status === "present" ? "#22c55e" : "#ef4444",
      });
    }
    return acc;
  }, []);

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
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          label
                        >
                          {processedData?.map((entry: any, index: number) => (
                            <Cell key={index} fill={entry.color} />
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