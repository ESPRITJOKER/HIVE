import { z } from "zod";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_MIME_TYPES,
  DAY_ORDER,
  MAX_DOCUMENT_BYTES,
} from "@/lib/constants";
import { sanitizeText, uuidSchema } from "./common";

const DAY_VALUES = DAY_ORDER as readonly [string, ...string[]];
const SLOT_TYPES = ["lecture_cm", "tutorial_td", "practical_tp", "examination"] as const;
const TASK_CATEGORIES = ["assignment", "exam", "hackathon", "internship", "scholarship", "event"] as const;
const ROLE_VALUES = ["student", "representative", "administrator"] as const;

const title = (max = 200) =>
  z.string().trim().min(1, "Enter a title.").max(max, "Title is too long.").transform(sanitizeText);
const maybeText = (max: number) =>
  z.string().trim().max(max, "Text is too long.").transform(sanitizeText);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM.");
const isoDate = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date.")
  .transform((value) => new Date(value).toISOString());

/* ------------------------------------------------------------------ Documents */
export const documentLinkSchema = z.object({
  title: title(),
  courseId: uuidSchema,
  driveUrl: z
    .string()
    .trim()
    .url("Enter a valid URL.")
    .refine((value) => value.startsWith("https://"), "Use an HTTPS link."),
});

export const documentUploadSchema = z
  .object({
    title: title(),
    courseId: uuidSchema,
    fileName: z.string().trim().min(1).max(255),
    contentType: z.string().trim().min(1).max(127),
    byteSize: z.number().int().positive().max(MAX_DOCUMENT_BYTES, "Files must be 25 MB or smaller."),
  })
  .superRefine((value, ctx) => {
    const extension = value.fileName.slice(value.fileName.lastIndexOf(".")).toLowerCase();
    if (!(ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension)) {
      ctx.addIssue({ code: "custom", message: "This file type is not supported." });
    }
    if (!(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(value.contentType)) {
      ctx.addIssue({ code: "custom", message: "This file type is not supported." });
    }
  });

export const documentDeleteSchema = z.object({ documentId: uuidSchema });

/* ------------------------------------------------------------------ Timetable */
export const timetableSlotSchema = z
  .object({
    courseId: uuidSchema,
    subject: title(120),
    room: maybeText(80).optional(),
    teacher: maybeText(120).optional(),
    day: z.enum(DAY_VALUES),
    startTime: hhmm,
    endTime: hhmm,
    type: z.enum(SLOT_TYPES),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "The end time must be after the start time.",
    path: ["endTime"],
  });

export const timetableSlotDeleteSchema = z.object({ slotId: uuidSchema });

/* ------------------------------------------------------------------ Assignments */
export const assignmentSchema = z.object({
  courseId: uuidSchema,
  title: title(200),
  description: maybeText(4000).optional(),
  dueDate: isoDate.optional(),
  category: z.enum(TASK_CATEGORIES),
});

export const taskDeleteSchema = z.object({ taskId: uuidSchema });

/* ------------------------------------------------------------------ Moderation */
export const messageModerationSchema = z.object({
  messageId: uuidSchema,
  moderationStatus: z.enum(["visible", "hidden", "indexed"]),
  isIndexed: z.boolean(),
});

/* ------------------------------------------------------------------ Administration */
export const userRoleSchema = z.object({
  userId: uuidSchema,
  role: z.enum(ROLE_VALUES),
});

export const classSchema = z.object({
  name: z.string().trim().min(1, "Enter a class name.").max(160).transform(sanitizeText),
  code: z
    .string()
    .trim()
    .min(3, "Class codes need at least 3 characters.")
    .max(40)
    .transform((value) => value.toUpperCase()),
  description: maybeText(500).optional(),
});

export const membershipDecisionSchema = z.object({
  membershipId: uuidSchema,
  status: z.enum(["active", "rejected"]),
});

export const representativeAssignmentSchema = z.object({
  userId: uuidSchema,
  classId: uuidSchema,
  assign: z.boolean(),
});

export const systemSettingsSchema = z.object({
  /** Persisted hard cap for representative uploads; the 25 MB platform limit still wins. */
  maxUploadMb: z.number().int().min(1).max(25),
});

export type DocumentLinkInput = z.infer<typeof documentLinkSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type TimetableSlotInput = z.infer<typeof timetableSlotSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type MessageModerationInput = z.infer<typeof messageModerationSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type MembershipDecisionInput = z.infer<typeof membershipDecisionSchema>;
export type RepresentativeAssignmentInput = z.infer<typeof representativeAssignmentSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
