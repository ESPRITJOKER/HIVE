import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/permissions/guards";

export default async function AdministratorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["administrator"]);
  return (
    <AppShell
      role="administrator"
      user={{ name: session.fullName, email: session.email }}
      title="Administration"
    >
      {children}
    </AppShell>
  );
}
