
import { Clock, LineChart, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0">
      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/dashboard")}
      >
        <User className="h-4 w-4" />
        <span className="ml-2">Dashboard</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/attendance")}
      >
        <Clock className="h-4 w-4" />
        <span className="ml-2">Attendance</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/marks")}
      >
        <LineChart className="h-4 w-4" />
        <span className="ml-2">Marks</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/notifications")}
      >
        <Bell className="h-4 w-4" />
        <span className="ml-2">Notifications</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="ml-2">Sign Out</span>
      </Button>
    </div>
  );
}
