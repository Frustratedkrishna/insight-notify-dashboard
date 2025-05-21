
import { NotificationCard } from "@/components/NotificationCard";
import { Notification } from "@/types/supabase";

interface NotificationsListProps {
  notifications: Notification[];
  className?: string;
}

export function NotificationsList({ notifications, className = "" }: NotificationsListProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
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
