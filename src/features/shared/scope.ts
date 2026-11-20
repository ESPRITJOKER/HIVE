import "server-only";

import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";

/**
 * Class ids the viewer may read. Active memberships and representative
 * assignments are both legitimate access paths; RLS enforces the same rule.
 */
export function viewerClassIds(session: SessionContext): string[] {
  return [...new Set([...session.classIds, ...session.assignedClassIds])];
}

/**
 * Course ids visible to the viewer, scoped on the server. This is defence in
 * depth on top of RLS — queries never rely on client-supplied class ids.
 * Memoised per request via React.cache, keyed by the primitives involved.
 */
export const getScopedCourseIds = cache(
  async (userId: string, classIds: readonly string[], assignedClassIds: readonly string[]) => {
    const supabase = await getServerSupabase();
    if (!supabase) return [];

    const ids = [...new Set([...classIds, ...assignedClassIds])];
    if (ids.length === 0) return [];

    const { data, error } = await supabase.from("courses").select("id").in("class_id", ids);
    if (error) return [];
    return (data ?? []).map((course) => course.id);
  },
);

/** Convenience wrapper used by page-level services. */
export async function courseIdsFor(session: SessionContext): Promise<string[]> {
  return getScopedCourseIds(session.userId, session.classIds, session.assignedClassIds);
}

/** True when the course belongs to a class the viewer may access. */
export function canAccessCourse(session: SessionContext, classId: string): boolean {
  return viewerClassIds(session).includes(classId);
}
