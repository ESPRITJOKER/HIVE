import { BookOpen, FileCheck2, Users, CalendarCheck2 } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDashboardMetrics } from "@/features/dashboard/services/overview-service";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";

export default async function RepresentativeDashboardPage() {
  const session = await requireRole(["representative"]);
  const metrics = await getDashboardMetrics(session);

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

      <Card className="glass">
        <CardHeader>
          <CardTitle>Representative responsibilities</CardTitle>
          <CardDescription>Enforced by database policies, not just the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <li>Upload and manage official academic documents</li>
            <li>Review and publish the timetable</li>
            <li>Create and edit official assignments</li>
            <li>Moderate discussions and index useful explanations</li>
            <li>Generate shared revision sheets and quizzes</li>
            <li>Approve class membership requests</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
