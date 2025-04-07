
import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FacultyProfile } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApproveFaculty() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          setIsAdmin(false);
          return;
        }
        
        const faculty = JSON.parse(facultyStr);
        if (faculty.role !== 'admin') {
          setIsAdmin(false);
          return;
        }
        
        setIsAdmin(true);
        fetchFaculties();
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculty_profiles')
        .select('*')
        .order('verify', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast({
        title: "Error",
        description: "Failed to load faculty profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: true })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Faculty member has been approved",
      });
      
      // Update local state
      setFaculties(faculties.map(faculty => 
        faculty.id === id ? { ...faculty, verify: true } : faculty
      ));
    } catch (error) {
      console.error("Error approving faculty:", error);
      toast({
        title: "Error",
        description: "Failed to approve faculty member",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: false })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Faculty member's approval has been revoked",
      });
      
      // Update local state
      setFaculties(faculties.map(faculty => 
        faculty.id === id ? { ...faculty, verify: false } : faculty
      ));
    } catch (error) {
      console.error("Error revoking faculty approval:", error);
      toast({
        title: "Error",
        description: "Failed to revoke faculty member's approval",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <FacultyNavbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <FacultyNavbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You do not have permission to view this page.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate("/faculty/dashboard")}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar role="admin" />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Approve Faculty Members</span>
              <Button 
                size="sm"
                onClick={fetchFaculties}
                variant="outline"
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faculties.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No faculty profiles found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell>{`${faculty.first_name} ${faculty.last_name}`}</TableCell>
                      <TableCell>{faculty.employee_id}</TableCell>
                      <TableCell>{faculty.role}</TableCell>
                      <TableCell>
                        {faculty.verify ? (
                          <Badge className="bg-green-500">Approved</Badge>
                        ) : (
                          <Badge variant="destructive">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {faculty.role !== 'admin' && (
                          faculty.verify ? (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRevoke(faculty.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Revoke
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(faculty.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
