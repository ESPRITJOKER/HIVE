import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listTimetable } from "@/features/timetable/services/timetable-service";
import { WeekTimetable } from "@/features/timetable/components/week-timetable";

export default async function StudentTimetablePage() {
  const session = await requireRole(["student"]);
  const slots = await listTimetable(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Timetable"
        description="Your weekly schedule across all enrolled classes."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <WeekTimetable slots={slots} />
    </div>
  );
}
