import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/features/shared/format";
import { listUsers } from "@/features/administrator/services/admin-service";
import { RoleSelect } from "@/features/administrator/components/screens";

export default async function AdminUsersPage() {
  const session = await requireRole(["administrator"]);
  const users = await listUsers(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supervision"
        title="User management"
        description="Accounts and roles across the platform. Role changes are validated, audited and cannot target your own account."
      />

      {users.length === 0 ? (
        <EmptyState title="No accounts yet" description="Registered accounts will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Membership</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{user.fullName}</td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-muted">{user.className}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.membershipStatus === "active" ? "success" : user.membershipStatus === "pending" ? "warning" : "neutral"}>
                      {user.membershipStatus ?? "none"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="w-44">
                      <RoleSelect userId={user.id} role={user.role} currentUserId={session.userId} />
                    </div>
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
