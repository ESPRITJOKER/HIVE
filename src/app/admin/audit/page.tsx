import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/ui/states";
import { formatDateTime } from "@/features/shared/format";
import { listAuditLogs } from "@/features/administrator/services/admin-service";

export default async function AdminAuditPage() {
  const session = await requireRole(["administrator"]);
  const logs = await listAuditLogs(session, 200);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Audit logs"
        description="Append-only record of sensitive writes. The database rejects any update or deletion of these rows."
      />

      {logs.length === 0 ? (
        <EmptyState
          title="No audit events yet"
          description="Role changes, document writes, timetable changes, assignments and representative assignments are logged here."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Actor</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Resource</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{log.actor}</td>
                  <td className="px-4 py-3"><code className="text-xs">{log.action}</code></td>
                  <td className="px-4 py-3 text-muted">
                    {log.resourceType}
                    {log.resourceId ? <span className="block truncate text-[10px]">{log.resourceId}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
