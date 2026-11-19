"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { flattenNavigation } from "./navigation";
import type { Role } from "@/types/domain";

/** Mobile bottom navigation: the first four available routes for the role. */
export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = flattenNavigation(role).filter((entry) => entry.available).slice(0, 4);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-surface-overlay backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-[var(--bottom-nav-height)] grid-cols-4">
        {items.map((entry) => {
          const Icon = entry.icon;
          const active = pathname === entry.href;
          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[10px] font-medium",
                  active ? "text-secondary" : "text-muted",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate px-1">{entry.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
