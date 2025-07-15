
import { DashboardNav } from "@/components/DashboardNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationsLoading } from "@/components/notifications/NotificationsLoading";
import { NotificationsEmpty } from "@/components/notifications/NotificationsEmpty";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationsError } from "@/components/notifications/NotificationsError";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { Notification } from "@/types/supabase";

interface NotificationsMobileProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export function NotificationsMobile({ notifications, loading, error }: NotificationsMobileProps) {
  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardNav />
          <main className="flex-1 p-4">
            <NotificationsError error={error} />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardNav />
        <main className="flex-1 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <NotificationsHeader />
            </div>
            <div className="p-4">
              {loading ? (
                <NotificationsLoading />
              ) : notifications.length === 0 ? (
                <NotificationsEmpty />
              ) : (
                <NotificationsList 
                  notifications={notifications} 
                  className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
