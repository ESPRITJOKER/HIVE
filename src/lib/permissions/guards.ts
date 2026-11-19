import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { HOME_PATH, type Permission, hasPermission } from "./roles";
import type { Role } from "@/types/domain";

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  classIds: string[];
  assignedClassIds: string[];
}

/**
 * Resolves the current user from the database-backed profile.
 * Role is read from the `users` table — never from client-supplied metadata.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const [memberships, assignments] = await Promise.all([
    supabase
      .from("class_members")
      .select("class_id")
      .eq("user_id", user.id)
      .eq("membership_status", "active"),
    supabase.from("representative_assignments").select("class_id").eq("user_id", user.id),
  ]);

  return {
    userId: user.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    classIds: memberships.data?.map((m) => m.class_id) ?? [],
    assignedClassIds: assignments.data?.map((a) => a.class_id) ?? [],
  };
}

/** Server-side route guard. Redirects unauthenticated or wrong-role users. */
export async function requireRole(allowed: readonly Role[]): Promise<SessionContext> {
  const session = await getSessionContext();

  if (!session) redirect("/login?reason=auth_required");
  if (!allowed.includes(session.role)) redirect(HOME_PATH[session.role]);

  return session;
}

/** Server-side permission guard for pages and route handlers. */
export async function requirePermission(permission: Permission): Promise<SessionContext> {
  const session = await getSessionContext();

  if (!session) redirect("/login?reason=auth_required");
  if (!hasPermission(session.role, permission)) redirect(HOME_PATH[session.role]);

  return session;
}

/** Returns a 403-shaped error for route handlers instead of redirecting. */
export async function authorizeApi(permission: Permission) {
  const session = await getSessionContext();
  if (!session) {
    return {
      session: null,
      error: { status: 401, code: "UNAUTHENTICATED", message: "Sign in required." },
    } as const;
  }
  if (!hasPermission(session.role, permission)) {
    return {
      session,
      error: { status: 403, code: "FORBIDDEN", message: "You do not have permission." },
    } as const;
  }
  return { session, error: null } as const;
}
