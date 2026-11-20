import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Rotating accent tints so a row of metrics reads as a set, not four clones. */
const TINTS = [
  "bg-primary/12 text-secondary",
  "bg-accent/15 text-accent",
  "bg-info/12 text-info",
  "bg-success/12 text-success",
] as const;

export function MetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: number | string; icon: LucideIcon }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }, i) => (
        <Card key={label} className="p-5 transition-colors hover:border-secondary/40">
          <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-3xl font-extrabold tabular-nums">{value}</p>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", TINTS[i % TINTS.length])}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        </Card>
      ))}
    </div>
  );
}
