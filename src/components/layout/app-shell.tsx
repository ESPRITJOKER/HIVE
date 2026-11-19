import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { UserMenu } from "./user-menu";
import type { Role } from "@/types/domain";

/** Shared authenticated layout shell. Role-specific pages provide their own content. */
export function AppShell({
  role,
  user,
  title,
  children,
}: {
  role: Role;
  user: { name: string; email: string };
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar role={role} />

      <div className="lg:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center justify-between gap-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate font-heading text-base font-bold sm:text-lg">{title}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} role={role} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-[calc(var(--bottom-nav-height)+1.5rem)] pt-6 sm:px-6 lg:pb-10">
          {children}
        </main>
      </div>

      <BottomNav role={role} />
    </div>
  );
}
