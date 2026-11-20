"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { setDocumentSavedAction } from "../actions/saved-actions";

export function RemoveSavedButton({ documentId }: { documentId: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await setDocumentSavedAction({ documentId, save: false });
      if (!result.ok) {
        toast.error(result.message ?? "Could not remove this resource.");
        return;
      }
      toast.success("Removed from saved resources.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="Remove from saved resources"
      title="Remove from saved resources"
      className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface-raised text-muted transition-colors hover:text-danger disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
