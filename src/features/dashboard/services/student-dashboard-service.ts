import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { courseIdsFor } from "@/features/shared/scope";
import { listCourses } from "@/features/courses/services/course-service";
import { listTasks } from "@/features/tasks/services/task-service";
import { listDocuments } from "@/features/documents/services/document-service";
import { unreadNotificationCount } from "@/features/notifications/services/notification-service";
import { isActiveOpportunity } from "@/features/shared/format";

export interface StudentDashboardData {
  courseCount: number;
  classCount: number;
  upcomingCount: number;
  unreadCount: number;
  documents: Array<{ id: string; title: string; courseCode: string; status: string }>;
  deadlines: Array<{ id: string; title: string; courseCode: string; dueDate: string | null }>;
  opportunities: Array<{ id: string; title: string; dueDate: string | null }>;
}

/** Aggregates the student's real, class-scoped data for the dashboard. */
export async function getStudentDashboardData(session: SessionContext): Promise<StudentDashboardData | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const [courses, tasks, documents, unread] = await Promise.all([
    listCourses(session),
    listTasks(session),
    listDocuments(session),
    unreadNotificationCount(session),
  ]);

  const deadlineTasks = tasks.filter((task) => !task.completed && !task.archivedAt)
    .filter((task) => task.category === "assignment" || task.category === "exam")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));

  return {
    courseCount: courses.length,
    classCount: new Set(courses.map((course) => course.classId)).size,
    upcomingCount: deadlineTasks.length,
    unreadCount: unread,
    documents: documents.slice(0, 3).map((document) => ({
      id: document.id,
      title: document.title,
      courseCode: document.courseCode,
      status: document.status,
    })),
    deadlines: deadlineTasks.slice(0, 4).map((task) => ({
      id: task.id,
      title: task.title,
      courseCode: task.courseCode,
      dueDate: task.dueDate,
    })),
    opportunities: tasks.filter((task) => isActiveOpportunity(task)).slice(0, 3).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
    })),
  };
}

/** Kept for callers that only need a quick scope check. */
export async function hasAnyCourse(session: SessionContext): Promise<boolean> {
  return (await courseIdsFor(session)).length > 0;
}
