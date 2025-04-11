
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { FacultyProfile } from '@/types/supabase';
import FacultyTable from '@/components/faculty/FacultyTable';
import FacultyDetailDialog from '@/components/faculty/FacultyDetailDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FacultyApprovalManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);
  const [showFacultyDialog, setShowFacultyDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();

  // Load faculty profiles directly without using custom hook
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
        console.error("Error fetching faculties:", error);
        toast({
          title: "Data Loading Error",
          description: "Could not load faculty profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Faculties fetched successfully, count:", data?.length);
      setFaculties(data || []);
    } catch (error: any) {
      console.error("Error in fetchAllFacultyProfiles:", error);
      toast({
        title: "Error",
        description: "Failed to load faculty profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Direct approach for approving faculty
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
      
      const { data, error } = await supabase
        .from('faculty_profiles')
        .update({ verify: true })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Database error when approving faculty:", error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to approve faculty",
          variant: "destructive",
        });
        return;
      }

      console.log("Faculty approval successful:", data);
      toast({
        title: "Success",
        description: "Faculty member has been approved",
      });
      
      // Update local state
      setFaculties(prev => 
        prev.map(faculty => 
          faculty.id === id ? { ...faculty, verify: true } : faculty
        )
      );
    } catch (error: any) {
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

  // Direct approach for revoking faculty
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
      
      const { data, error } = await supabase
        .from('faculty_profiles')
        .update({ verify: false })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Database error when revoking faculty approval:", error);
        toast({
          title: "Database Error",
          description: error.message || "Failed to revoke faculty approval",
          variant: "destructive",
        });
        return;
      }

      console.log("Faculty revocation successful:", data);
      toast({
        title: "Success",
        description: "Faculty member's approval has been revoked",
      });
      
      // Update local state
      setFaculties(prev => 
        prev.map(faculty => 
          faculty.id === id ? { ...faculty, verify: false } : faculty
        )
      );
    } catch (error: any) {
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

  // Load faculty profiles when component mounts
  useEffect(() => {
    loadFacultyProfiles();
  }, []);

  const handleViewFaculty = (faculty: FacultyProfile) => {
    setSelectedFaculty(faculty);
    setShowFacultyDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading faculty data...</p>
      </div>
    );
  }

  return (
    <>
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

      <FacultyDetailDialog
        open={showFacultyDialog}
        onOpenChange={setShowFacultyDialog}
        selectedFaculty={selectedFaculty}
        onApprove={handleApprove}
        onRevoke={handleRevoke}
        processingAction={processingAction}
      />
    </>
  );
};

export default FacultyApprovalManager;
