
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
          <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
            <NotificationsError error={error} />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <DashboardNav />
        <main className="flex-1 container mx-auto px-8 py-8 max-w-7xl">
          <div className="grid grid-cols-12 gap-8 h-full">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-fit">
                <div className="p-8 border-b border-gray-100">
                  <NotificationsHeader />
                </div>
                <div className="p-8">
                  {loading ? (
                    <NotificationsLoading />
                  ) : notifications.length === 0 ? (
                    <NotificationsEmpty />
                  ) : (
                    <NotificationsList 
                      notifications={notifications} 
                      className="max-h-[calc(100vh-300px)] overflow-y-auto pr-4 space-y-4"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Info Panel */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Center</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-medium text-blue-900 mb-2">Total Notifications</h4>
                    <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h4 className="font-medium text-green-900 mb-2">Latest Update</h4>
                    <p className="text-sm text-green-700">
                      {notifications.length > 0 
                        ? new Date(notifications[0].created_at).toLocaleDateString()
                        : 'No updates'
                      }
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <p className="text-sm text-gray-600">
                      Click on any notification to view details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
