
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student, FacultyProfile } from "@/types/supabase";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const ViewStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        // In a real app, this would use the auth token instead of hardcoded ID
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          toast({
            title: "Authentication error",
            description: "Faculty profile not found",
            variant: "destructive",
          });
          return;
        }

        const faculty = JSON.parse(facultyStr);
        
        const { data, error } = await supabase
          .from("faculty_profiles")
          .select("*")
          .eq("employee_id", faculty.employee_id)
          .single();

        if (error) {
          throw error;
        }

        setFacultyProfile(data);
        return data;
      } catch (error) {
        console.error("Error fetching faculty profile:", error);
        toast({
          title: "Error",
          description: "Failed to load faculty profile",
          variant: "destructive",
        });
        return null;
      }
    };

    const fetchStudents = async () => {
      try {
        const faculty = await fetchFacultyProfile();
        
        if (!faculty) return;

        let query = supabase
          .from("profiles")
          .select("*")
          .eq("role", "student");

        // Filter based on faculty role
        if (faculty.role === 'hod' && faculty.department) {
          // HOD can see all students in their department
          query = query.eq("course_name", faculty.department);
        } else if (faculty.role === 'class_coordinator' && faculty.course_name && faculty.year && faculty.section) {
          // Class coordinator can only see students in their specific class
          query = query
            .eq("course_name", faculty.course_name)
            .eq("year", faculty.year)
            .eq("section", faculty.section);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        
        if (data) {
          const formattedStudents: Student[] = data.map(item => ({
            id: item.id,
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            enrollment_number: item.enrollment_number,
            course_name: item.course_name,
            year: item.year,
            section: item.section
          }));
          setStudents(formattedStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to load students data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <FacultyNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mx-auto w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {facultyProfile?.role === 'hod' 
                ? `${facultyProfile.department} Department Students` 
                : facultyProfile?.role === 'class_coordinator'
                ? `${facultyProfile.course_name} Year ${facultyProfile.year} Section ${facultyProfile.section} Students`
                : 'Students List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-center text-gray-500">No students found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.course_name}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.section}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.enrollment_number}</TableCell>
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

export default ViewStudents;
