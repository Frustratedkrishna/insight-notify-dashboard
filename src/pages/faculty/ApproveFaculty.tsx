
import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FacultyProfile } from '@/types/supabase';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FacultyProfileCard from '@/components/faculty/FacultyProfileCard';
import FacultyTable from '@/components/faculty/FacultyTable';
import { supabase } from '@/integrations/supabase/client';

export default function ApproveFaculty() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load data on component mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const facultyStr = localStorage.getItem('faculty');
      
      if (!facultyStr) {
        console.error("No faculty found in localStorage");
        setIsAdmin(false);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/faculty-auth");
        return;
      }
      
      const faculty = JSON.parse(facultyStr);
      console.log("Faculty from localStorage:", faculty);
      
      if (faculty.role !== 'admin') {
        console.error("Faculty is not admin, role:", faculty.role);
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "Only administrators can access this page",
          variant: "destructive",
        });
        navigate("/faculty/dashboard");
        return;
      }
      
      setIsAdmin(true);
      await loadFacultyProfiles();
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      toast({
        title: "Error",
        description: "Failed to verify administrator privileges",
        variant: "destructive",
      });
      navigate("/faculty/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyProfiles = async () => {
    setLoading(true);
    try {
      console.log("Fetching all faculty profiles...");
      const { data, error } = await supabase
        .from('faculty_profiles')
        .select('*')
        .order('verify', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log("Faculties fetched successfully, count:", data?.length);
      setFaculties(data || []);
    } catch (error) {
      console.error("Error loading faculty profiles:", error);
      toast({
        title: "Data Loading Error",
        description: "Could not load faculty profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid faculty ID",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingAction(id);
    try {
      console.log(`Approving faculty ${id}`);
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: true })
        .eq('id', id);
      
      if (error) {
        console.error("Error approving faculty:", error);
        toast({
          title: "Error",
          description: "Failed to approve faculty member",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Faculty member has been approved",
      });
      
      // Update local state
      setFaculties(prevFaculties => 
        prevFaculties.map(faculty => 
          faculty.id === id ? { ...faculty, verify: true } : faculty
        )
      );
      
      // Update selected faculty if open in dialog
      if (selectedFaculty && selectedFaculty.id === id) {
        setSelectedFaculty({ ...selectedFaculty, verify: true });
      }
      
      // Refresh data to ensure UI is in sync
      await loadFacultyProfiles();
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid faculty ID",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingAction(id);
    try {
      console.log(`Revoking faculty approval ${id}`);
      const { error } = await supabase
        .from('faculty_profiles')
        .update({ verify: false })
        .eq('id', id);
      
      if (error) {
        console.error("Error revoking faculty approval:", error);
        toast({
          title: "Error",
          description: "Failed to revoke faculty member's approval",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Faculty member's approval has been revoked",
      });
      
      // Update local state
      setFaculties(prevFaculties => 
        prevFaculties.map(faculty => 
          faculty.id === id ? { ...faculty, verify: false } : faculty
        )
      );
      
      // Update selected faculty if open in dialog
      if (selectedFaculty && selectedFaculty.id === id) {
        setSelectedFaculty({ ...selectedFaculty, verify: false });
      }
      
      // Refresh data to ensure UI is in sync
      await loadFacultyProfiles();
    } catch (error) {
      console.error("Error in handleRevoke:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewFaculty = (faculty: FacultyProfile) => {
    setSelectedFaculty(faculty);
    setShowFacultyDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <FacultyNavbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading faculty data...</p>
          </div>
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
                onClick={loadFacultyProfiles}
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
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
              <FacultyTable
                faculties={faculties}
                onViewFaculty={handleViewFaculty}
                onApprove={handleApprove}
                onRevoke={handleRevoke}
                processingAction={processingAction}
              />
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
            <FacultyProfileCard 
              faculty={selectedFaculty} 
              onApprove={handleApprove}
              onRevoke={handleRevoke}
              processingAction={processingAction}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
