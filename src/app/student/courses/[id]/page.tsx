import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getCourseDetail } from "@/features/courses/services/course-service";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { DAY_LABELS } from "@/lib/constants";
import { formatTime, slotTypeLabel } from "@/features/shared/format";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  const course = await getCourseDetail(session, id);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link href="/student/courses" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> All courses
      </Link>

      <PageHeader
        eyebrow={course.classCode ? `${course.classCode} · ${course.className ?? ""}` : "Course"}
        title={course.title}
        description={course.description ?? undefined}
        actions={<Badge variant="info">{course.code}</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-secondary" aria-hidden="true" />
              Documents
            </CardTitle>
            <CardDescription>Material published for this course</CardDescription>
          </CardHeader>
          <CardContent>
            {course.documents.length === 0 ? (
              <EmptyState title="No documents yet" description="Documents for this course will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {course.documents.map((document) => (
                  <li key={document.id} className="py-2.5">
                    <Link href={`/student/documents/${document.id}`} className="text-sm font-medium hover:underline">
                      {document.title}
                    </Link>
                    <p className="text-xs text-muted">{document.processingStatus}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Weekly timetable slots for this course</CardDescription>
          </CardHeader>
          <CardContent>
            {course.slots.length === 0 ? (
              <EmptyState title="No schedule yet" description="Timetable slots will appear here once published." />
            ) : (
              <ul className="divide-y divide-border">
                {course.slots.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{slot.subject}</p>
                      <p className="text-xs text-muted">{slotTypeLabel(slot.type)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{DAY_LABELS[slot.day] ?? slot.day}</p>
                      <p className="text-xs text-muted">
                        {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
