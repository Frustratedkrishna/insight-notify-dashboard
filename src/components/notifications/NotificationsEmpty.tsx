
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

export function NotificationsEmpty() {
  return (
    <Card className="p-8 shadow-sm text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Bell className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
      <p className="text-muted-foreground">Check back later for updates and announcements</p>
    </Card>
  );
}
