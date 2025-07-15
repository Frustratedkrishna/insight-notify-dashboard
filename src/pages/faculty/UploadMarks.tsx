
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import * as XLSX from "xlsx";

interface ExcelRow {
  enrollment_number: string;
  student_name: string;
  [key: string]: string | number;
}

interface ParsedMarksData {
  enrollment_number: string;
  student_name: string;
  subject_marks: Record<string, number>;
  total_marks: number;
  percentage: number;
  result_status: string;
}

export default function UploadMarks() {
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState("");
  const [minimumMarks, setMinimumMarks] = useState(40);
  const [previewData, setPreviewData] = useState<ParsedMarksData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get faculty profile
  const { data: facultyProfile } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: async () => {
      const faculty = localStorage.getItem('faculty');
      if (!faculty) throw new Error("No faculty data found");
      
      const facultyData = JSON.parse(faculty);
      const { data, error } = await supabase
        .from("faculty_profiles")
        .select("*")
        .eq("employee_id", facultyData.employee_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const uploadMarksMutation = useMutation({
    mutationFn: async (marksData: ParsedMarksData[]) => {
      if (!facultyProfile) throw new Error("Faculty profile not found");

      // Create marks batch
      const { data: batch, error: batchError } = await supabase
        .from("marks_batches")
        .insert({
          faculty_id: facultyProfile.id,
          course_name: facultyProfile.course_name!,
          section: facultyProfile.section!,
          year: facultyProfile.year!,
          exam_type: examType,
          minimum_marks: minimumMarks,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Insert student marks
      const studentMarksData = marksData.map(mark => ({
        batch_id: batch.id,
        enrollment_number: mark.enrollment_number,
        student_name: mark.student_name,
        subject_marks: mark.subject_marks,
        total_marks: mark.total_marks,
        percentage: mark.percentage,
        result_status: mark.result_status,
      }));

      const { error: marksError } = await supabase
        .from("student_marks")
        .insert(studentMarksData);

      if (marksError) throw marksError;

      return batch;
    },
    onSuccess: () => {
      toast({
        title: "Marks uploaded successfully",
        description: "Student marks have been uploaded and are now available for students to view",
      });
      queryClient.invalidateQueries({ queryKey: ["marks-batches"] });
      setFile(null);
      setPreviewData([]);
      setExamType("");
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading marks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

      const parsedData: ParsedMarksData[] = jsonData.map((row) => {
        const enrollmentNumber = String(row.enrollment_number || "").trim();
        const studentName = String(row.student_name || row.name || "").trim();
        
        // Extract subject marks (all columns that aren't enrollment_number or student_name)
        const subjectMarks: Record<string, number> = {};
        let totalMarks = 0;
        let subjectCount = 0;

        Object.entries(row).forEach(([key, value]) => {
          if (key !== "enrollment_number" && key !== "student_name" && key !== "name") {
            const marks = Number(value) || 0;
            subjectMarks[key] = marks;
            totalMarks += marks;
            subjectCount++;
          }
        });

        const percentage = subjectCount > 0 ? (totalMarks / (subjectCount * 100)) * 100 : 0;
        
        // Determine result status based on minimum marks
        const hasFailedSubject = Object.values(subjectMarks).some(marks => marks < minimumMarks);
        const resultStatus = hasFailedSubject ? "RE_EXAMINATION" : "PASS";

        return {
          enrollment_number: enrollmentNumber,
          student_name: studentName,
          subject_marks: subjectMarks,
          total_marks: totalMarks,
          percentage: Math.round(percentage * 100) / 100,
          result_status: resultStatus,
        };
      });

      setPreviewData(parsedData);
      toast({
        title: "File parsed successfully",
        description: `${parsedData.length} student records found`,
      });
    } catch (error) {
      toast({
        title: "Error parsing file",
        description: "Please check the file format and try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = () => {
    if (!examType) {
      toast({
        title: "Please select exam type",
        variant: "destructive",
      });
      return;
    }

    if (previewData.length === 0) {
      toast({
        title: "No data to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMarksMutation.mutate(previewData);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <FacultyNavbar />
        <main className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Student Marks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mid Term">Mid Term</SelectItem>
                      <SelectItem value="Final Term">Final Term</SelectItem>
                      <SelectItem value="Internal Assessment">Internal Assessment</SelectItem>
                      <SelectItem value="Unit Test">Unit Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumMarks">Minimum Marks</Label>
                  <Input
                    id="minimumMarks"
                    type="number"
                    value={minimumMarks}
                    onChange={(e) => setMinimumMarks(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Excel File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an Excel file with columns: enrollment_number, student_name, and subject columns
                </p>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Processing file...</p>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preview ({previewData.length} students)</h3>
                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <div className="grid gap-2 p-4">
                      {previewData.slice(0, 5).map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{student.student_name}</p>
                            <p className="text-sm text-muted-foreground">{student.enrollment_number}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {student.result_status === "PASS" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                student.result_status === "PASS" ? "text-green-600" : "text-red-600"
                              }`}>
                                {student.result_status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student.total_marks} ({student.percentage}%)
                            </p>
                          </div>
                        </div>
                      ))}
                      {previewData.length > 5 && (
                        <p className="text-center text-muted-foreground">
                          ... and {previewData.length - 5} more students
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleUpload}
                    disabled={uploadMarksMutation.isPending}
                    className="w-full"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {uploadMarksMutation.isPending ? "Uploading..." : "Upload Marks"}
                  </Button>
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
