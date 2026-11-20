"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleTaskCompletionAction } from "../actions/task-actions";

export function TaskToggle({
  taskId,
  completed,
  label = "Mark complete",
}: {
  taskId: string;
  completed: boolean;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await toggleTaskCompletionAction({ taskId, completed: !completed });
      if (!result.ok) {
        toast.error(result.message ?? "Could not update this task.");
        return;
      }
      toast.success(completed ? "Marked as incomplete." : "Task completed.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={completed}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors disabled:opacity-60",
        completed
          ? "border-success/50 bg-success/10 text-success"
          : "border-border bg-surface-raised text-foreground hover:bg-border/30",
      )}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {completed ? "Completed" : label}
    </button>
  );
}
