import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FacultyProfile } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ApproveFaculty() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
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
      
      console.log("Fetched faculties:", data);
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
      setProcessingAction(id);
      
      console.log(`Approving faculty with ID: ${id}`);
      
      // Use the update method with a simple condition instead of upsert
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: true })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating faculty:", error);
        throw error;
      }
      
      // Fetch the updated faculty to reflect changes in the UI
      const { data: updatedFaculty, error: fetchError } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching updated faculty:", fetchError);
        throw fetchError;
      }
      
      console.log("Updated faculty:", updatedFaculty);
      
      // Update was successful
      toast({
        title: "Success",
        description: "Faculty member has been approved",
      });
      
      // Update local state with the fetched updated faculty
      setFaculties(prevFaculties => 
        prevFaculties.map(faculty => 
          faculty.id === id ? updatedFaculty : faculty
        )
      );
      
      // Update selected faculty if it's the one being modified
      if (selectedFaculty && selectedFaculty.id === id) {
        setSelectedFaculty(updatedFaculty);
      }
    } catch (error: any) {
      console.error("Error approving faculty:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve faculty member",
        variant: "destructive",
      });
      
      // Always refresh the faculties list to ensure UI is in sync with database
      fetchFaculties();
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      setProcessingAction(id);
      
      console.log(`Revoking approval for faculty with ID: ${id}`);
      
      // Use the update method with a simple condition instead of upsert
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: false })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating faculty:", error);
        throw error;
      }
      
      // Fetch the updated faculty to reflect changes in the UI
      const { data: updatedFaculty, error: fetchError } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching updated faculty:", fetchError);
        throw fetchError;
      }
      
      console.log("Updated faculty:", updatedFaculty);
      
      // Update was successful
      toast({
        title: "Success",
        description: "Faculty member's approval has been revoked",
      });
      
      // Update local state with the fetched updated faculty
      setFaculties(prevFaculties => 
        prevFaculties.map(faculty => 
          faculty.id === id ? updatedFaculty : faculty
        )
      );
      
      // Update selected faculty if it's the one being modified
      if (selectedFaculty && selectedFaculty.id === id) {
        setSelectedFaculty(updatedFaculty);
      }
    } catch (error: any) {
      console.error("Error revoking faculty approval:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke faculty member's approval",
        variant: "destructive",
      });
      
      // Always refresh the faculties list to ensure UI is in sync with database
      fetchFaculties();
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewFaculty = (faculty: FacultyProfile) => {
    setSelectedFaculty(faculty);
    setShowFacultyDialog(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'chairman':
        return 'Chairman';
      case 'director':
        return 'Director';
      case 'hod':
        return 'Head of Department';
      case 'class_coordinator':
        return 'Class Coordinator';
      default:
        return role;
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
            <CardDescription>
              Click on a faculty member's name to view their complete profile
            </CardDescription>
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
                      <TableCell>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-normal text-left"
                          onClick={() => handleViewFaculty(faculty)}
                        >
                          {`${faculty.first_name} ${faculty.last_name}`}
                        </Button>
                      </TableCell>
                      <TableCell>{faculty.employee_id}</TableCell>
                      <TableCell>{getRoleDisplay(faculty.role)}</TableCell>
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
                              disabled={processingAction === faculty.id}
                            >
                              {processingAction === faculty.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Revoke
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApprove(faculty.id)}
                              disabled={processingAction === faculty.id}
                            >
                              {processingAction === faculty.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
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
      
      <Dialog open={showFacultyDialog} onOpenChange={setShowFacultyDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowFacultyDialog(false)}
                className="h-7 w-7"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Faculty Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedFaculty && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage 
                    src={selectedFaculty.profile_image_url || ''} 
                    alt={`${selectedFaculty.first_name} ${selectedFaculty.last_name}`} 
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(selectedFaculty.first_name, selectedFaculty.last_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{`${selectedFaculty.first_name} ${selectedFaculty.last_name}`}</h3>
                <Badge className={selectedFaculty.verify ? "bg-green-500 mt-2" : "bg-red-500 mt-2"}>
                  {selectedFaculty.verify ? "Approved" : "Pending Approval"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Employee ID</h4>
                  <p>{selectedFaculty.employee_id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p>{getRoleDisplay(selectedFaculty.role)}</p>
                </div>
                
                {selectedFaculty.department && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Department</h4>
                    <p>{selectedFaculty.department}</p>
                  </div>
                )}
                
                {selectedFaculty.course_name && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Course</h4>
                    <p>{selectedFaculty.course_name}</p>
                  </div>
                )}
                
                {selectedFaculty.year && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Year</h4>
                    <p>{selectedFaculty.year}</p>
                  </div>
                )}
                
                {selectedFaculty.section && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Section</h4>
                    <p>{selectedFaculty.section}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Account Created</h4>
                  <p>{new Date(selectedFaculty.created_at).toLocaleString()}</p>
                </div>
                
                <div className="flex gap-2 justify-center mt-4">
                  {selectedFaculty.role !== 'admin' && (
                    selectedFaculty.verify ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleRevoke(selectedFaculty.id)}
                        disabled={processingAction === selectedFaculty.id}
                      >
                        {processingAction === selectedFaculty.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Revoke Approval
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        onClick={() => handleApprove(selectedFaculty.id)}
                        disabled={processingAction === selectedFaculty.id}
                      >
                        {processingAction === selectedFaculty.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    )
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
