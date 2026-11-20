"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import {
  classSchema,
  membershipDecisionSchema,
  representativeAssignmentSchema,
  systemSettingsSchema,
  userRoleSchema,
} from "@/lib/validations/phase3";
import {
  createClass,
  setMembershipStatus,
  setRepresentativeAssignment,
  updateUserRole,
} from "../services/admin-service";
import { saveSystemSettings } from "../services/platform-settings-service";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

function revalidateAdmin(paths: string[]): void {
  for (const path of paths) revalidatePath(path);
}

export async function updateUserRoleAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["administrator"]);
  const parsed = userRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid role change." };

  const updated = await updateUserRole(session, parsed.data);
  if (!updated) {
    return {
      ok: false,
      message: "Role change refused: you cannot change your own role or demote the last administrator.",
    };
  }
  revalidateAdmin(["/admin/users", "/admin/dashboard"]);
  return { ok: true };
}

export async function createClassAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["administrator"]);
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid class details." };

  const created = await createClass(session, parsed.data);
  if (!created) return { ok: false, message: "A class with that code may already exist." };
  revalidateAdmin(["/admin/classes", "/admin/dashboard"]);
  return { ok: true };
}

export async function setMembershipStatusAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["administrator"]);
  const parsed = membershipDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid membership decision." };

  const updated = await setMembershipStatus(session, parsed.data);
  if (!updated) return { ok: false, message: "That membership could not be updated." };
  revalidateAdmin(["/admin/classes", "/admin/users", "/representative/class"]);
  return { ok: true };
}

export async function setRepresentativeAssignmentAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["administrator"]);
  const parsed = representativeAssignmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid representative assignment." };

  const updated = await setRepresentativeAssignment(session, parsed.data);
  if (!updated) {
    return { ok: false, message: "Only existing representatives can be assigned to a class." };
  }
  revalidateAdmin(["/admin/classes", "/admin/users", "/representative/dashboard"]);
  return { ok: true };
}

export async function saveSystemSettingsAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["administrator"]);
  const parsed = systemSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid settings." };

  const saved = await saveSystemSettings(session, parsed.data);
  if (!saved) return { ok: false, message: "Settings could not be persisted to the database." };
  revalidateAdmin(["/admin/settings", "/representative/documents"]);
  return { ok: true };
}
