import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';

export default function FacultyDashboard() {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = () => {
      try {
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          console.log("Faculty data not found in localStorage");
          return;
        }
        const facultyData = JSON.parse(facultyStr);
        setFaculty(facultyData);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Faculty!</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {faculty && (
                <>
                  <p>Employee ID: {faculty.employee_id}</p>
                  <p>Name: {faculty.first_name} {faculty.last_name}</p>
                  <p>Role: {faculty.role}</p>
                  {faculty.department && <p>Department: {faculty.department}</p>}
                  {faculty.course_name && <p>Course: {faculty.course_name}</p>}
                  {faculty.year && <p>Year: {faculty.year}</p>}
                  {faculty.section && <p>Section: {faculty.section}</p>}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
