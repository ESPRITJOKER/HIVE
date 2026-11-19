import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";

export interface DashboardMetrics {
  courses: number;
  indexedDocuments: number;
  upcomingTasks: number;
  students: number | null;
  classes: number;
}

/**
 * Aggregates role-scoped counts for dashboard widgets.
 * All queries run through the user-context Supabase client, so RLS applies.
 * Returns null when the backend is not configured (never fabricated numbers).
 */
export async function getDashboardMetrics(session: SessionContext): Promise<DashboardMetrics | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const classIds = session.role === "administrator" ? [] : session.assignedClassIds.length
    ? session.assignedClassIds
    : session.classIds;

  let courseQuery = supabase.from("courses").select("id", { count: "exact", head: true });
  if (session.role !== "administrator") {
    if (classIds.length === 0) {
      return { courses: 0, indexedDocuments: 0, upcomingTasks: 0, students: 0, classes: 0 };
    }
    courseQuery = courseQuery.in("class_id", classIds);
  }
  const coursesResult = await courseQuery;

  const classesResult = session.role === "administrator"
    ? await supabase.from("classes").select("id", { count: "exact", head: true })
    : null;

  const studentsResult =
    session.role === "administrator"
      ? await supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student")
      : classIds.length > 0
        ? await supabase.from("class_members").select("user_id", { count: "exact", head: true })
            .in("class_id", classIds).eq("membership_status", "active")
        : null;

  // Course ids are needed to scope document/task queries without relying on
  // client-side filtering (avoids both over-fetching and cross-class reads).
  let scopedCourseQuery = supabase.from("courses").select("id");
  if (session.role !== "administrator") scopedCourseQuery = scopedCourseQuery.in("class_id", classIds);
  const { data: scopedCourses } = await scopedCourseQuery;
  const courseIds = scopedCourses?.map((course) => course.id) ?? [];

  const [documentsResult, tasksResult] = await Promise.all([
    courseIds.length > 0
      ? supabase.from("documents").select("id", { count: "exact", head: true })
          .in("course_id", courseIds).eq("processing_status", "indexed")
      : Promise.resolve({ count: 0 }),
    courseIds.length > 0
      ? supabase.from("tasks_events").select("id", { count: "exact", head: true })
          .in("course_id", courseIds).gte("due_date", new Date().toISOString()).is("archived_at", null)
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    courses: coursesResult.count ?? 0,
    indexedDocuments: documentsResult.count ?? 0,
    upcomingTasks: tasksResult.count ?? 0,
    students: studentsResult?.count ?? null,
    classes: classesResult?.count ?? classIds.length,
  };
}
