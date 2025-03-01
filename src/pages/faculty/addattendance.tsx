
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { File, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  file: z.any()
    .refine(file => file instanceof File, { message: "File is required" })
    .refine(file => file.size <= 5000000, { message: "File must be less than 5MB" })
    .refine(
      file => [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(file.type),
      { message: "Only Excel files (.xlsx, .xls) are supported" }
    )
});

type FormValues = z.infer<typeof formSchema>;

export default function AddAttendance() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      date: new Date().toISOString().split('T')[0],
      file: undefined
    },
  });

  // Get the currently logged in faculty from localStorage
  useEffect(() => {
    const facultyStr = localStorage.getItem('faculty');
    if (facultyStr) {
      setFacultyProfile(JSON.parse(facultyStr));
    } else {
      navigate("/faculty-auth");
    }
  }, [navigate]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
    }
  };

  // Process Excel data
  const processExcel = async (file: File, subject: string, date: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Process the data
          const processedData = jsonData.map((row: any) => ({
            enrollment_number: row.enrollment_number?.toString() || "",
            status: (row.status?.toString() || "absent").toLowerCase(),
            subject,
            date,
            faculty_id: facultyProfile.id
          }));
          
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Upload attendance data to Supabase
  const uploadAttendanceData = async (data: any[]) => {
    if (!data.length) return;
    
    try {
      // First, get student IDs based on enrollment numbers
      const enrollmentNumbers = [...new Set(data.map(item => item.enrollment_number))];
      
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id, enrollment_number')
        .in('enrollment_number', enrollmentNumbers);
      
      if (studentsError) throw studentsError;
      
      // Create a mapping of enrollment number to student ID
      const studentMap = new Map();
      students?.forEach(student => {
        studentMap.set(student.enrollment_number, student.id);
      });
      
      // Prepare attendance records with student IDs
      const attendanceRecords = data.map(item => {
        const studentId = studentMap.get(item.enrollment_number);
        if (!studentId) {
          console.warn(`No student found with enrollment number: ${item.enrollment_number}`);
          return null;
        }
        
        return {
          student_id: studentId,
          faculty_id: item.faculty_id,
          date: item.date,
          subject: item.subject,
          status: item.status
        };
      }).filter(Boolean);
      
      // Insert attendance records
      if (attendanceRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('attendance')
          .insert(attendanceRecords);
        
        if (insertError) throw insertError;
      }
      
      return attendanceRecords.length;
    } catch (error) {
      console.error("Error in uploadAttendanceData:", error);
      throw error;
    }
  };

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setUploadStatus("uploading");
      setUploadProgress(10);

      if (!facultyProfile?.id) {
        throw new Error("Faculty profile not found");
      }

      const file = values.file as File;
      
      // Process Excel file
      setUploadProgress(30);
      const processedData = await processExcel(file, values.subject, values.date);
      
      // Update progress
      setUploadProgress(60);
      
      // Upload to Supabase
      const recordsUploaded = await uploadAttendanceData(processedData);
      
      setUploadProgress(100);
      setUploadStatus("success");
      
      toast({
        title: "Attendance Upload Successful",
        description: `${recordsUploaded} attendance records uploaded for ${values.subject} on ${values.date}`,
      });
      
      // Reset form
      form.reset({
        subject: "",
        date: new Date().toISOString().split('T')[0],
        file: undefined
      });
      
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="container mx-auto p-4 md:p-6">
        <Card className="max-w-2xl mx-auto shadow-sm border-accent/20">
          <CardHeader className="bg-accent/10">
            <CardTitle className="text-primary flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Attendance Data
            </CardTitle>
            <CardDescription>
              Upload attendance data from an Excel file (.xlsx) for your class. The Excel sheet should include columns for 
              enrollment_number and status (present/absent).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {facultyProfile?.role !== 'class_coordinator' ? (
              <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  Only class coordinators can upload attendance data.
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject name" {...field} className="border-accent/20 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="border-accent/20 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel>Attendance Excel File</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-accent rounded-md p-6 text-center hover:border-primary transition-colors">
                            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Drag and drop your Excel file here, or click to browse
                            </p>
                            <Input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                              className="max-w-xs mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              File should contain columns: enrollment_number, status
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {uploadStatus === "uploading" && (
                    <div className="w-full bg-accent/30 rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }} 
                      />
                    </div>
                  )}
                  
                  {uploadStatus === "success" && (
                    <Alert className="bg-secondary/10 border-secondary">
                      <AlertDescription className="text-secondary-foreground">
                        Attendance data uploaded successfully!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {uploadStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Error uploading attendance data. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Attendance
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
