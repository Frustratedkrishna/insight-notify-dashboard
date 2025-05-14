
import { Bell } from "lucide-react";

export function NotificationsEmpty() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-10 shadow-sm text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-1">No notifications</h3>
      <p className="text-muted-foreground">Check back later for updates</p>
    </div>
  );
}
