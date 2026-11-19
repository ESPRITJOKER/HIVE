import * as React from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-primary/10 p-3 text-secondary">
        <Inbox className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/40 bg-danger/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="rounded-full bg-danger/15 p-3 text-danger">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-muted">{description}</p> : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
