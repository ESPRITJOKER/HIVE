import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/permissions/guards";

export default async function RepresentativeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["representative"]);
  return (
    <AppShell
      role="representative"
      user={{ name: session.fullName, email: session.email }}
      title="Representative workspace"
    >
      {children}
    </AppShell>
  );
}
