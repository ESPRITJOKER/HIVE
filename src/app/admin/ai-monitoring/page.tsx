import { Activity, Sparkles, Users } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getAdminOverview, listAiUsage } from "@/features/administrator/services/admin-service";

export default async function AdminAiMonitoringPage() {
  const session = await requireRole(["administrator"]);
  const [usage, overview] = await Promise.all([
    listAiUsage(session),
    getAdminOverview(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="AI usage"
        description="Recorded usage from ai_usage. No AI provider is configured yet, so no new requests are generated."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="glass">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs text-muted">Total requests recorded</p>
              <p className="font-heading text-2xl font-extrabold">{overview.aiRequests}</p>
            </div>
            <Sparkles className="size-5 text-secondary" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs text-muted">Users with usage</p>
              <p className="font-heading text-2xl font-extrabold">{overview.aiUsers}</p>
            </div>
            <Users className="size-5 text-secondary" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Per-user usage</h2>
        {usage.length === 0 ? (
          <EmptyState
            title="No AI usage recorded"
            description="Usage counters appear here once the grounded AI phase is enabled and used."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Requests</th>
                  <th className="px-4 py-3 font-semibold">Active days</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((row) => (
                  <tr key={row.userId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{row.email}</td>
                    <td className="px-4 py-3 tabular-nums">{row.requests}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-secondary" aria-hidden="true" /> Audit events (last 7 days)
          </CardTitle>
          <CardDescription>Sensitive writes recorded by database triggers.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted">
          {overview.auditPoints.reduce((sum, point) => sum + point, 0) === 0
            ? "No sensitive writes have been recorded yet."
            : `${overview.auditPoints.reduce((sum, point) => sum + point, 0)} events recorded across the last seven days.`}
        </CardContent>
      </Card>
    </div>
  );
}
