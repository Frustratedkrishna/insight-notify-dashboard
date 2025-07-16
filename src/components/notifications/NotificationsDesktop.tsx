
import { DashboardNav } from "@/components/DashboardNav";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardNav />
          <main className="flex-1 flex items-center justify-center p-6">
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
        <main className="flex-1 flex justify-center p-6">
          <div className="w-full max-w-4xl">
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
    </SidebarProvider>
  );
}
