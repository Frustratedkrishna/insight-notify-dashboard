
import { useState, useEffect } from 'react';
import { FacultyProfile } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { fetchAllFacultyProfiles, updateFacultyVerificationStatus } from '@/utils/facultyApprovalUtils';

export function useFacultyApproval() {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<FacultyProfile[]>([]);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFacultyProfiles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllFacultyProfiles();
      setFaculties(data);
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

  useEffect(() => {
    // Initial load of faculty profiles happens when the hook is used
    // but we don't call it here to avoid double loading in components that use useEffect
  }, []);

  return {
    loading,
    faculties,
    processingAction,
    loadFacultyProfiles,
    handleApprove,
    handleRevoke
  };
}
