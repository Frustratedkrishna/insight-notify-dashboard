
import { NotificationCard } from "@/components/NotificationCard";
import { Notification } from "@/types/supabase";

interface NotificationsListProps {
  notifications: Notification[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          title={notification.title}
          content={notification.content}
          createdAt={notification.created_at}
          type={notification.type}
          department={notification.department}
          semester={notification.semester}
          section={notification.section}
          createdBy={notification.created_by}
        />
      ))}
    </div>
  );
}
