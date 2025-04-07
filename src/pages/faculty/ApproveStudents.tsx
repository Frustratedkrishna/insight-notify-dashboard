
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FacultyProfile } from "@/types/supabase";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  verify: boolean;
  email?: string;
  profile_image_url?: string;
}

const ApproveStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyAndStudents = async () => {
      try {
        // Get faculty profile from localStorage
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          toast({
            title: "Authentication error",
            description: "Faculty profile not found",
            variant: "destructive",
          });
          navigate("/faculty-auth");
          return;
        }

        const faculty = JSON.parse(facultyStr);
        
        if (faculty.role !== 'class_coordinator' && faculty.role !== 'admin') {
          toast({
            title: "Access denied",
            description: "Only class coordinators and admins can access this page",
            variant: "destructive",
          });
          navigate("/faculty/dashboard");
          return;
        }
        
        const { data, error } = await supabase
          .from("faculty_profiles")
          .select("*")
          .eq("employee_id", faculty.employee_id)
          .single();

        if (error) {
          throw error;
        }

        setFacultyProfile(data);
        
        // Fetch students based on role
        let studentsQuery = supabase.from("profiles").select("*");
        
        // If admin, show all students, otherwise filter by class
        if (faculty.role !== 'admin') {
          if (data.course_name && data.year && data.section) {
            studentsQuery = studentsQuery
              .eq("course_name", data.course_name)
              .eq("year", data.year)
              .eq("section", data.section);
          }
        }
        
        const { data: studentsData, error: studentsError } = await studentsQuery
          .order("verify", { ascending: true })
          .order("created_at", { ascending: false });

        if (studentsError) throw studentsError;
        
        setStudents(studentsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyAndStudents();
  }, [toast, navigate]);

  const handleApprove = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verify: true })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Student approved",
        description: "The student can now login to the system",
      });

      // Update local state
      setStudents(students.map(student => 
        student.id === studentId ? { ...student, verify: true } : student
      ));
      
      // Update selected student if it's the one being modified
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({ ...selectedStudent, verify: true });
      }
    } catch (error) {
      console.error("Error approving student:", error);
      toast({
        title: "Error",
        description: "Failed to approve student",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verify: false })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Student verification revoked",
        description: "The student will not be able to login",
      });

      // Update local state
      setStudents(students.map(student => 
        student.id === studentId ? { ...student, verify: false } : student
      ));
      
      // Update selected student if it's the one being modified
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({ ...selectedStudent, verify: false });
      }
    } catch (error) {
      console.error("Error rejecting student:", error);
      toast({
        title: "Error",
        description: "Failed to revoke student verification",
        variant: "destructive",
      });
    }
  };
  
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDialog(true);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {facultyProfile ? 
                facultyProfile.role === 'admin' ? 
                  'Approve Students - All Courses' :
                  `Approve Students - ${facultyProfile.course_name} Year ${facultyProfile.year} Section ${facultyProfile.section}` : 
                'Approve Students'}
            </CardTitle>
            <CardDescription>
              Click on a student's name to view their complete profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-center text-gray-500">No students found for your class.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-normal text-left"
                            onClick={() => handleViewStudent(student)}
                          >
                            {`${student.first_name} ${student.last_name}`}
                          </Button>
                        </TableCell>
                        <TableCell>{student.enrollment_number}</TableCell>
                        <TableCell>{student.course_name}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>
                          {student.verify ? (
                            <Badge className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.verify ? (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleReject(student.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Revoke
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(student.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowStudentDialog(false)}
                className="h-7 w-7"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Student Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage 
                    src={selectedStudent.profile_image_url || ''} 
                    alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`} 
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{`${selectedStudent.first_name} ${selectedStudent.last_name}`}</h3>
                <Badge className={selectedStudent.verify ? "bg-green-500 mt-2" : "bg-red-500 mt-2"}>
                  {selectedStudent.verify ? "Verified" : "Pending Approval"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Enrollment Number</h4>
                  <p>{selectedStudent.enrollment_number}</p>
                </div>
                
                {selectedStudent.email && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p>{selectedStudent.email}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Course</h4>
                  <p>{selectedStudent.course_name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Year</h4>
                  <p>{selectedStudent.year}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Section</h4>
                  <p>{selectedStudent.section}</p>
                </div>
                
                <div className="flex gap-2 justify-center mt-4">
                  {selectedStudent.verify ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleReject(selectedStudent.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Revoke Approval
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      onClick={() => handleApprove(selectedStudent.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}

export default ApproveStudents;
