
import { Bell } from "lucide-react";

export function NotificationsHeader() {
  return (
    <div className="flex items-center gap-3 border-b pb-4 mb-6">
      <div className="p-2.5 rounded-full bg-red-50">
        <Bell className="h-5 w-5 text-red-600" />
      </div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Notifications & Announcements</h1>
    </div>
  );
}
