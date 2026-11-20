import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";

export interface NotificationSummary {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export async function listNotifications(session: SessionContext): Promise<NotificationSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, created_at, read_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];

  return data.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: notification.created_at,
    readAt: notification.read_at,
  }));
}

export async function unreadNotificationCount(session: SessionContext): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.userId)
    .is("read_at", null);
  return error ? 0 : (count ?? 0);
}

/** Only the owner's rows can be updated; RLS enforces the same predicate. */
export async function markNotificationsRead(
  session: SessionContext,
  ids: readonly string[],
  read: boolean,
): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase || ids.length === 0) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("user_id", session.userId)
    .in("id", [...ids]);
  return !error;
}
