import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getTask } from "@/features/tasks/services/task-service";
import { TaskToggle } from "@/features/tasks/components/task-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, dueLabel, formatDateTime } from "@/features/shared/format";

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  const task = await getTask(session, id);
  if (!task) notFound();

  return (
    <div className="space-y-6">
      <Link href="/student/assignments" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Assignments
      </Link>

      <PageHeader
        eyebrow={`${task.courseCode} · ${categoryLabel(task.category)}`}
        title={task.title}
        description={task.description ?? undefined}
        actions={<TaskToggle taskId={task.id} completed={task.completed} />}
      />

      <Card className="glass">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Deadline and completion state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-secondary" aria-hidden="true" />
            <span className="text-muted">Due:</span>
            <span className="font-medium">{dueLabel(task)}</span>
          </div>
          <p className="text-xs text-muted">Exact time: {formatDateTime(task.dueDate)}</p>
          {task.attachment ? (
            <p className="rounded-md border border-border bg-surface-raised p-3 text-xs text-muted">
              Attachment reference: <span className="font-mono text-foreground">{task.attachment}</span>
            </p>
          ) : null}
          <Badge variant={task.completed ? "success" : "neutral"}>
            {task.completed ? "Completed" : "Not completed"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
