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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";

interface Mark {
  subject: string;
  marks: number;
  exam_type: string;
}

export default function Marks() {
  const { toast } = useToast();

  const { data: marks, isLoading } = useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("subject, marks, exam_type")
        .order("subject");

      if (error) {
        toast({
          title: "Error fetching marks",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Mark[];
    },
  });

  const processedData = marks?.reduce((acc: any[], mark) => {
    const existingSubject = acc.find((item) => item.subject === mark.subject);
    if (existingSubject) {
      existingSubject[mark.exam_type.replace(" ", "_")] = mark.marks;
    } else {
      acc.push({
        subject: mark.subject,
        [mark.exam_type.replace(" ", "_")]: mark.marks,
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
              <CardTitle>Academic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading marks data...</div>
              ) : (
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      Mid_Term: { color: "#4f46e5" },
                      Final_Term: { color: "#06b6d4" },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <ChartLegend>
                          <ChartLegendContent />
                        </ChartLegend>
                        <Bar dataKey="Mid_Term" fill="var(--color-Mid_Term)" />
                        <Bar dataKey="Final_Term" fill="var(--color-Final_Term)" />
                      </BarChart>
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