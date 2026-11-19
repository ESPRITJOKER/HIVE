import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/15 text-secondary",
        neutral: "border-border bg-surface-raised text-muted",
        success: "border-success/40 bg-success/15 text-success",
        warning: "border-warning/40 bg-warning/15 text-warning",
        danger: "border-danger/40 bg-danger/15 text-danger",
        info: "border-info/40 bg-info/15 text-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
