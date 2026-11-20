import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listNotifications } from "@/features/notifications/services/notification-service";
import { NotificationList } from "@/features/notifications/components/notification-list";

export default async function StudentNotificationsPage() {
  const session = await requireRole(["student"]);
  const notifications = await listNotifications(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Announcements and alerts from your classes."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <NotificationList initial={notifications} />
    </div>
  );
}
