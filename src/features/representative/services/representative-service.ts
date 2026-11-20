import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { DOCUMENT_BUCKET } from "@/features/documents/services/document-service";
import { canManageClass, canModerateClass, writeScopeClassIds } from "@/features/shared/authorization";
import { getMaxUploadBytes } from "@/features/administrator/services/platform-settings-service";
import type { SessionContext } from "@/lib/permissions/guards";
import type {
  AssignmentInput,
  DocumentLinkInput,
  DocumentUploadInput,
  MessageModerationInput,
  TimetableSlotInput,
} from "@/lib/validations/phase3";
import { ALLOWED_DOCUMENT_EXTENSIONS, ALLOWED_DOCUMENT_MIME_TYPES } from "@/lib/constants";

type Supabase = NonNullable<Awaited<ReturnType<typeof getServerSupabase>>>;

interface CourseRef {
  id: string;
  classId: string;
  code: string;
  title: string;
}

export interface ManagedClass {
  id: string;
  name: string;
  code: string;
}

export interface RepStudent {
  id: string;
  fullName: string;
  email: string;
  className: string;
  status: string;
}

export interface RepDocumentRow {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  status: string;
  createdAt: string;
  hasFile: boolean;
  hasLink: boolean;
  error: string | null;
}

export interface RepTimetableRow {
  id: string;
  courseId: string;
  courseCode: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  type: string;
}

export interface RepTaskRow {
  id: string;
  courseId: string;
  courseCode: string;
  title: string;
  category: string;
  dueDate: string | null;
  archived: boolean;
}

export interface RepMessageRow {
  id: string;
  author: string;
  content: string;
  courseCode: string;
  status: string;
  isIndexed: boolean;
  createdAt: string;
}

export interface RepActivity {
  points: number[];
  activeStudents: number;
  pendingMembers: number;
  messages: number;
  assignments: number;
  documents: number;
  hasData: boolean;
}

/** Courses this representative may write to. Administrator scope is unrestricted. */
async function scopedCourses(supabase: Supabase, session: SessionContext): Promise<CourseRef[]> {
  const scope = writeScopeClassIds(session);
  if (scope !== null && scope.length === 0) return [];

  let query = supabase.from("courses").select("id, class_id, code, title");
  if (scope !== null) query = query.in("class_id", scope);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((course) => ({
    id: course.id,
    classId: course.class_id,
    code: course.code,
    title: course.title,
  }));
}

function writableCourse(courses: CourseRef[], session: SessionContext, courseId: string): CourseRef | null {
  const course = courses.find((item) => item.id === courseId);
  return course && canManageClass(session, course.classId) ? course : null;
}

/** Server-side recheck used by every mutating service call (IDOR defence). */
export async function canWriteCourse(session: SessionContext, courseId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  return writableCourse(await scopedCourses(supabase, session), session, courseId) !== null;
}

export async function listManagedClasses(session: SessionContext): Promise<ManagedClass[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const scope = writeScopeClassIds(session);
  if (scope !== null && scope.length === 0) return [];

  let query = supabase.from("classes").select("id, name, code");
  if (scope !== null) query = query.in("id", scope);

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((item) => ({ id: item.id, name: item.name, code: item.code }));
}

export async function listStudents(session: SessionContext): Promise<RepStudent[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const classes = await listManagedClasses(session);
  if (classes.length === 0) return [];
  const classIds = classes.map((item) => item.id);
  const classNames = new Map(classes.map((item) => [item.id, item.name]));

  const { data: memberships, error } = await supabase
    .from("class_members")
    .select("user_id, class_id, membership_status")
    .in("class_id", classIds);
  if (error || !memberships || memberships.length === 0) return [];

  const userIds = [...new Set(memberships.map((row) => row.user_id))];
  const { data: profiles } = await supabase
    .from("users")
    .select("id, email, full_name")
    .in("id", userIds);
  const names = new Map((profiles ?? []).map((user) => [user.id, user.full_name]));
  const emails = new Map((profiles ?? []).map((user) => [user.id, user.email]));

  return memberships
    .filter((row) => names.has(row.user_id))
    .map((row) => ({
      id: row.user_id,
      fullName: names.get(row.user_id) ?? "Unknown",
      email: emails.get(row.user_id) ?? "—",
      className: classNames.get(row.class_id) ?? "—",
      status: row.membership_status,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export interface CourseOption {
  id: string;
  classId: string;
  label: string;
}

export async function listCourseOptions(session: SessionContext): Promise<CourseOption[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const courses = await scopedCourses(supabase, session);
  return courses.map((course) => ({
    id: course.id,
    classId: course.classId,
    label: `${course.code} — ${course.title}`,
  }));
}

export async function listDocuments(session: SessionContext): Promise<RepDocumentRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return [];
  const courseIds = courses.map((course) => course.id);
  const courseMap = new Map(courses.map((course) => [course.id, course]));

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, course_id, processing_status, file_path, drive_url, error_message, created_at")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    courseCode: courseMap.get(row.course_id)?.code ?? "—",
    courseTitle: courseMap.get(row.course_id)?.title ?? "—",
    status: row.processing_status,
    createdAt: row.created_at,
    hasFile: Boolean(row.file_path),
    hasLink: Boolean(row.drive_url),
    error: row.error_message,
  }));
}

export async function createLinkedDocument(session: SessionContext, input: DocumentLinkInput): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (!writableCourse(courses, session, input.courseId)) return false;

  const { error } = await supabase.from("documents").insert({
    course_id: input.courseId,
    title: input.title,
    drive_url: input.driveUrl,
    uploader_id: session.userId,
    processing_status: "uploaded",
  });
  return !error;
}

async function hasAllowedSignature(file: File, contentType: string): Promise<boolean> {
  if (contentType === "text/plain" || contentType === "text/markdown") {
    const sample = new Uint8Array(await file.slice(0, 512).arrayBuffer());
    return !sample.includes(0);
  }
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (contentType === "application/pdf") {
    return String.fromCharCode(...header.slice(0, 4)) === "%PDF";
  }
  // DOCX and PPTX are ZIP containers.
  return header[0] === 0x50 && header[1] === 0x4b && (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
}

/** Uploads to private storage, then records the document. Both are class-scoped. */
export async function uploadDocument(
  session: SessionContext,
  input: DocumentUploadInput,
  file: File,
): Promise<{ ok: boolean; message?: string }> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false, message: "Backend is not configured." };

  const courses = await scopedCourses(supabase, session);
  const course = writableCourse(courses, session, input.courseId);
  if (!course) return { ok: false, message: "That course is not in a class you manage." };

  const configuredLimit = await getMaxUploadBytes();
  if (file.size > configuredLimit || file.size > input.byteSize || file.size === 0) {
    return { ok: false, message: "The file exceeds the configured upload limit." };
  }

  const extension = input.fileName.slice(input.fileName.lastIndexOf(".")).toLowerCase();
  if (
    !(ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension) ||
    !(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(input.contentType) ||
    !(await hasAllowedSignature(file, input.contentType))
  ) {
    return { ok: false, message: "The file type does not match an allowed document format." };
  }

  const documentId = crypto.randomUUID();
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const path = `${course.classId}/${course.id}/${documentId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, { contentType: input.contentType, upsert: false });
  if (uploadError) return { ok: false, message: "Upload failed. Check the storage bucket configuration." };

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    course_id: course.id,
    title: input.title,
    file_path: path,
    uploader_id: session.userId,
    processing_status: "uploaded",
  });

  if (insertError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
    return { ok: false, message: "The document could not be registered." };
  }
  return { ok: true };
}

export async function deleteDocument(session: SessionContext, documentId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return false;

  const { data: document } = await supabase
    .from("documents")
    .select("id, course_id, file_path")
    .eq("id", documentId)
    .maybeSingle();
  if (!document || !writableCourse(courses, session, document.course_id)) return false;

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) return false;

  if (document.file_path) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([document.file_path]);
  }
  return true;
}

export async function listTimetableSlots(session: SessionContext): Promise<RepTimetableRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return [];
  const courseIds = courses.map((course) => course.id);
  const codes = new Map(courses.map((course) => [course.id, course.code]));

  const { data, error } = await supabase
    .from("timetable_slots")
    .select("id, course_id, subject, day, start_time, end_time, room, type")
    .in("course_id", courseIds)
    .order("day");
  if (error || !data) return [];
  return data.map((slot) => ({
    id: slot.id,
    courseId: slot.course_id,
    courseCode: codes.get(slot.course_id) ?? "—",
    subject: slot.subject,
    day: slot.day,
    startTime: slot.start_time,
    endTime: slot.end_time,
    room: slot.room,
    type: slot.type,
  }));
}

export async function createTimetableSlot(session: SessionContext, input: TimetableSlotInput): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (!writableCourse(courses, session, input.courseId)) return false;

  const { error } = await supabase.from("timetable_slots").insert({
    course_id: input.courseId,
    subject: input.subject,
    room: input.room || null,
    teacher: input.teacher || null,
    day: input.day,
    start_time: input.startTime,
    end_time: input.endTime,
    type: input.type,
  });
  return !error;
}

export async function deleteTimetableSlot(session: SessionContext, slotId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return false;

  const { data: slot } = await supabase
    .from("timetable_slots")
    .select("id, course_id")
    .eq("id", slotId)
    .maybeSingle();
  if (!slot || !writableCourse(courses, session, slot.course_id)) return false;

  const { error } = await supabase.from("timetable_slots").delete().eq("id", slotId);
  return !error;
}

export async function listAssignments(session: SessionContext): Promise<RepTaskRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return [];
  const courseIds = courses.map((course) => course.id);
  const codes = new Map(courses.map((course) => [course.id, course.code]));

  const { data, error } = await supabase
    .from("tasks_events")
    .select("id, course_id, title, category, due_date, archived_at")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((task) => ({
    id: task.id,
    courseId: task.course_id,
    courseCode: codes.get(task.course_id) ?? "—",
    title: task.title,
    category: task.category,
    dueDate: task.due_date,
    archived: Boolean(task.archived_at),
  }));
}

export async function createAssignment(session: SessionContext, input: AssignmentInput): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (!writableCourse(courses, session, input.courseId)) return false;

  const { error } = await supabase.from("tasks_events").insert({
    course_id: input.courseId,
    title: input.title,
    description: input.description || null,
    due_date: input.dueDate || null,
    category: input.category,
  });
  return !error;
}

export async function deleteAssignment(session: SessionContext, taskId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return false;

  const { data: task } = await supabase
    .from("tasks_events")
    .select("id, course_id")
    .eq("id", taskId)
    .maybeSingle();
  if (!task || !writableCourse(courses, session, task.course_id)) return false;

  const { error } = await supabase.from("tasks_events").delete().eq("id", taskId);
  return !error;
}

export async function listModerationQueue(session: SessionContext): Promise<RepMessageRow[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const courses = await scopedCourses(supabase, session);
  if (courses.length === 0) return [];
  const courseIds = courses.map((course) => course.id);
  const codes = new Map(courses.map((course) => [course.id, course.code]));

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, user_id, course_id, content, moderation_status, is_indexed, created_at")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !messages || messages.length === 0) return [];

  const authorIds = [...new Set(messages.map((message) => message.user_id))];
  const { data: authors } = await supabase.from("users").select("id, full_name").in("id", authorIds);
  const names = new Map((authors ?? []).map((user) => [user.id, user.full_name]));

  return messages.map((message) => ({
    id: message.id,
    author: names.get(message.user_id) ?? "Unknown",
    content: message.content,
    courseCode: message.course_id ? codes.get(message.course_id) ?? "—" : "—",
    status: message.moderation_status,
    isIndexed: message.is_indexed,
    createdAt: message.created_at,
  }));
}

/** Marks a message hidden/visible and whether it may be used for AI indexing. */
export async function setMessageModeration(
  session: SessionContext,
  input: MessageModerationInput,
): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase || !isRepresentativeForModeration(session)) return false;

  const { data: classId, error: lookupError } = await supabase.rpc("message_class_id", {
    target_message_id: input.messageId,
  });
  if (lookupError || !classId || !canModerateClass(session, classId)) return false;

  const { error } = await supabase
    .from("messages")
    .update({ moderation_status: input.moderationStatus, is_indexed: input.isIndexed })
    .eq("id", input.messageId);
  return !error;
}

function isRepresentativeForModeration(session: SessionContext): boolean {
  return session.role === "representative";
}

export async function getClassActivity(session: SessionContext): Promise<RepActivity> {
  const empty: RepActivity = {
    points: Array.from({ length: 7 }, () => 0),
    activeStudents: 0,
    pendingMembers: 0,
    messages: 0,
    assignments: 0,
    documents: 0,
    hasData: false,
  };

  const supabase = await getServerSupabase();
  if (!supabase) return empty;

  const classes = await listManagedClasses(session);
  if (classes.length === 0) return empty;
  const classIds = classes.map((item) => item.id);
  const courses = await scopedCourses(supabase, session);
  const courseIds = courses.map((course) => course.id);
  if (courseIds.length === 0) return empty;

  const [documents, messages, tasks, memberships] = await Promise.all([
    supabase.from("documents").select("created_at").in("course_id", courseIds),
    supabase.from("messages").select("created_at").in("course_id", courseIds),
    supabase.from("tasks_events").select("created_at, category").in("course_id", courseIds),
    supabase
      .from("class_members")
      .select("user_id, membership_status")
      .in("class_id", classIds),
  ]);

  const points = [...empty.points];
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const allTimestamps = [
    ...(documents.data ?? []).map((row) => row.created_at),
    ...(messages.data ?? []).map((row) => row.created_at),
    ...(tasks.data ?? []).map((row) => row.created_at),
  ];
  for (const timestamp of allTimestamps) {
    const date = new Date(timestamp);
    if (date.getTime() < cutoff) continue;
    const mondayFirst = (date.getUTCDay() + 6) % 7;
    points[mondayFirst] = (points[mondayFirst] ?? 0) + 1;
  }

  const memberRows = memberships.data ?? [];
  return {
    points,
    activeStudents: new Set(memberRows.filter((row) => row.membership_status === "active").map((row) => row.user_id)).size,
    pendingMembers: memberRows.filter((row) => row.membership_status === "pending").length,
    messages: messages.data?.length ?? 0,
    assignments: (tasks.data ?? []).filter((row) => row.category === "assignment").length,
    documents: documents.data?.length ?? 0,
    hasData: allTimestamps.length > 0 || memberRows.length > 0,
  };
}
