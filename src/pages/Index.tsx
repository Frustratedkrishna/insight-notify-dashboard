
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/f87edee9-06c8-4b4a-9c20-5eefdefe1ada.png" 
              alt="DBIT Logo" 
              className="h-32 w-32"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to DBIT SIMS</h1>
          <p className="text-xl text-gray-600 mb-8">Your Student Information Management System</p>
          <Button onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
