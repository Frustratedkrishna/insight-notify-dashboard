
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, TrendingUp, TrendingDown, Award, BookOpen, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";

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

export default function Marks() {
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
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardNav />
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Student Marks
            </h1>
            <p className="text-muted-foreground text-lg">Search and view your academic performance</p>
          </div>

          {/* Search Card */}
          <Card className="border-2 shadow-lg animate-fade-in">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Student Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Enter your enrollment number"
                  value={searchEnrollment}
                  onChange={(e) => setSearchEnrollment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-12 text-base border-2 focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleSearch} disabled={isLoading} size="lg" className="gap-2 min-w-[120px]">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="border-2 animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-lg text-muted-foreground">Searching for marks...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-2 border-red-200 animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <XCircle className="h-16 w-16 text-red-500" />
                <p className="text-lg text-red-600">Error loading marks data</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {marksData && marksData.length === 0 && searchQuery && (
            <Card className="border-2 border-dashed animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-xl font-semibold text-muted-foreground">No marks found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No records found for enrollment number: <span className="font-mono font-semibold">{searchQuery}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {marksData && marksData.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              {marksData.map((record) => (
                <Card key={record.id} className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Header with Student Info */}
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{record.student_name}</CardTitle>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{record.batch.course_name}</span>
                          </div>
                          <span>•</span>
                          <span>Section {record.batch.section}</span>
                          <span>•</span>
                          <span>Year {record.batch.year}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          <FileText className="h-3 w-3" />
                          {record.batch.exam_type}
                        </div>
                      </div>
                      
                      {/* Result Status Card */}
                      <div className={`p-4 rounded-lg border-2 ${
                        record.result_status === "PASS"
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : record.result_status === "FAIL"
                          ? "border-red-500 bg-red-50 dark:bg-red-950"
                          : "border-orange-500 bg-orange-50 dark:bg-orange-950"
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {record.result_status === "PASS" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                          <span className={`font-bold text-lg ${
                            record.result_status === "PASS"
                              ? "text-green-700 dark:text-green-300"
                              : record.result_status === "FAIL"
                              ? "text-red-700 dark:text-red-300"
                              : "text-orange-700 dark:text-orange-300"
                          }`}>
                            {record.result_status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total Marks:</span>
                            <span className="font-bold">{record.total_marks}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Percentage:</span>
                            <span className="font-bold">{record.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Subject-wise Marks */}
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Subject-wise Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {Object.entries(record.subject_marks).map(([subject, marks]) => {
                        const status = getSubjectMarkStatus(marks, record.batch.minimum_marks);
                        return (
                          <div
                            key={subject}
                            className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                              status === "pass"
                                ? "border-green-500 bg-green-50 dark:bg-green-950/30 hover:shadow-green-200 dark:hover:shadow-green-900"
                                : "border-red-500 bg-red-50 dark:bg-red-950/30 hover:shadow-red-200 dark:hover:shadow-red-900"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-sm">{subject}</span>
                              {status === "pass" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className={`text-3xl font-bold ${
                                status === "pass" 
                                  ? "text-green-700 dark:text-green-300" 
                                  : "text-red-700 dark:text-red-300"
                              }`}>
                                {marks}
                              </span>
                              <span className="text-sm text-muted-foreground">/ 100</span>
                            </div>
                            {status === "fail" && (
                              <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Re-examination required (Min: {record.batch.minimum_marks})
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Footer Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                      <Calendar className="h-4 w-4" />
                      <span>Published on: {new Date(record.batch.upload_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
