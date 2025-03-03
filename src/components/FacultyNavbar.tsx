
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, Users, Menu, FileSpreadsheet, UserCheck } from "lucide-react";
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
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      localStorage.removeItem('faculty');
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      navigate("/faculty-auth");
    } catch (error: any) {
      console.error("Faculty sign out error:", error);
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const NavContent = () => {
    // Get faculty role from localStorage if not provided as prop
    let facultyRole = role;
    if (!facultyRole) {
      try {
        const facultyStr = localStorage.getItem('faculty');
        if (facultyStr) {
          const faculty = JSON.parse(facultyStr);
          facultyRole = faculty.role;
        }
      } catch (error) {
        console.error("Error getting faculty role:", error);
      }
    }
    
    console.log("Faculty role in navbar:", facultyRole);
    
    return (
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
          onClick={() => navigate("/faculty/addattendance")}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span className="ml-2">Add Attendance</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full md:w-auto justify-start"
          onClick={() => navigate("/faculty/viewstudent")}
        >
          <Users className="h-4 w-4" />
          <span className="ml-2">Students</span>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full md:w-auto justify-start"
          onClick={() => navigate("/faculty/viewfeedbacks")}
        >
          <Users className="h-4 w-4" />
          <span className="ml-2">Feedbacks</span>
        </Button>
        
        {facultyRole === 'class_coordinator' && (
          <Button
            variant="ghost"
            className="w-full md:w-auto justify-start"
            onClick={() => navigate("/faculty/approve-students")}
          >
            <UserCheck className="h-4 w-4" />
            <span className="ml-2">Approve Students</span>
          </Button>
        )}
        
        {(facultyRole === 'class_coordinator' || facultyRole === 'hod') && (
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
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="font-semibold text-primary">Faculty Dashboard</div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background border-l border-accent">
                <div className="font-semibold text-primary text-lg py-4">Menu</div>
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
