import type { SessionContext } from "@/lib/permissions/guards";

/**
 * Pure, synchronous authorization checks shared by Phase 3 services.
 *
 * These never grant access on their own — they are the application-side
 * recheck performed before a write, mirroring the RLS predicates in
 * `0002_rls_policies.sql`. Keeping them pure makes the escalation and
 * cross-class boundary directly unit-testable without a database.
 */

export function isAdministrator(session: SessionContext): boolean {
  return session.role === "administrator";
}

export function isRepresentative(session: SessionContext): boolean {
  return session.role === "representative";
}

/** Classes whose academic content a representative may create or modify. */
export function managedClassIds(session: SessionContext): string[] {
  return session.role === "representative" ? [...new Set(session.assignedClassIds)] : [];
}

/**
 * Class ids to filter queries by. `null` means "all classes" (administrator),
 * so callers never accidentally treat an empty list as unrestricted access.
 */
export function writeScopeClassIds(session: SessionContext): string[] | null {
  return isAdministrator(session) ? null : managedClassIds(session);
}

export function canManageClass(session: SessionContext, classId: string): boolean {
  if (isAdministrator(session)) return true;
  if (!isRepresentative(session)) return false;
  return managedClassIds(session).includes(classId);
}

/** Moderation follows the same boundary as academic writes. */
export const canModerateClass = canManageClass;

export function canAccessClass(session: SessionContext, classId: string): boolean {
  if (isAdministrator(session)) return true;
  return [...session.classIds, ...session.assignedClassIds].includes(classId);
}

/** Role changes to the signed-in administrator's own account are forbidden. */
export function canChangeRole(session: SessionContext, targetUserId: string): boolean {
  return isAdministrator(session) && targetUserId !== session.userId;
}
