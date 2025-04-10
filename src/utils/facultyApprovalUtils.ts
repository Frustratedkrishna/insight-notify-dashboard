
import { supabase } from "@/integrations/supabase/client";
import { FacultyProfile } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Updates a faculty member's verification status in the database
 * This implementation uses direct database calls to ensure reliability
 */
export const updateFacultyVerificationStatus = async (
  facultyId: string, 
  verifyStatus: boolean
): Promise<boolean> => {
  if (!facultyId) {
    console.error("Missing faculty ID");
    toast({
      title: "Error",
      description: "Missing faculty ID",
      variant: "destructive",
    });
    return false;
  }
  
  console.log(`Attempting to update faculty ${facultyId} verification to ${verifyStatus}`);
  
  try {
    // Direct Supabase update with detailed error handling
    const { data, error } = await supabase
      .from('faculty_profiles')
      .update({ verify: verifyStatus })
      .eq('id', facultyId)
      .select();
    
    if (error) {
      console.error("Database error when updating faculty verification:", error);
      toast({
        title: "Database Error",
        description: error.message || "Failed to update faculty verification status",
        variant: "destructive",
      });
      return false;
    }

    if (!data || data.length === 0) {
      console.warn("No faculty record was updated. ID might be invalid:", facultyId);
      toast({
        title: "Update Failed",
        description: "Faculty record could not be found or updated",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Faculty verification status updated successfully:", data);
    return true;
  } catch (error: any) {
    console.error("Unexpected error updating faculty verification:", error);
    toast({
      title: "System Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Fetches all faculty profiles from the database
 */
export const fetchAllFacultyProfiles = async (): Promise<FacultyProfile[]> => {
  try {
    console.log("Fetching all faculty profiles...");
    
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .order('verify', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching faculties:", error);
      throw error;
    }
    
    console.log("Faculties fetched successfully, count:", data?.length);
    return data || [];
  } catch (error: any) {
    console.error("Error in fetchAllFacultyProfiles:", error);
    toast({
      title: "Error",
      description: "Failed to load faculty profiles",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Fetches a single faculty profile by ID
 */
export const fetchFacultyById = async (facultyId: string): Promise<FacultyProfile | null> => {
  if (!facultyId) {
    console.error("Missing faculty ID for fetch");
    return null;
  }
  
  try {
    console.log(`Fetching faculty profile with ID: ${facultyId}`);
    
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('id', facultyId)
      .single();
    
    if (error) {
      console.error("Error fetching faculty:", error);
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in fetchFacultyById:", error);
    return null;
  }
};
