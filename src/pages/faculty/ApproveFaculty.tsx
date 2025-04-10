
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
import { fetchAllFacultyProfiles, updateFacultyVerificationStatus } from '@/utils/facultyApprovalUtils';

export default function ApproveFaculty() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if the current user is an admin when component mounts
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
        setLoading(false);
        return;
      }
      
      const faculty = JSON.parse(facultyStr);
      console.log("Faculty from localStorage:", faculty);
      
      if (faculty.role !== 'admin') {
        console.error("Faculty is not admin, role:", faculty.role);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      setIsAdmin(true);
      await loadFacultyProfiles();
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadFacultyProfiles = async () => {
    setLoading(true);
    try {
      const facultyProfiles = await fetchAllFacultyProfiles();
      setFaculties(facultyProfiles);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!id) return;
    
    setProcessingAction(id);
    try {
      const success = await updateFacultyVerificationStatus(id, true);
      
      if (success) {
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
        
        // Refresh data from database to ensure UI is in sync
        await loadFacultyProfiles();
      }
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!id) return;
    
    setProcessingAction(id);
    try {
      const success = await updateFacultyVerificationStatus(id, false);
      
      if (success) {
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
        
        // Refresh data from database to ensure UI is in sync
        await loadFacultyProfiles();
      }
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
