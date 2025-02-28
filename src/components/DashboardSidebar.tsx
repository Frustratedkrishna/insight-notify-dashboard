
import { Clock, LineChart, Bell, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function DashboardSidebar() {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      // Use window.location to ensure full page refresh
      window.location.href = "/auth";
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
      <Link to="/dashboard" className="w-full md:w-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          type="button"
        >
          <User className="h-4 w-4" />
          <span className="ml-2">Dashboard</span>
        </Button>
      </Link>

      <Link to="/attendance" className="w-full md:w-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          type="button"
        >
          <Clock className="h-4 w-4" />
          <span className="ml-2">Attendance</span>
        </Button>
      </Link>

      <Link to="/marks" className="w-full md:w-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          type="button"
        >
          <LineChart className="h-4 w-4" />
          <span className="ml-2">Marks</span>
        </Button>
      </Link>

      <Link to="/notifications" className="w-full md:w-auto">
        <Button
          variant="ghost"
          className="w-full justify-start"
          type="button"
        >
          <Bell className="h-4 w-4" />
          <span className="ml-2">Notifications</span>
        </Button>
      </Link>

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
