"use client";

import { useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setDocumentSavedAction } from "../actions/saved-actions";

export function SaveDocumentButton({
  documentId,
  saved,
}: {
  documentId: string;
  saved: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await setDocumentSavedAction({ documentId, save: !saved });
      if (!result.ok) {
        toast.error(result.message ?? "Could not update saved resources.");
        return;
      }
      toast.success(saved ? "Removed from saved resources." : "Saved for later.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved resources" : "Save resource"}
      title={saved ? "Remove from saved resources" : "Save resource"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border transition-colors disabled:opacity-60",
        saved
          ? "border-accent/60 bg-accent/15 text-accent"
          : "border-border bg-surface-raised text-muted hover:text-foreground",
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : saved ? (
        <BookmarkCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
