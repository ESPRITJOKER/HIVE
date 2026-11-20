"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions/guards";
import {
  assignmentSchema,
  documentDeleteSchema,
  documentLinkSchema,
  documentUploadSchema,
  messageModerationSchema,
  taskDeleteSchema,
  timetableSlotDeleteSchema,
  timetableSlotSchema,
} from "@/lib/validations/phase3";
import {
  createAssignment,
  createLinkedDocument,
  createTimetableSlot,
  deleteAssignment,
  deleteDocument,
  deleteTimetableSlot,
  setMessageModeration,
  uploadDocument,
} from "../services/representative-service";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

const invalid = (message: string): ActionResult => ({ ok: false, message });

function revalidateAcademicPaths(): void {
  for (const path of [
    "/representative/dashboard",
    "/representative/documents",
    "/representative/timetable",
    "/representative/assignments",
    "/representative/moderation",
    "/representative/notebook",
    "/representative/class",
    "/student/documents",
    "/student/timetable",
    "/student/assignments",
    "/student/discussions",
  ]) {
    revalidatePath(path);
  }
}

export async function createDocumentLinkAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = documentLinkSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message ?? "Invalid document details.");

  const created = await createLinkedDocument(session, parsed.data);
  if (!created) return invalid("That course is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function uploadDocumentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return invalid("Choose a document to upload.");

  const parsed = documentUploadSchema.safeParse({
    title: formData.get("title"),
    courseId: formData.get("courseId"),
    fileName: file.name,
    contentType: file.type,
    byteSize: file.size,
  });
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message ?? "Invalid document details.");

  const result = await uploadDocument(session, parsed.data, file);
  if (!result.ok) return invalid(result.message ?? "Upload failed.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function deleteDocumentAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = documentDeleteSchema.safeParse(input);
  if (!parsed.success) return invalid("Invalid document reference.");

  const deleted = await deleteDocument(session, parsed.data.documentId);
  if (!deleted) return invalid("That document is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function createTimetableSlotAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = timetableSlotSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message ?? "Invalid timetable slot.");

  const created = await createTimetableSlot(session, parsed.data);
  if (!created) return invalid("That course is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function deleteTimetableSlotAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = timetableSlotDeleteSchema.safeParse(input);
  if (!parsed.success) return invalid("Invalid slot reference.");

  const deleted = await deleteTimetableSlot(session, parsed.data.slotId);
  if (!deleted) return invalid("That slot is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function createAssignmentAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = assignmentSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message ?? "Invalid assignment details.");

  const created = await createAssignment(session, parsed.data);
  if (!created) return invalid("That course is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function deleteAssignmentAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = taskDeleteSchema.safeParse(input);
  if (!parsed.success) return invalid("Invalid assignment reference.");

  const deleted = await deleteAssignment(session, parsed.data.taskId);
  if (!deleted) return invalid("That assignment is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}

export async function setMessageModerationAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(["representative"]);
  const parsed = messageModerationSchema.safeParse(input);
  if (!parsed.success) return invalid("Invalid moderation request.");

  const updated = await setMessageModeration(session, parsed.data);
  if (!updated) return invalid("That message is not in a class you manage.");
  revalidateAcademicPaths();
  return { ok: true };
}
