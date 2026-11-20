"use client";

import { Badge } from "@/components/ui/badge";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";

export {
  AssignmentForm,
  LinkDocumentForm,
  ModerationButtons,
  TimetableSlotForm,
  UploadDocumentForm,
} from "./forms";

/** Status is derived from the persisted processing_status, never from a timer. */
export function DocumentStatusBadge({ status }: { status: string }) {
  const variant =
    status === "indexed"
      ? "success"
      : status === "failed"
        ? "danger"
        : status === "uploaded"
          ? "warning"
          : "info";
  return <Badge variant={variant}>{DOCUMENT_STATUS_LABELS[status] ?? status}</Badge>;
}
