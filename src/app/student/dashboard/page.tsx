import { BookOpen, CalendarCheck2, FileCheck2, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDashboardMetrics } from "@/features/dashboard/services/overview-service";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";

export default async function StudentDashboardPage() {
  const session = await requireRole(["student"]);
  const metrics = await getDashboardMetrics(session);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Student workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Welcome back, {session.fullName.split(" ")[0]}</h2>
        <p className="mt-1 text-sm text-muted">Here is what is happening across your classes.</p>
      </div>

      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {metrics ? (
        <MetricGrid
          metrics={[
            { label: "My courses", value: metrics.courses, icon: BookOpen },
            { label: "Study documents", value: metrics.indexedDocuments, icon: FileCheck2 },
            { label: "Upcoming deadlines", value: metrics.upcomingTasks, icon: CalendarCheck2 },
            { label: "Classes", value: metrics.classes, icon: Sparkles },
          ]}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Your academic workspace</CardTitle>
            <CardDescription>
              Courses, documents, timetable, assignments and discussions are built on your class data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted">
              This foundation release includes secure sign-in, role-based access, the design system and the
              database schema. Academic modules are delivered in the next implementation phase.
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>HIVE AI</CardTitle>
            <CardDescription>Grounded in your class materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted">
              The assistant will answer only from indexed academic documents and show verifiable source
              citations. If the material is not available, it will say so rather than guess.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
