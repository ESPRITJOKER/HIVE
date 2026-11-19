"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "./navigation";
import type { Role } from "@/types/domain";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col border-r border-border/60 bg-surface/60 backdrop-blur-xl lg:flex">
      <div className="flex h-[var(--topbar-height)] items-center gap-2.5 border-b border-border/60 px-5">
        <div className="grid size-8 place-items-center rounded-lg bg-primary text-white">
          <GraduationCap className="size-4" aria-hidden="true" />
        </div>
        <span className="font-heading text-lg font-extrabold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Sidebar">
        {NAVIGATION[role].map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((entry) => {
                const active = pathname === entry.href;
                const Icon = entry.icon;
                const content = (
                  <>
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{entry.label}</span>
                    {!entry.available ? (
                      <span className="ml-auto text-[9px] font-semibold uppercase text-muted/70">Soon</span>
                    ) : null}
                  </>
                );

                return (
                  <li key={entry.href}>
                    {entry.available ? (
                      <Link
                        href={entry.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary/15 font-semibold text-secondary"
                            : "text-muted hover:bg-surface-raised hover:text-foreground",
                        )}
                      >
                        {content}
                      </Link>
                    ) : (
                      <span
                        aria-disabled="true"
                        title="Available in an upcoming implementation phase"
                        className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted/50"
                      >
                        {content}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-4">
        <p className="text-[11px] leading-relaxed text-muted">
          Learn Together. Grow Smarter.
        </p>
      </div>
    </aside>
  );
}
