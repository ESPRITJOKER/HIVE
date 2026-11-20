import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listTasks } from "@/features/tasks/services/task-service";
import { TaskList } from "@/features/tasks/components/task-list";

export default async function StudentAssignmentsPage() {
  const session = await requireRole(["student"]);
  const allTasks = await listTasks(session);
  const assignments = allTasks.filter(
    (task) => task.category === "assignment" || task.category === "exam",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Assignments & exams"
        description="Track official deadlines. Completion is private to you."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <TaskList tasks={assignments} title="Assignments" />
    </div>
  );
}
