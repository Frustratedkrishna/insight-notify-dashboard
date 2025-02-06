import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, BookOpen, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

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

  const navItems = [
    {
      icon: <User className="h-4 w-4" />,
      label: "Profile",
      href: "/dashboard",
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: "Marks",
      href: "/marks",
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Attendance",
      href: "/attendance",
    },
  ];

  return (
    <div className="flex h-14 items-center gap-4 md:gap-6">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className="h-8 w-full justify-start md:w-auto"
          onClick={() => navigate(item.href)}
        >
          {item.icon}
          <span className="ml-2">{item.label}</span>
        </Button>
      ))}
      <Button
        variant="ghost"
        className="h-8 w-full justify-start md:w-auto"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="ml-2">Sign Out</span>
      </Button>
    </div>
  );
}