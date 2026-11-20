"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import { notificationUpdateSchema } from "@/lib/validations/phase2";
import { listNotifications, markNotificationsRead } from "../services/notification-service";
import type { ActionResult } from "@/features/tasks/actions/task-actions";

/** Marks an explicit set of the viewer's notifications read/unread. */
export async function setNotificationsReadAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const parsed = notificationUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid notification selection." };

  const updated = await markNotificationsRead(session, parsed.data.ids, parsed.data.read);
  if (!updated) return { ok: false, message: "Could not update notifications." };

  revalidatePath("/student/notifications");
  revalidatePath("/student/dashboard");
  return { ok: true };
}

/** Marks every notification currently visible to the viewer as read. */
export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await requireRole(["student"]);
  const notifications = await listNotifications(session);
  const unread = notifications.filter((notification) => !notification.readAt).map((notification) => notification.id);
  if (unread.length === 0) return { ok: true };

  const updated = await markNotificationsRead(session, unread, true);
  if (!updated) return { ok: false, message: "Could not update notifications." };

  revalidatePath("/student/notifications");
  revalidatePath("/student/dashboard");
  return { ok: true };
}
