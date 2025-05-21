
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
        className="transition-all hover:shadow-md cursor-pointer bg-white border-l-4 border-l-red-500 hover:border-l-red-600 group"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base text-gray-800 group-hover:text-red-600 flex items-center gap-2 font-medium">
            <Bell className="h-4 w-4 text-red-500" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
              <CalendarIcon className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
            
            {type === "course_specific" && department && (
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                <GraduationCap className="h-3 w-3" />
                <span>{department}</span>
              </div>
            )}
            
            {semester && !isNaN(Number(semester)) && (
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                <span>Year {getYear(semester)}</span>
              </div>
            )}
            
            {section && (
              <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full">
                <span>Section {section}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="line-clamp-2 text-gray-700 text-sm">{content}</p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white mx-auto left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full fixed">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-3 pb-2 space-y-2 border-b border-gray-100">
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
