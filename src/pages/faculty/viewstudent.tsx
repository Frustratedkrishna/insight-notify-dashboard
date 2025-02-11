// src/components/ViewStudents.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Student {
  id: string;
  first_name: string;
  email: string;
  enrollment_number: string;
  course_name: string;
  year: string;
  section: string;
  role: string;
  department: string;
}

const ViewStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userDepartment, setUserDepartment] = useState<string>("");
  const [userCourse, setUserCourse] = useState<string>("");
  const [userYear, setUserYear] = useState<string>("");
  const [userSection, setUserSection] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: userData, error: userError } = await supabase
        .from("faculty_profiles")
        .select("role, department, course_name, year, section")
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        return;
      }

      setUserRole(userData.role);
      setUserDepartment(userData.department);
      setUserCourse(userData.course_name);
      setUserYear(userData.year);
      setUserSection(userData.section);

      let query = supabase.from("profiles").select("*");
      
      if (["admin", "director", "chairman", "dean"].includes(userData.role)) {
        // Admin, Director, Chairman, and Dean can see all students
      } else if (userData.role === "hod") {
        query = query.eq("department", userData.department);
      } else if (userData.role === "classcoordinator") {
        query = query.eq("course_name", userData.course_name)
                      .eq("year", userData.year)
                      .eq("section", userData.section);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data as Student[]);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  return (
    <Card className="mx-auto w-full max-w-4xl mt-10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Students List</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-500">No students found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Enrollment No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.first_name}</TableCell>
                  <TableCell>{student.course_name}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{student.enrollment_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewStudents;