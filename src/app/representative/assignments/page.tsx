import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { TASK_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/features/shared/format";
import { listAssignments, listCourseOptions } from "@/features/representative/services/representative-service";
import { deleteAssignmentAction } from "@/features/representative/actions/representative-actions";
import { AssignmentForm } from "@/features/representative/components/screens";

export default async function RepresentativeAssignmentsPage() {
  const session = await requireRole(["representative"]);
  const [assignments, courses] = await Promise.all([
    listAssignments(session),
    listCourseOptions(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Assignments & opportunities"
        description="Publish academic tasks and opportunities to the courses you manage."
      />

      <AssignmentForm courses={courses} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Published items</h2>
        {assignments.length === 0 ? (
          <EmptyState title="Nothing published yet" description="Assignments, exams and opportunities will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{assignment.title}</td>
                    <td className="px-4 py-3 text-muted">{assignment.courseCode}</td>
                    <td className="px-4 py-3">
                      <Badge variant={assignment.archived ? "neutral" : "info"}>
                        {TASK_CATEGORY_LABELS[assignment.category] ?? assignment.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(assignment.dueDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmActionButton
                        action={deleteAssignmentAction}
                        input={{ taskId: assignment.id }}
                        label="Delete"
                        variant="ghost"
                        confirm={`Delete "${assignment.title}"?`}
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
