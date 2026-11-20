import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { courseIdsFor } from "@/features/shared/scope";
import type { TaskEventCategory } from "@/types/domain";

export interface TaskSummary {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  category: TaskEventCategory;
  archivedAt: string | null;
  completed: boolean;
}

export interface TaskDetail extends TaskSummary {
  attachment: string | null;
  createdAt: string;
}

export interface TaskStateInput {
  taskId: string;
  completed: boolean;
}

/** Lists class tasks with the viewer's private completion state merged in. */
export async function listTasks(session: SessionContext): Promise<TaskSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const courseIds = await courseIdsFor(session);
  if (courseIds.length === 0) return [];

  const [{ data: tasks, error }, { data: courses }, { data: states }] = await Promise.all([
    supabase
      .from("tasks_events")
      .select("id, course_id, title, description, due_date, category, archived_at")
      .in("course_id", courseIds)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("courses").select("id, code").in("id", courseIds),
    supabase.from("user_task_state").select("task_id, is_completed").eq("user_id", session.userId),
  ]);
  if (error || !tasks) return [];

  const codeById = new Map((courses ?? []).map((course) => [course.id, course.code]));
  const completedIds = new Set((states ?? []).filter((state) => state.is_completed).map((state) => state.task_id));

  return tasks.map((task) => ({
    id: task.id,
    courseId: task.course_id,
    courseCode: codeById.get(task.course_id) ?? "Course",
    title: task.title,
    description: task.description,
    dueDate: task.due_date,
    category: task.category,
    archivedAt: task.archived_at,
    completed: completedIds.has(task.id),
  }));
}

export async function getTask(session: SessionContext, taskId: string): Promise<TaskDetail | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: task } = await supabase
    .from("tasks_events")
    .select("id, course_id, title, description, due_date, category, attachment, archived_at, created_at")
    .eq("id", taskId)
    .maybeSingle();
  if (!task) return null;

  const [{ data: course }, { data: state }] = await Promise.all([
    supabase.from("courses").select("id, code, class_id").eq("id", task.course_id).maybeSingle(),
    supabase
      .from("user_task_state")
      .select("is_completed")
      .eq("user_id", session.userId)
      .eq("task_id", taskId)
      .maybeSingle(),
  ]);
  if (!course || !courseIdsForAccess(session, course.class_id)) return null;

  return {
    id: task.id,
    courseId: task.course_id,
    courseCode: course.code,
    title: task.title,
    description: task.description,
    dueDate: task.due_date,
    category: task.category,
    archivedAt: task.archived_at,
    attachment: task.attachment,
    createdAt: task.created_at,
    completed: state?.is_completed ?? false,
  };
}

function courseIdsForAccess(session: SessionContext, classId: string): boolean {
  return [...session.classIds, ...session.assignedClassIds].includes(classId);
}

/**
 * Mutual-exclusion check used by the write path: a task is writable only when
 * its course is inside a class this user may access. RLS enforces the same rule.
 */
export async function assertTaskWritable(session: SessionContext, taskId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const { data: task } = await supabase
    .from("tasks_events")
    .select("course_id")
    .eq("id", taskId)
    .maybeSingle();
  if (!task) return false;

  const { data: course } = await supabase
    .from("courses")
    .select("class_id")
    .eq("id", task.course_id)
    .maybeSingle();
  return Boolean(course && courseIdsForAccess(session, course.class_id));
}

/** Upsert only the viewer's own row — never a task id supplied as a full object. */
export async function setTaskCompletion(
  session: SessionContext,
  input: TaskStateInput,
): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  if (!(await assertTaskWritable(session, input.taskId))) return false;

  const { error } = await supabase
    .from("user_task_state")
    .upsert(
      {
        user_id: session.userId,
        task_id: input.taskId,
        is_completed: input.completed,
      },
      { onConflict: "user_id,task_id" },
    );
  return !error;
}
