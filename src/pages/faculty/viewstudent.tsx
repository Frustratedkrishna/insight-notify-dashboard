
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/types/supabase";

const ViewStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student");

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
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <>
      <FacultyNavbar />
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
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ViewStudents;
