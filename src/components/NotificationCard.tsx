
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  title: string;
  content: string;
  createdAt: string;
  type: string;
  department?: string;
  semester?: string; // Changed from number to string
}

export function NotificationCard({
  title,
  content,
  createdAt,
  type,
  department,
  semester,
}: NotificationCardProps) {
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
    <Card className="mb-4">
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
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  );
}
