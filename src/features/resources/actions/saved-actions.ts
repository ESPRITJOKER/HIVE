"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import { savedResourceSchema } from "@/lib/validations/phase2";
import { removeSavedDocument, saveDocument } from "../services/saved-resources-service";
import type { ActionResult } from "@/features/tasks/actions/task-actions";

/** Idempotently saves or removes a bookmark for the signed-in student. */
export async function setDocumentSavedAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const parsed = savedResourceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid document reference." };

  const changed = parsed.data.save
    ? await saveDocument(session, parsed.data.documentId)
    : await removeSavedDocument(session, parsed.data.documentId);
  if (!changed) return { ok: false, message: "That document is not available to you." };

  revalidatePath("/student/saved");
  revalidatePath("/student/documents");
  return { ok: true };
}
