
import { useState, useEffect } from "react";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Announcements() {
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  
  useEffect(() => {
    // Get faculty profile from localStorage
    try {
      const facultyStr = localStorage.getItem('faculty');
      if (facultyStr) {
        const faculty = JSON.parse(facultyStr);
        setFacultyProfile(faculty);
      }
    } catch (error) {
      console.error("Error getting faculty profile:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="container mx-auto p-4 md:p-6">
        <Card className="max-w-4xl mx-auto shadow-sm border-accent/20">
          <CardHeader className="bg-accent/10">
            <CardTitle className="text-primary">Announcements</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p>Announcements functionality will be implemented soon.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
