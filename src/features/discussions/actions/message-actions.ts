"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import { messageSchema } from "@/lib/validations/phase2";
import { postMessage } from "../services/discussion-service";
import type { ActionResult } from "@/features/tasks/actions/task-actions";

/** Posts a discussion message with the author derived from the session. */
export async function postMessageAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid message." };
  }

  const posted = await postMessage(session, parsed.data);
  if (!posted) return { ok: false, message: "That channel is not available to you." };

  revalidatePath("/student/discussions");
  return { ok: true };
}
