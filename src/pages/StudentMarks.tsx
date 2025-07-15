
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentMarkData {
  id: string;
  enrollment_number: string;
  student_name: string;
  subject_marks: Record<string, number>;
  total_marks: number;
  percentage: number;
  result_status: string;
  batch: {
    exam_type: string;
    minimum_marks: number;
    course_name: string;
    section: string;
    year: number;
    upload_date: string;
  };
}

export default function StudentMarks() {
  const [searchEnrollment, setSearchEnrollment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: marksData, isLoading, error } = useQuery({
    queryKey: ["student-marks", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      const { data, error } = await supabase
        .from("student_marks")
        .select(`
          *,
          batch:marks_batches (
            exam_type,
            minimum_marks,
            course_name,
            section,
            year,
            upload_date
          )
        `)
        .eq("enrollment_number", searchQuery)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching marks",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as StudentMarkData[];
    },
    enabled: !!searchQuery,
  });

  const handleSearch = () => {
    if (!searchEnrollment.trim()) {
      toast({
        title: "Please enter enrollment number",
        description: "Enrollment number is required to search marks",
        variant: "destructive",
      });
      return;
    }
    setSearchQuery(searchEnrollment.trim());
  };

  const getSubjectMarkStatus = (marks: number, minimumMarks: number) => {
    return marks >= minimumMarks ? "pass" : "fail";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <DashboardNav />
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Student Marks Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Enter your enrollment number"
                  value={searchEnrollment}
                  onChange={(e) => setSearchEnrollment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Searching for marks...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-600">
                  <p>Error loading marks data</p>
                </div>
              )}

              {marksData && marksData.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No marks found for enrollment number: {searchQuery}
                  </p>
                </div>
              )}

              {marksData && marksData.length > 0 && (
                <div className="space-y-6">
                  {marksData.map((record) => (
                    <Card key={record.id} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {record.student_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {record.batch.course_name} - {record.batch.section} (Year {record.batch.year})
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {record.batch.exam_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {record.result_status === "PASS" ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`font-bold ${
                                record.result_status === "PASS" 
                                  ? "text-green-600" 
                                  : record.result_status === "FAIL"
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}>
                                {record.result_status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Total: {record.total_marks} ({record.percentage}%)
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {Object.entries(record.subject_marks).map(([subject, marks]) => {
                            const status = getSubjectMarkStatus(marks, record.batch.minimum_marks);
                            return (
                              <div 
                                key={subject}
                                className={`p-3 rounded-lg border ${
                                  status === "pass" 
                                    ? "border-green-200 bg-green-50" 
                                    : "border-red-200 bg-red-50"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{subject}</span>
                                  <span className={`font-bold ${
                                    status === "pass" ? "text-green-700" : "text-red-700"
                                  }`}>
                                    {marks}
                                  </span>
                                </div>
                                {status === "fail" && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Re-examination required (Min: {record.batch.minimum_marks})
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Published on: {new Date(record.batch.upload_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
