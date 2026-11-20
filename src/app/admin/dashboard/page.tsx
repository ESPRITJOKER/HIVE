import Link from "next/link";
import { BookOpen, Building2, ShieldCheck, Users, Activity } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDashboardMetrics } from "@/features/dashboard/services/overview-service";
import { MetricGrid } from "@/features/dashboard/components/metric-grid";
import { AreaChart } from "@/components/shared/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import { getAdminOverview } from "@/features/administrator/services/admin-service";

export default async function AdminDashboardPage() {
  const session = await requireRole(["administrator"]);
  const [metrics, overview] = await Promise.all([
    getDashboardMetrics(session),
    getAdminOverview(session),
  ]);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-4 text-secondary" aria-hidden="true" /> Sensitive writes
            </CardTitle>
            <CardDescription>Audited events in the last seven days</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.hasData ? <AreaChart points={overview.auditPoints} /> : (
              <p className="py-10 text-center text-sm text-muted">No audited writes recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Accounts by role</CardTitle>
            <CardDescription>Read from the users table, not seeded data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Students", overview.roleCounts.student],
              ["Representatives", overview.roleCounts.representative],
              ["Administrators", overview.roleCounts.administrator],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-semibold tabular-nums">{value}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted">
              {Object.entries(overview.documentsByStatus)
                .map(([status, count]) => `${DOCUMENT_STATUS_LABELS[status] ?? status}: ${count}`)
                .join(" · ") || "No documents recorded."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Access control</CardTitle>
          <CardDescription>Roles remain strictly separated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Students cannot reach administrative functions. Representatives can manage only their assigned
            classes and can never gain administrator privileges. Role changes are restricted by database
            policy, audited, and guarded against self-promotion and demoting the last administrator.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-secondary">
            <Link href="/admin/users" className="hover:underline">Manage users →</Link>
            <Link href="/admin/classes" className="hover:underline">Classes &amp; membership →</Link>
            <Link href="/admin/audit" className="hover:underline">Audit logs →</Link>
            <Link href="/admin/settings" className="hover:underline">Settings →</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
