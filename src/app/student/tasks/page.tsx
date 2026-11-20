import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listTasks } from "@/features/tasks/services/task-service";
import { TaskList } from "@/features/tasks/components/task-list";

export default async function StudentTasksPage() {
  const session = await requireRole(["student"]);
  const tasks = await listTasks(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal"
        title="My tasks"
        description="Everything due across your courses, with reminders and private completion tracking."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <TaskList tasks={tasks} title="Tasks" />
    </div>
  );
}
