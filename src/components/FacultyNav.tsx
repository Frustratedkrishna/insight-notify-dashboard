import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { FacultySidebar } from "./FacultySidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface FacultyNavProps {
  role?: string;
}

export function FacultyNav({ role }: FacultyNavProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <FacultySidebar role={role} />;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <FacultySidebar role={role} />
      </SheetContent>
    </Sheet>
  );
}