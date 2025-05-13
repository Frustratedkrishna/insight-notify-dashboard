
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, CalendarIcon, GraduationCap, UserRound } from "lucide-react";

interface NotificationCardProps {
  title: string;
  content: string;
  createdAt: string;
  type: string;
  department?: string;
  semester?: string;
  section?: string;
  createdBy?: string;
}

export function NotificationCard({
  title,
  content,
  createdAt,
  type,
  department,
  semester,
  section,
  createdBy,
}: NotificationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Calculate year from semester - handle both numeric and string sections
  const getYear = (semester: string | undefined): number => {
    if (!semester) return 0;
    
    // If it's a number like "1", "2", etc., use the formula
    if (!isNaN(Number(semester))) {
      return Math.ceil(Number(semester) / 2);
    }
    
    // If it's a section like "A", "B", etc., return 1 as default
    return 1;
  };

  return (
    <>
      <Card 
        className="transition-all hover:shadow-md cursor-pointer border-gray-200 hover:border-red-200 group bg-white"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900 group-hover:text-red-600">{title}</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
            
            {type === "course_specific" && department && (
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{department}</span>
              </div>
            )}
            
            {semester && !isNaN(Number(semester)) && (
              <div className="flex items-center gap-1 text-emerald-600">
                <span>Year {getYear(semester)}</span>
              </div>
            )}
            
            {section && (
              <div className="flex items-center gap-1 text-blue-600">
                <span>Section {section}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-gray-700">{content}</p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2 space-y-1">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
              
              {createdBy && (
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span>Faculty ID: {createdBy}</span>
                </div>
              )}
              
              {type === "course_specific" && department && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Department: {department}</span>
                </div>
              )}
              
              {semester && !isNaN(Number(semester)) && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Year: {getYear(semester)}</span>
                </div>
              )}
              
              {section && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Section: {section}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 px-1">
            <p className="whitespace-pre-wrap text-gray-700">{content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
