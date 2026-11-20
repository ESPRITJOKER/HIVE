"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import { taskStateSchema } from "@/lib/validations/phase2";
import { setTaskCompletion } from "../services/task-service";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/** Toggles only the signed-in student's own completion row. */
export async function toggleTaskCompletionAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const parsed = taskStateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid task reference." };

  const updated = await setTaskCompletion(session, parsed.data);
  if (!updated) return { ok: false, message: "That task is not available to you." };

  revalidatePath("/student/assignments");
  revalidatePath("/student/tasks");
  revalidatePath("/student/dashboard");
  return { ok: true };
}
