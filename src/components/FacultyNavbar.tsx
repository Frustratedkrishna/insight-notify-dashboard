import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, Calendar, Users, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface FacultyNavbarProps {
  role?: string;
}

export function FacultyNavbar({ role }: FacultyNavbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/faculty-auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const NavContent = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 md:p-0">
      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/faculty/dashboard")}
      >
        <User className="h-4 w-4" />
        <span className="ml-2">Profile</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/faculty/notifications")}
      >
        <Bell className="h-4 w-4" />
        <span className="ml-2">Notifications</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/faculty/attendance")}
      >
        <Calendar className="h-4 w-4" />
        <span className="ml-2">Attendance</span>
      </Button>

      <Button
        variant="ghost"
        className="w-full md:w-auto justify-start"
        onClick={() => navigate("/faculty/viewstudents")}
      >
        <Users className="h-4 w-4" />
        <span className="ml-2">Students</span>
      </Button>

      {(role === 'class_coordinator' || role === 'hod') && (
        <Button
          variant="ghost"
          className="w-full md:w-auto justify-start"
          onClick={() => navigate("/faculty/announcements")}
        >
          <Bell className="h-4 w-4" />
          <span className="ml-2">Announcements</span>
        </Button>
      )}

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

  return (
    <nav className="border-b">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="font-semibold">Faculty Dashboard</div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <NavContent />
              </SheetContent>
            </Sheet>
          ) : (
            <NavContent />
          )}
        </div>
      </div>
    </nav>
  );
}