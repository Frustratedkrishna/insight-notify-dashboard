
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { NotificationsLoading } from "@/components/notifications/NotificationsLoading";
import { NotificationsEmpty } from "@/components/notifications/NotificationsEmpty";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationsError } from "@/components/notifications/NotificationsError";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { Notification } from "@/types/supabase";

interface NotificationsDesktopProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export function NotificationsDesktop({ notifications, loading, error }: NotificationsDesktopProps) {
  if (error) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center mr-4">
              <img 
                src="/lovable-uploads/f87edee9-06c8-4b4a-9c20-5eefdefe1ada.png" 
                alt="DBIT Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="font-semibold">DBIT SIMS</span>
            </div>
            <DashboardSidebar />
          </div>
        </div>
        <main className="flex-1 flex items-center justify-start p-6">
          <NotificationsError error={error} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center mr-4">
            <img 
              src="/lovable-uploads/f87edee9-06c8-4b4a-9c20-5eefdefe1ada.png" 
              alt="DBIT Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="font-semibold">DBIT SIMS</span>
          </div>
          <DashboardSidebar />
        </div>
      </div>
      <main className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <NotificationsHeader />
            </div>
            <div className="p-6">
              {loading ? (
                <NotificationsLoading />
              ) : notifications.length === 0 ? (
                <NotificationsEmpty />
              ) : (
                <NotificationsList 
                  notifications={notifications} 
                  className="space-y-4"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
