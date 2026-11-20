import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/permissions/guards";
import { courseIdsFor } from "@/features/shared/scope";
import type { DocumentProcessingStatus } from "@/types/domain";

export interface SavedResource {
  savedId: string;
  documentId: string;
  title: string;
  courseCode: string;
  status: DocumentProcessingStatus;
  savedAt: string;
}

export async function listSavedResources(session: SessionContext): Promise<SavedResource[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const [{ data: saved, error }, courseIds] = await Promise.all([
    supabase
      .from("saved_resources")
      .select("id, document_id, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false }),
    courseIdsFor(session),
  ]);
  if (error || !saved || saved.length === 0 || courseIds.length === 0) return [];

  const documentIds = saved.map((row) => row.document_id);
  const [{ data: documents }, { data: courses }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, course_id, title, processing_status")
      .in("id", documentIds),
    supabase.from("courses").select("id, code").in("id", courseIds),
  ]);

  const documentById = new Map((documents ?? []).map((document) => [document.id, document]));
  const codeById = new Map((courses ?? []).map((course) => [course.id, course.code]));

  return saved.flatMap((row) => {
    const document = documentById.get(row.document_id);
    if (!document || !courseIds.includes(document.course_id)) return [];
    return [{
      savedId: row.id,
      documentId: document.id,
      title: document.title,
      courseCode: codeById.get(document.course_id) ?? "Course",
      status: document.processing_status,
      savedAt: row.created_at,
    }];
  });
}

export async function savedDocumentIds(session: SessionContext): Promise<string[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("saved_resources")
    .select("document_id")
    .eq("user_id", session.userId);
  return (data ?? []).map((row) => row.document_id);
}

export async function isDocumentSaved(session: SessionContext, documentId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { data } = await supabase
    .from("saved_resources")
    .select("id")
    .eq("user_id", session.userId)
    .eq("document_id", documentId)
    .maybeSingle();
  return Boolean(data);
}

/** Idempotent save keyed by (user, document); RLS checks document access. */
export async function saveDocument(session: SessionContext, documentId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from("saved_resources")
    .upsert(
      { user_id: session.userId, document_id: documentId },
      { onConflict: "user_id,document_id", ignoreDuplicates: true },
    );
  return !error;
}

export async function removeSavedDocument(session: SessionContext, documentId: string): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from("saved_resources")
    .delete()
    .eq("user_id", session.userId)
    .eq("document_id", documentId);
  return !error;
}
