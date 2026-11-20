import Link from "next/link";
import { ArrowUpRight, Bell, BookOpen, CalendarClock, FileText, Trophy } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { getStudentDashboardData } from "@/features/dashboard/services/student-dashboard-service";
import { formatDateTime } from "@/features/shared/format";
import { PageHeader } from "@/components/shared/page-header";

export default async function StudentDashboardPage() {
  const session = await requireRole(["student"]);
  const data = await getStudentDashboardData(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student workspace"
        title={`Welcome back, ${session.fullName.split(" ")[0]}`}
        description="Here is what is happening across your classes."
        actions={
          <Link
            href="/student/notifications"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-3 py-2 text-xs font-semibold hover:bg-border/30"
          >
            <Bell className="size-4" aria-hidden="true" />
            Notifications
            {data && data.unreadCount > 0 ? (
              <Badge variant="danger">{data.unreadCount}</Badge>
            ) : null}
          </Link>
        }
      />

      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {data ? (
        <>
          <MetricGrid
            metrics={[
              { label: "My courses", value: data.courseCount, icon: BookOpen },
              { label: "Study documents", value: data.documents.length, icon: FileText },
              { label: "Upcoming deadlines", value: data.upcomingCount, icon: CalendarClock },
              { label: "Unread alerts", value: data.unreadCount, icon: Bell },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>Upcoming deadlines</CardTitle>
                  <CardDescription>Assignments and exams from your courses</CardDescription>
                </div>
                <Link
                  href="/student/assignments"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                >
                  All <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {data.deadlines.length === 0 ? (
                  <p className="text-sm text-muted">No upcoming deadlines. You are all caught up.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.deadlines.map((task) => (
                      <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted">{task.courseCode}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-secondary">
                          {formatDateTime(task.dueDate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>Recent documents</CardTitle>
                  <CardDescription>Latest material from your classes</CardDescription>
                </div>
                <Link
                  href="/student/documents"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                >
                  All <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {data.documents.length === 0 ? (
                  <p className="text-sm text-muted">No documents have been published yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.documents.map((document) => (
                      <li key={document.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <Link href={`/student/documents/${document.id}`} className="truncate text-sm font-medium hover:underline">
                            {document.title}
                          </Link>
                          <p className="text-xs text-muted">{document.courseCode}</p>
                        </div>
                        <Badge variant={document.status === "indexed" ? "success" : "warning"}>
                          {document.status === "indexed" ? "Ready" : document.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {data.opportunities.length > 0 ? (
            <Card className="glass">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="size-5 text-secondary" aria-hidden="true" />
                    Opportunities
                  </CardTitle>
                  <CardDescription>Hackathons, internships, scholarships and events</CardDescription>
                </div>
                <Link
                  href="/student/opportunities"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                >
                  Explore <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {data.opportunities.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/student/opportunities/${item.id}`}
                        className="block rounded-md border border-border bg-surface-raised p-3 text-sm font-medium hover:bg-border/30"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
