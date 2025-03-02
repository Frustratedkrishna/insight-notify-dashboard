
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FacultyProfile } from "@/types/supabase";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_number: string;
  course_name: string;
  year: number;
  section: string;
  verify: boolean;
}

const ApproveStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
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
        
        if (faculty.role !== 'class_coordinator') {
          toast({
            title: "Access denied",
            description: "Only class coordinators can access this page",
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
        
        // Fetch pending students for this class coordinator
        if (data.course_name && data.year && data.section) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("profiles")
            .select("*")
            .eq("course_name", data.course_name)
            .eq("year", data.year)
            .eq("section", data.section)
            .order("verify", { ascending: true })
            .order("created_at", { ascending: false });

          if (studentsError) throw studentsError;
          
          setStudents(studentsData || []);
        }
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
    } catch (error) {
      console.error("Error rejecting student:", error);
      toast({
        title: "Error",
        description: "Failed to revoke student verification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {facultyProfile ? 
                `Approve Students - ${facultyProfile.course_name} Year ${facultyProfile.year} Section ${facultyProfile.section}` : 
                'Approve Students'}
            </CardTitle>
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
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
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
      <Footer />
    </div>
  );
};

export default ApproveStudents;
