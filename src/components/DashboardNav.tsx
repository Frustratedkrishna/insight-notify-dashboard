
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardNav() {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center mr-4">
            <img 
              src="/lovable-uploads/f87edee9-06c8-4b4a-9c20-5eefdefe1ada.png" 
              alt="DBIT Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="font-semibold">DBIT SIMS</span>
          </div>
          <DashboardSidebar />
        </div>
      </nav>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden bg-yellow-100 text-red-600 hover:bg-yellow-200">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex items-center p-4 border-b">
          <img 
            src="/lovable-uploads/f87edee9-06c8-4b4a-9c20-5eefdefe1ada.png" 
            alt="DBIT Logo" 
            className="h-8 w-8 mr-2"
          />
          <span className="font-semibold">DBIT SIMS</span>
        </div>
        <DashboardSidebar />
      </SheetContent>
    </Sheet>
  );
}
