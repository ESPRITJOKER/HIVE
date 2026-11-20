import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/features/shared/format";
import {
  listClasses,
  listMemberships,
  listRepresentativeAssignments,
  listUsers,
} from "@/features/administrator/services/admin-service";
import {
  AssignRepresentativeForm,
  ClassForm,
  MembershipControls,
  RemoveRepresentativeButton,
} from "@/features/administrator/components/screens";

export default async function AdminClassesPage() {
  const session = await requireRole(["administrator"]);
  const [classes, memberships, assignments, users] = await Promise.all([
    listClasses(session),
    listMemberships(session),
    listRepresentativeAssignments(session),
    listUsers(session),
  ]);

  const representatives = users
    .filter((user) => user.role === "representative")
    .map((user) => ({ id: user.id, label: `${user.fullName} (${user.email})` }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supervision"
        title="Classes & membership"
        description="Create classes, decide membership requests and assign representatives. All writes are administrator-only and audited."
      />

      <ClassForm />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Classes</h2>
        {classes.length === 0 ? (
          <EmptyState title="No classes yet" description="Create the first class with the form above." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted">{item.code}</p>
                <p className="mt-2 text-xs text-muted">{item.students} students · {item.representatives} representatives</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Membership requests</h2>
        {memberships.length === 0 ? (
          <EmptyState title="No memberships" description="Join requests from students will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Requested</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Decision</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{membership.userName}</p>
                      <p className="text-xs text-muted">{membership.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{membership.className}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(membership.joinedAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={membership.status === "active" ? "success" : membership.status === "pending" ? "warning" : "neutral"}>
                        {membership.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><MembershipControls membershipId={membership.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Representative assignments</h2>
        <AssignRepresentativeForm representatives={representatives} classes={classes} />
        {assignments.length === 0 ? (
          <EmptyState title="No representatives assigned" description="Assign a representative to give them class-scoped management access." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Representative</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{assignment.userName}</p>
                      <p className="text-xs text-muted">{assignment.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{assignment.className}</td>
                    <td className="px-4 py-3 text-right">
                      <RemoveRepresentativeButton userId={assignment.userId} classId={assignment.classId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
