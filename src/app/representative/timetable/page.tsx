import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/states";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { DAY_LABELS, SLOT_TYPE_LABELS } from "@/lib/constants";
import { formatTime } from "@/features/shared/format";
import { listCourseOptions, listTimetableSlots } from "@/features/representative/services/representative-service";
import { deleteTimetableSlotAction } from "@/features/representative/actions/representative-actions";
import { TimetableSlotForm } from "@/features/representative/components/screens";

export default async function RepresentativeTimetablePage() {
  const session = await requireRole(["representative"]);
  const [slots, courses] = await Promise.all([
    listTimetableSlots(session),
    listCourseOptions(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Timetable"
        description="Add and remove real schedule slots. Changes appear for students in their classes immediately."
      />

      <TimetableSlotForm courses={courses} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Published slots</h2>
        {slots.length === 0 ? (
          <EmptyState title="No slots yet" description="Add a course, day and time above to build the weekly schedule." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Day</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{DAY_LABELS[slot.day] ?? slot.day}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{slot.subject}</p>
                      <p className="text-xs text-muted">{slot.courseCode}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">{formatTime(slot.startTime)}–{formatTime(slot.endTime)}</td>
                    <td className="px-4 py-3 text-muted">{SLOT_TYPE_LABELS[slot.type] ?? slot.type}</td>
                    <td className="px-4 py-3 text-muted">{slot.room ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmActionButton
                        action={deleteTimetableSlotAction}
                        input={{ slotId: slot.id }}
                        label="Delete"
                        variant="ghost"
                        confirm="Remove this timetable slot?"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
