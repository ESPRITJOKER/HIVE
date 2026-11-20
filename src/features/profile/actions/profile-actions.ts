"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import { profileUpdateSchema } from "@/lib/validations/phase2";
import { updateFullName } from "../services/profile-service";
import type { ActionResult } from "@/features/tasks/actions/task-actions";

/** Updates the viewer's own display name only — never a role or email. */
export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const updated = await updateFullName(session, parsed.data.fullName);
  if (!updated) return { ok: false, message: "Could not save your profile." };

  revalidatePath("/student/profile");
  revalidatePath("/student/settings");
  revalidatePath("/student/dashboard");
  return { ok: true, message: "Profile updated." };
}
