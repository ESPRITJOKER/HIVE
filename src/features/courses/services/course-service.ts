import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { canAccessCourse, courseIdsFor } from "@/features/shared/scope";
import type { TimetableSlotType } from "@/types/domain";

export interface CourseSummary {
  id: string;
  code: string;
  title: string;
  description: string | null;
  classId: string;
  documentCount: number;
  taskCount: number;
}

export interface CourseDetail extends CourseSummary {
  className: string | null;
  classCode: string | null;
  documents: Array<{ id: string; title: string; processingStatus: string }>;
  slots: Array<{
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    type: TimetableSlotType;
  }>;
}

/** Lists only courses in classes the viewer belongs to or represents. */
export async function listCourses(session: SessionContext): Promise<CourseSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const ids = await courseIdsFor(session);
  if (ids.length === 0) return [];

  const [{ data: courses, error }, documentsResult, tasksResult] = await Promise.all([
    supabase.from("courses").select("id, code, title, description, class_id").in("id", ids).order("code"),
    supabase.from("documents").select("course_id").in("course_id", ids),
    supabase.from("tasks_events").select("course_id").in("course_id", ids).is("archived_at", null),
  ]);
  if (error || !courses) return [];

  const documentCounts = new Map<string, number>();
  for (const row of documentsResult.data ?? []) {
    documentCounts.set(row.course_id, (documentCounts.get(row.course_id) ?? 0) + 1);
  }
  const taskCounts = new Map<string, number>();
  for (const row of tasksResult.data ?? []) {
    taskCounts.set(row.course_id, (taskCounts.get(row.course_id) ?? 0) + 1);
  }

  return courses.map((course) => ({
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    classId: course.class_id,
    documentCount: documentCounts.get(course.id) ?? 0,
    taskCount: taskCounts.get(course.id) ?? 0,
  }));
}

/** Fetches one course with its related, class-scoped material. */
export async function getCourseDetail(
  session: SessionContext,
  courseId: string,
): Promise<CourseDetail | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title, description, class_id")
    .eq("id", courseId)
    .maybeSingle();
  if (!course || !canAccessCourse(session, course.class_id)) return null;

  const [{ data: classRow }, documentsResult, slotsResult] = await Promise.all([
    supabase.from("classes").select("name, code").eq("id", course.class_id).maybeSingle(),
    supabase
      .from("documents")
      .select("id, title, processing_status")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("timetable_slots")
      .select("id, day, start_time, end_time, subject, type")
      .eq("course_id", courseId)
      .order("start_time"),
  ]);

  return {
    id: course.id,
    code: course.code,
    title: course.title,
    description: course.description,
    classId: course.class_id,
    documentCount: documentsResult.data?.length ?? 0,
    taskCount: 0,
    className: classRow?.name ?? null,
    classCode: classRow?.code ?? null,
    documents: (documentsResult.data ?? []).map((document) => ({
      id: document.id,
      title: document.title,
      processingStatus: document.processing_status,
    })),
    slots: (slotsResult.data ?? []).map((slot) => ({
      id: slot.id,
      day: slot.day,
      startTime: slot.start_time,
      endTime: slot.end_time,
      subject: slot.subject,
      type: slot.type,
    })),
  };
}
