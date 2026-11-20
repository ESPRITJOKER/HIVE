import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { canAccessCourse, courseIdsFor } from "@/features/shared/scope";
import type { DocumentProcessingStatus } from "@/types/domain";

/** Storage bucket for the Phase 3 upload pipeline. Must be private. */
export const DOCUMENT_BUCKET = "documents";

export interface DocumentSummary {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  status: DocumentProcessingStatus;
  version: number;
  createdAt: string;
  hasFile: boolean;
  hasExternalLink: boolean;
}

export interface DocumentDetail extends DocumentSummary {
  filePath: string | null;
  driveUrl: string | null;
  uploaderId: string;
  errorMessage: string | null;
}

async function withCourseLabels<T extends { course_id: string }>(
  session: SessionContext,
  rows: T[],
): Promise<Array<T & { courseCode: string; courseTitle: string }>> {
  const supabase = await getServerSupabase();
  if (!supabase || rows.length === 0) return [];

  const courseIds = [...new Set(rows.map((row) => row.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, code, title, class_id")
    .in("id", courseIds);
  const labels = new Map((courses ?? []).map((course) => [course.id, course]));

  return rows.flatMap((row) => {
    const course = labels.get(row.course_id);
    if (!course || !canAccessCourse(session, course.class_id)) return [];
    return [{ ...row, courseCode: course.code, courseTitle: course.title }];
  });
}

export async function listDocuments(
  session: SessionContext,
  courseId?: string,
): Promise<DocumentSummary[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  let ids = await courseIdsFor(session);
  if (courseId) ids = ids.filter((id) => id === courseId);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, course_id, processing_status, version, created_at, file_path, drive_url")
    .in("course_id", ids)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const labelled = await withCourseLabels(session, data);
  return labelled.map((document) => ({
    id: document.id,
    title: document.title,
    courseId: document.course_id,
    courseCode: document.courseCode,
    courseTitle: document.courseTitle,
    status: document.processing_status,
    version: document.version,
    createdAt: document.created_at,
    hasFile: Boolean(document.file_path),
    hasExternalLink: Boolean(document.drive_url),
  }));
}

export async function getDocument(
  session: SessionContext,
  documentId: string,
): Promise<DocumentDetail | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data: document } = await supabase
    .from("documents")
    .select("id, title, course_id, processing_status, version, created_at, file_path, drive_url, uploader_id, error_message")
    .eq("id", documentId)
    .maybeSingle();
  if (!document) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title, class_id")
    .eq("id", document.course_id)
    .maybeSingle();
  if (!course || !canAccessCourse(session, course.class_id)) return null;

  return {
    id: document.id,
    title: document.title,
    courseId: document.course_id,
    courseCode: course.code,
    courseTitle: course.title,
    status: document.processing_status,
    version: document.version,
    createdAt: document.created_at,
    hasFile: Boolean(document.file_path),
    hasExternalLink: Boolean(document.drive_url),
    filePath: document.file_path,
    driveUrl: document.drive_url,
    uploaderId: document.uploader_id,
    errorMessage: document.error_message,
  };
}

/**
 * Short-lived signed URL for a private-bucket file. Returns null when the
 * document has no stored file; the viewer then offers only the HTTPS source.
 */
export async function signedDocumentUrl(path: string): Promise<string | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(path, 60 * 60, { download: false });
  if (error || !data) return null;
  return data.signedUrl;
}
