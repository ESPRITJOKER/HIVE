import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MetricGrid({ metrics }: { metrics: Array<{ label: string; value: number | string; icon: LucideIcon }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
            <Icon className="size-4 text-secondary" aria-hidden="true" />
          </div>
          <p className="font-heading text-3xl font-extrabold tabular-nums">{value}</p>
        </Card>
      ))}
    </div>
  );
}
