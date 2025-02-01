import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface NotificationCardProps {
  title: string;
  content: string;
  createdAt: string;
  type: string;
  department?: string;
  semester?: number;
}

export function NotificationCard({
  title,
  content,
  createdAt,
  type,
  department,
  semester,
}: NotificationCardProps) {
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
              <span>•</span>
              <span>Year {Math.ceil((semester || 0) / 2)}</span>
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