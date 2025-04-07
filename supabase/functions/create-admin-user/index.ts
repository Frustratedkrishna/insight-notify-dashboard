
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('employee_id', 'dbitsimsadmin@donboscoitggsipu.org')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for admin:', checkError);
      throw new Error(`Error checking for admin: ${checkError.message}`);
    }
    
    if (existingAdmin) {
      console.log("Admin account already exists, returning existing account");
      
      // Ensure admin is always verified
      if (existingAdmin.verify !== true) {
        const { error: updateError } = await supabase
          .from('faculty_profiles')
          .update({ verify: true })
          .eq('id', existingAdmin.id);
          
        if (updateError) {
          console.error('Error updating admin verification status:', updateError);
        } else {
          console.log('Updated admin verification status to true');
          existingAdmin.verify = true;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Admin account already exists", 
        admin: existingAdmin 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    console.log("Creating new admin account...");
    
    // Create admin account with proper verification
    const { data: admin, error: insertError } = await supabase
      .from('faculty_profiles')
      .insert([{
        employee_id: 'dbitsimsadmin@donboscoitggsipu.org',
        password: 'DBITSIMSADMIN7011',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        verify: true
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating admin:', insertError);
      throw new Error(`Error creating admin: ${insertError.message}`);
    }
    
    console.log("Admin account created successfully:", admin);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin account created successfully", 
      admin 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-admin-user function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
