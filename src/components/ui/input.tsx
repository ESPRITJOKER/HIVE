"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
