"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ActionResult = { ok: boolean; message?: string };

/**
 * Calls a Server Action after an optional confirmation. Success/error feedback
 * comes only from the action's real result — never from an optimistic fake.
 */
export function ConfirmActionButton({
  action,
  input,
  label,
  pendingLabel = "Working…",
  confirm,
  variant = "outline",
  size = "sm",
  disabled = false,
  title,
}: {
  action: (input: unknown) => Promise<ActionResult>;
  input: unknown;
  label: string;
  pendingLabel?: string;
  confirm?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  title?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (confirm && !window.confirm(confirm)) return;
    startTransition(async () => {
      const result = await action(input);
      if (!result.ok) {
        toast.error(result.message ?? "The operation could not be completed.");
        return;
      }
      toast.success("Saved.");
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={pending || disabled}
      title={title ?? label}
      aria-label={label}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}
