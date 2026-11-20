import Link from "next/link";
import { BookOpen, CalendarCheck2, CalendarDays, FileCheck2, FilePlus2, LineChart as LineChartIcon, UploadCloud, Users } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDashboardMetrics } from "@/features/dashboard/services/overview-service";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listManagedClasses } from "@/features/representative/services/representative-service";

export default async function RepresentativeDashboardPage() {
  const session = await requireRole(["representative"]);
  const [metrics, classes] = await Promise.all([
    getDashboardMetrics(session),
    listManagedClasses(session),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Representative workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Class overview</h2>
        <p className="mt-1 text-sm text-muted">Manage academic resources for your assigned classes.</p>
      </div>

      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {metrics ? (
        <MetricGrid
          metrics={[
            { label: "Assigned classes", value: metrics.classes, icon: Users },
            { label: "Courses", value: metrics.courses, icon: BookOpen },
            { label: "Indexed documents", value: metrics.indexedDocuments, icon: FileCheck2 },
            { label: "Upcoming deadlines", value: metrics.upcomingTasks, icon: CalendarCheck2 },
          ]}
        />
      ) : null}

      <div>
        <p className="mb-2.5 text-sm font-bold">Quick actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: UploadCloud, label: "Manage docs", href: "/representative/documents" },
            { icon: FilePlus2, label: "Create assignment", href: "/representative/assignments" },
            { icon: CalendarDays, label: "Manage timetable", href: "/representative/timetable" },
            { icon: LineChartIcon, label: "Class activity", href: "/representative/notebook" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:border-secondary/50"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-secondary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Your assigned classes</CardTitle>
          <CardDescription>Scope enforced by your representative assignment and RLS</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-sm text-muted">
              No classes assigned yet. An administrator must assign you before you can publish class content.
            </p>
          ) : (
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {classes.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs text-muted">{item.code}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Representative boundaries</CardTitle>
          <CardDescription>Enforced by database policies, not just the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <li>Upload and manage official academic documents</li>
            <li>Add and remove timetable slots for your courses</li>
            <li>Create official assignments and opportunities</li>
            <li>Moderate discussions and mark material for indexing</li>
            <li>View live class activity and engagement counts</li>
            <li>Cannot change roles, classes or another user&apos;s account</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
