
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
