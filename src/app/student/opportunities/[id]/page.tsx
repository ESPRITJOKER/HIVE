import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Trophy } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getTask } from "@/features/tasks/services/task-service";
import { isActiveOpportunity } from "@/features/shared/format";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, dueLabel, formatDateTime } from "@/features/shared/format";

export default async function StudentOpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  const task = await getTask(session, id);
  if (!task || !isActiveOpportunity(task)) notFound();

  return (
    <div className="space-y-6">
      <Link href="/student/opportunities" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Opportunities
      </Link>

      <PageHeader
        eyebrow={`${task.courseCode} · ${categoryLabel(task.category)}`}
        title={task.title}
        description={task.description ?? undefined}
        actions={
          <Badge variant="default" className="gap-1">
            <Trophy className="size-3" aria-hidden="true" /> {categoryLabel(task.category)}
          </Badge>
        }
      />

      <Card className="glass">
        <CardHeader>
          <CardTitle>About this opportunity</CardTitle>
          <CardDescription>Posted by your class representative</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-secondary" aria-hidden="true" />
            <span className="text-muted">Deadline:</span>
            <span className="font-medium">{dueLabel(task)}</span>
          </div>
          <p className="text-xs text-muted">Exact time: {formatDateTime(task.dueDate)}</p>
          {task.description ? (
            <p className="whitespace-pre-wrap leading-relaxed text-muted">{task.description}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
