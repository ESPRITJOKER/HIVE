import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listTimetable } from "@/features/timetable/services/timetable-service";
import { formatTime, groupedSlots, slotTypeLabel, subjectColor } from "@/features/shared/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";

export default async function StudentTimetablePage() {
  const session = await requireRole(["student"]);
  const slots = await listTimetable(session);
  const groups = groupedSlots(slots);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Timetable"
        description="Your weekly schedule across all enrolled classes."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {groups.length === 0 ? (
        <EmptyState
          title="No timetable yet"
          description="Weekly schedule slots will appear here once your representative publishes them."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.day} className="glass">
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 ${subjectColor(slot.subject)}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{slot.subject}</p>
                      <p className="text-xs opacity-80">
                        {slot.courseCode} · {slotTypeLabel(slot.type)}
                        {slot.room ? ` · ${slot.room}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
