"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon rendered inside the field. */
  icon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon: Icon, ...props }, ref) => {
    const field = (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70",
          "transition-colors focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40",
          Icon && "pl-10",
          className,
        )}
        {...props}
      />
    );

    if (!Icon) return field;
    return (
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        {field}
      </div>
    );
  },
);
Input.displayName = "Input";
