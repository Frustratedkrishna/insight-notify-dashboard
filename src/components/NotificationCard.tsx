
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
        className="mb-4 transition-all hover:shadow-md cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            {type === "course_specific" && (
              <>
                <span>•</span>
                <span>{department}</span>
                {semester && (
                  <>
                    <span>•</span>
                    <span>
                      {isNaN(Number(semester)) 
                        ? `Section ${semester}` 
                        : `Year ${getYear(semester)}`}
                    </span>
                  </>
                )}
                {section && (
                  <>
                    <span>•</span>
                    <span>Section {section}</span>
                  </>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3">{content}</p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              <span className="block">Posted {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              {createdBy && <span className="block mt-1">Faculty ID: {createdBy}</span>}
              {type === "course_specific" && department && (
                <span className="block mt-1">Department: {department}</span>
              )}
              {semester && (
                <span className="block mt-1">
                  Year: {getYear(semester)}
                </span>
              )}
              {section && (
                <span className="block mt-1">Section: {section}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
