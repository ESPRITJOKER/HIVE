import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { canChangeRole } from "@/features/shared/authorization";
import type { SessionContext } from "@/lib/permissions/guards";
import type {
  ClassInput,
  MembershipDecisionInput,
  RepresentativeAssignmentInput,
  UserRoleInput,
} from "@/lib/validations/phase3";

type Supabase = NonNullable<Awaited<ReturnType<typeof getServerSupabase>>>;

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  className: string;
  membershipStatus: string | null;
}

export interface AdminClassRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  students: number;
  representatives: number;
}

export interface AdminMembershipRow {
  id: string;
  userName: string;
  userEmail: string;
  className: string;
  status: string;
  joinedAt: string;
}

export interface AdminAssignmentRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  classId: string;
  className: string;
}

export interface AdminAuditRow {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  createdAt: string;
}

export interface AdminUsageRow {
  userId: string;
  email: string;
  requests: number;
  days: number;
}

export interface AdminOverview {
  roleCounts: { student: number; representative: number; administrator: number };
  classes: number;
  courses: number;
  documentsByStatus: Record<string, number>;
  aiRequests: number;
  aiUsers: number;
  auditPoints: number[];
  hasData: boolean;
}

async function nameMaps(supabase: Supabase) {
  const [users, classes] = await Promise.all([
    supabase.from("users").select("id, full_name, email"),
    supabase.from("classes").select("id, name"),
  ]);
  return {
    userNames: new Map((users.data ?? []).map((user) => [user.id, user.full_name])),
    userEmails: new Map((users.data ?? []).map((user) => [user.id, user.email])),
    classNames: new Map((classes.data ?? []).map((item) => [item.id, item.name])),
  };
}

export async function listUsers(session: SessionContext): Promise<AdminUserRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });
  if (!users || users.length === 0) return [];

  const { data: memberships } = await supabase
    .from("class_members")
    .select("user_id, class_id, membership_status");
  const { classNames } = await nameMaps(supabase);

  const firstMembership = new Map<string, { className: string; status: string }>();
  for (const row of memberships ?? []) {
    if (!firstMembership.has(row.user_id)) {
      firstMembership.set(row.user_id, {
        className: classNames.get(row.class_id) ?? "—",
        status: row.membership_status,
      });
    }
  }

  return users.map((user) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    className: firstMembership.get(user.id)?.className ?? "—",
    membershipStatus: firstMembership.get(user.id)?.status ?? null,
  }));
}

/**
 * Role changes are double-guarded: a pure self-check here and the DB trigger
 * `prevent_role_self_change`. The last administrator can never be demoted.
 */
export async function updateUserRole(session: SessionContext, input: UserRoleInput): Promise<boolean> {
  if (!canChangeRole(session, input.userId)) return false;
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const { data: target } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", input.userId)
    .maybeSingle();
  if (!target || target.role === input.role) return false;

  if (target.role === "administrator" && input.role !== "administrator") {
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "administrator");
    if ((count ?? 0) <= 1) return false;
  }

  const { error } = await supabase.from("users").update({ role: input.role }).eq("id", input.userId);
  return !error;
}

export async function listClasses(session: SessionContext): Promise<AdminClassRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, code, description")
    .order("name");
  if (!classes || classes.length === 0) return [];

  const ids = classes.map((item) => item.id);
  const [members, reps] = await Promise.all([
    supabase.from("class_members").select("class_id").in("class_id", ids),
    supabase.from("representative_assignments").select("class_id").in("class_id", ids),
  ]);

  return classes.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    description: item.description,
    students: (members.data ?? []).filter((row) => row.class_id === item.id).length,
    representatives: (reps.data ?? []).filter((row) => row.class_id === item.id).length,
  }));
}

export async function createClass(session: SessionContext, input: ClassInput): Promise<boolean> {
  if (session.role !== "administrator") return false;
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("classes").insert({
    name: input.name,
    code: input.code,
    description: input.description || null,
  });
  return !error;
}

export async function listMemberships(session: SessionContext): Promise<AdminMembershipRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: memberships } = await supabase
    .from("class_members")
    .select("id, user_id, class_id, membership_status, joined_at")
    .order("joined_at", { ascending: false });
  if (!memberships || memberships.length === 0) return [];

  const { userNames, userEmails, classNames } = await nameMaps(supabase);
  return memberships.map((row) => ({
    id: row.id,
    userName: userNames.get(row.user_id) ?? "Unknown",
    userEmail: userEmails.get(row.user_id) ?? "—",
    className: classNames.get(row.class_id) ?? "—",
    status: row.membership_status,
    joinedAt: row.joined_at,
  }));
}

export async function setMembershipStatus(
  session: SessionContext,
  input: MembershipDecisionInput,
): Promise<boolean> {
  if (session.role !== "administrator") return false;
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from("class_members")
    .update({ membership_status: input.status })
    .eq("id", input.membershipId);
  return !error;
}

export async function listRepresentativeAssignments(session: SessionContext): Promise<AdminAssignmentRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: assignments } = await supabase
    .from("representative_assignments")
    .select("id, user_id, class_id");
  if (!assignments || assignments.length === 0) return [];

  const { userNames, userEmails, classNames } = await nameMaps(supabase);
  return assignments.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: userNames.get(row.user_id) ?? "Unknown",
    userEmail: userEmails.get(row.user_id) ?? "—",
    classId: row.class_id,
    className: classNames.get(row.class_id) ?? "—",
  }));
}

export async function setRepresentativeAssignment(
  session: SessionContext,
  input: RepresentativeAssignmentInput,
): Promise<boolean> {
  if (session.role !== "administrator") return false;
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  if (!input.assign) {
    const { error } = await supabase
      .from("representative_assignments")
      .delete()
      .eq("user_id", input.userId)
      .eq("class_id", input.classId);
    return !error;
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", input.userId)
    .maybeSingle();
  if (!user || user.role !== "representative") return false;

  const { error } = await supabase.from("representative_assignments").upsert(
    { user_id: input.userId, class_id: input.classId },
    { onConflict: "user_id,class_id" },
  );
  return !error;
}

export async function listAuditLogs(session: SessionContext, limit = 100): Promise<AdminAuditRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, actor_id, action, resource_type, resource_id, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 200));
  if (!logs || logs.length === 0) return [];

  const { userNames } = await nameMaps(supabase);
  return logs.map((row) => ({
    id: row.id,
    actor: row.actor_id ? userNames.get(row.actor_id) ?? "Former member" : "System",
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    createdAt: row.created_at,
  }));
}

export async function listAiUsage(session: SessionContext): Promise<AdminUsageRow[]> {
  if (session.role !== "administrator") return [];
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data: usage } = await supabase.from("ai_usage").select("user_id, request_count, day");
  if (!usage || usage.length === 0) return [];

  const { userEmails } = await nameMaps(supabase);
  const byUser = new Map<string, AdminUsageRow>();
  for (const row of usage) {
    const current = byUser.get(row.user_id) ?? {
      userId: row.user_id,
      email: userEmails.get(row.user_id) ?? "Unknown",
      requests: 0,
      days: 0,
    };
    current.requests += row.request_count;
    current.days += 1;
    byUser.set(row.user_id, current);
  }
  return [...byUser.values()].sort((a, b) => b.requests - a.requests);
}

export async function getAdminOverview(session: SessionContext): Promise<AdminOverview> {
  const empty: AdminOverview = {
    roleCounts: { student: 0, representative: 0, administrator: 0 },
    classes: 0,
    courses: 0,
    documentsByStatus: {},
    aiRequests: 0,
    aiUsers: 0,
    auditPoints: Array.from({ length: 7 }, () => 0),
    hasData: false,
  };
  const supabase = await getServerSupabase();
  if (!supabase || session.role !== "administrator") return empty;

  const [users, classes, courses, documents, usage, logs] = await Promise.all([
    supabase.from("users").select("role"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("processing_status"),
    supabase.from("ai_usage").select("request_count, user_id"),
    supabase.from("audit_logs").select("created_at").order("created_at", { ascending: false }).limit(500),
  ]);

  const roleCounts = { student: 0, representative: 0, administrator: 0 };
  for (const user of users.data ?? []) {
    if (user.role in roleCounts) roleCounts[user.role as keyof typeof roleCounts] += 1;
  }

  const documentsByStatus: Record<string, number> = {};
  for (const document of documents.data ?? []) {
    documentsByStatus[document.processing_status] = (documentsByStatus[document.processing_status] ?? 0) + 1;
  }

  const usageRows = usage.data ?? [];
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const auditPoints = [...empty.auditPoints];
  for (const log of logs.data ?? []) {
    const date = new Date(log.created_at);
    if (date.getTime() < cutoff) continue;
    const index = (date.getUTCDay() + 6) % 7;
    auditPoints[index] = (auditPoints[index] ?? 0) + 1;
  }

  return {
    roleCounts,
    classes: classes.count ?? 0,
    courses: courses.count ?? 0,
    documentsByStatus,
    aiRequests: usageRows.reduce((sum, row) => sum + row.request_count, 0),
    aiUsers: new Set(usageRows.map((row) => row.user_id)).size,
    auditPoints,
    hasData: (users.data?.length ?? 0) > 0 || (logs.data?.length ?? 0) > 0,
  };
}
