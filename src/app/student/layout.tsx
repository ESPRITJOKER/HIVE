import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/permissions/guards";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["student"]);
  return (
    <AppShell
      role="student"
      user={{ name: session.fullName, email: session.email }}
      title="Student workspace"
    >
      {children}
    </AppShell>
  );
}
