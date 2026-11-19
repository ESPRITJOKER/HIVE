"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabel } from "@/lib/permissions/roles";
import { signOut } from "@/features/authentication/services/auth-service";
import type { Role } from "@/types/domain";

export function UserMenu({ name, email, role }: { name: string; email: string; role: Role }) {
  const router = useRouter();
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-border bg-surface-raised text-xs font-bold"
          aria-label="Account menu"
        >
          {initials || <UserRound className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
          <span className="block truncate text-xs font-normal text-muted">{email}</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-secondary">
            {roleLabel(role)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound aria-hidden="true" /> Profile & settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          onSelect={async () => {
            await signOut();
            toast.success("Signed out.");
            router.push("/login");
            router.refresh();
          }}
        >
          <LogOut aria-hidden="true" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
