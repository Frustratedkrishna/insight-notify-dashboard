
import { supabase } from "@/integrations/supabase/client";
import { FacultyProfile } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

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

/**
 * Updates the registration access settings
 */
export const updateRegistrationAccess = async (
  allowFacultyRegistration: boolean,
  allowStudentRegistration: boolean
): Promise<boolean> => {
  try {
    console.log("Updating registration access settings:", { 
      allowFacultyRegistration, 
      allowStudentRegistration 
    });
    
    // We need to use the correct table name 'system_settings' but with a special approach
    // since it's not in the TypeScript types yet
    const { error } = await supabase
      .from('system_settings' as any)
      .upsert({
        id: 'registration_settings',
        allow_faculty_registration: allowFacultyRegistration,
        allow_student_registration: allowStudentRegistration,
        updated_at: new Date().toISOString()
      } as any);
    
    if (error) {
      console.error("Error updating registration settings:", error);
      toast({
        title: "Error",
        description: "Failed to update registration settings",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Registration settings updated successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error in updateRegistrationAccess:", error);
    toast({
      title: "Error",
      description: "Failed to update registration settings",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Fetches the current registration access settings
 */
export const fetchRegistrationSettings = async (): Promise<{
  allowFacultyRegistration: boolean;
  allowStudentRegistration: boolean;
}> => {
  try {
    // We need to use the correct table name 'system_settings' but with a special approach
    // since it's not in the TypeScript types yet
    const { data, error } = await supabase
      .from('system_settings' as any)
      .select('*')
      .eq('id', 'registration_settings')
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching registration settings:", error);
      return {
        allowFacultyRegistration: true,
        allowStudentRegistration: true
      };
    }
    
    // If no settings found, default to allowing registration
    if (!data) {
      return {
        allowFacultyRegistration: true,
        allowStudentRegistration: true
      };
    }
    
    // Use TypeScript type assertion to access the properties
    const settingsData = data as any;
    
    return {
      allowFacultyRegistration: settingsData.allow_faculty_registration,
      allowStudentRegistration: settingsData.allow_student_registration
    };
  } catch (error: any) {
    console.error("Error in fetchRegistrationSettings:", error);
    // Default to allowing registration if there's an error
    return {
      allowFacultyRegistration: true,
      allowStudentRegistration: true
    };
  }
};
