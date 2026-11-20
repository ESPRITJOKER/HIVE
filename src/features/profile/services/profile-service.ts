import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { sanitizeText } from "@/lib/validations/common";

export interface ProfileSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  classes: Array<{ id: string; name: string; code: string; status: string }>;
}

export async function getProfile(session: SessionContext): Promise<ProfileSummary | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("class_members")
      .select("class_id, membership_status")
      .eq("user_id", session.userId),
  ]);
  if (!profile) return null;

  const classIds = (memberships ?? []).map((membership) => membership.class_id);
  const { data: classes } = classIds.length > 0
    ? await supabase.from("classes").select("id, name, code").in("id", classIds)
    : { data: [] };
  const classById = new Map((classes ?? []).map((item) => [item.id, item]));

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    createdAt: profile.created_at,
    classes: (memberships ?? []).flatMap((membership) => {
      const item = classById.get(membership.class_id);
      if (!item) return [];
      return [{
        id: item.id,
        name: item.name,
        code: item.code,
        status: membership.membership_status,
      }];
    }),
  };
}

/** Updates only the owner's display name; role changes are blocked by trigger + RLS. */
export async function updateFullName(session: SessionContext, fullName: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const clean = sanitizeText(fullName);
  if (clean.length < 1 || clean.length > 120) return false;

  const { error } = await supabase
    .from("users")
    .update({ full_name: clean })
    .eq("id", session.userId);
  return !error;
}
