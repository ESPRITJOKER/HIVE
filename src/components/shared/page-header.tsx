import { cn } from "@/lib/utils";

/** Consistent heading block for authenticated screens. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
