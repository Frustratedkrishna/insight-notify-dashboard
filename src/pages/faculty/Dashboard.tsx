
import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { FacultyProfile } from '@/types/supabase';

export default function FacultyDashboard() {
  const [faculty, setFaculty] = useState<FacultyProfile | null>(null);
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
        
        // Log faculty data to help with debugging
        console.log("Faculty data loaded:", facultyData);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar role={faculty?.role} />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {faculty?.first_name} {faculty?.last_name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faculty && (
                <>
                  <p className="text-gray-700"><span className="font-medium">Employee ID:</span> {faculty.employee_id}</p>
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {faculty.first_name} {faculty.last_name}</p>
                  <p className="text-gray-700"><span className="font-medium">Role:</span> {faculty.role}</p>
                  {faculty.department && <p className="text-gray-700"><span className="font-medium">Department:</span> {faculty.department}</p>}
                  {faculty.course_name && <p className="text-gray-700"><span className="font-medium">Course:</span> {faculty.course_name}</p>}
                  {faculty.year && <p className="text-gray-700"><span className="font-medium">Year:</span> {faculty.year}</p>}
                  {faculty.section && <p className="text-gray-700"><span className="font-medium">Section:</span> {faculty.section}</p>}
                  <p className="text-gray-700"><span className="font-medium">Verified:</span> {faculty.verify ? "Yes" : "No"}</p>
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
