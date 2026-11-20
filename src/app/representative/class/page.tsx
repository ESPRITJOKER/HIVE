import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { listManagedClasses, listStudents } from "@/features/representative/services/representative-service";

export default async function RepresentativeClassPage() {
  const session = await requireRole(["representative"]);
  const [students, classes] = await Promise.all([
    listStudents(session),
    listManagedClasses(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Class overview"
        description="Students and membership state for the classes you are assigned to. Membership decisions are administrator-only."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Assigned classes</h2>
        {classes.length === 0 ? (
          <EmptyState
            title="No assigned classes"
            description="An administrator must assign you to a class before you can manage its content."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted">{item.code}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Students</h2>
        {students.length === 0 ? (
          <EmptyState title="No students yet" description="Members will appear once they join one of your classes." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={`${student.id}-${student.className}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{student.fullName}</td>
                    <td className="px-4 py-3 text-muted">{student.email}</td>
                    <td className="px-4 py-3 text-muted">{student.className}</td>
                    <td className="px-4 py-3">
                      <Badge variant={student.status === "active" ? "success" : student.status === "pending" ? "warning" : "neutral"}>
                        {student.status}
                      </Badge>
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
