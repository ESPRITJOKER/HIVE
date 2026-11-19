import { BookOpen, Building2, ShieldCheck, Users } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDashboardMetrics } from "@/features/dashboard/services/overview-service";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AdminDashboardPage() {
  const session = await requireRole(["administrator"]);
  const metrics = await getDashboardMetrics(session);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Administration</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Platform supervision</h2>
        <p className="mt-1 text-sm text-muted">Signed in as {session.email}</p>
      </div>

      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {metrics ? (
        <MetricGrid
          metrics={[
            { label: "Classes", value: metrics.classes, icon: Building2 },
            { label: "Courses", value: metrics.courses, icon: BookOpen },
            { label: "Students", value: metrics.students ?? 0, icon: Users },
            { label: "Indexed documents", value: metrics.indexedDocuments, icon: ShieldCheck },
          ]}
        />
      ) : null}

      <Card className="glass">
        <CardHeader>
          <CardTitle>Access control</CardTitle>
          <CardDescription>Roles remain strictly separated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted">
            Students cannot reach administrative functions. Representatives can manage only their assigned
            classes and can never gain administrator privileges. Role changes are restricted by database
            policy, audited, and tested with multiple authenticated accounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
