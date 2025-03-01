import { Bell, CalendarDays, Home, LayoutDashboard, LogOut, User, Book, Code } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { supabase } from "@/integrations/supabase/client"
import { useIsMobile } from "@/hooks/use-mobile"

export function DashboardNav() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Remove user data from localStorage
      localStorage.removeItem('user')
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
      
      navigate("/auth")
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const NavItems = () => (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Dashboard
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/notifications")}
      >
        <Bell className="mr-2 h-4 w-4" />
        Notifications
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/attendance")}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        Attendance
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/marks")}
      >
        <Book className="mr-2 h-4 w-4" />
        Marks
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/developer")}
      >
        <Code className="mr-2 h-4 w-4" />
        Developer
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </>
  )

  return (
    <SidebarProvider>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Home className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <NavItems />
          </SheetContent>
        </Sheet>
      ) : (
        <NavItems />
      )}
    </SidebarProvider>
  )
}
