import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { courseIdsFor } from "@/features/shared/scope";
import type { TimetableSlotType } from "@/types/domain";

export interface TimetableEntry {
  id: string;
  courseId: string;
  courseCode: string;
  subject: string;
  room: string | null;
  teacher: string | null;
  day: string;
  startTime: string;
  endTime: string;
  type: TimetableSlotType;
}

/** Server-rendered timetable data; no client fetch is needed to view it offline. */
export async function listTimetable(session: SessionContext): Promise<TimetableEntry[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const courseIds = await courseIdsFor(session);
  if (courseIds.length === 0) return [];

  const [{ data: slots, error }, { data: courses }] = await Promise.all([
    supabase
      .from("timetable_slots")
      .select("id, course_id, subject, room, teacher, day, start_time, end_time, type")
      .in("course_id", courseIds)
      .order("start_time"),
    supabase.from("courses").select("id, code").in("id", courseIds),
  ]);
  if (error || !slots) return [];

  const codeById = new Map((courses ?? []).map((course) => [course.id, course.code]));

  return slots.map((slot) => ({
    id: slot.id,
    courseId: slot.course_id,
    courseCode: codeById.get(slot.course_id) ?? "Course",
    subject: slot.subject,
    room: slot.room,
    teacher: slot.teacher,
    day: slot.day,
    startTime: slot.start_time,
    endTime: slot.end_time,
    type: slot.type,
  }));
}
