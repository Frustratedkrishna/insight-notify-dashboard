
import { Bell } from "lucide-react";

export function NotificationsHeader() {
  return (
    <div className="flex items-center gap-3 border-b pb-4 mb-6">
      <div className="p-3 rounded-full bg-red-50">
        <Bell className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Notifications & Announcements</h1>
    </div>
  );
}
