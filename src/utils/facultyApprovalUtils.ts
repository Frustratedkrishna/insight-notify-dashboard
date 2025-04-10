
import { supabase } from "@/integrations/supabase/client";
import { FacultyProfile } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Updates a faculty member's verification status in the database
 */
export const updateFacultyVerificationStatus = async (
  facultyId: string, 
  verifyStatus: boolean
): Promise<boolean> => {
  try {
    console.log(`Updating faculty ${facultyId} verification status to ${verifyStatus}`);
    
    // Validate the input parameters
    if (!facultyId) {
      console.error("Missing faculty ID");
      throw new Error("Missing faculty ID");
    }
    
    // Perform the database update with explicit logging
    const { data, error } = await supabase
      .from('faculty_profiles')
      .update({ verify: verifyStatus })
      .eq('id', facultyId)
      .select();
    
    if (error) {
      console.error("Database error when updating faculty verification:", error);
      throw error;
    }
    
    // Log the response to help debug
    console.log("Update response:", data);
    
    if (!data || data.length === 0) {
      console.warn("No rows were updated, possibly due to permissions or missing record");
      return false;
    }
    
    console.log("Faculty verification status updated successfully");
    return true;
  } catch (error: any) {
    console.error("Error updating faculty verification status:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to update faculty verification status",
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
  try {
    console.log(`Fetching faculty profile with ID: ${facultyId}`);
    
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('id', facultyId)
      .single();
    
    if (error) {
      console.error("Error fetching faculty:", error);
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error in fetchFacultyById:", error);
    return null;
  }
};
