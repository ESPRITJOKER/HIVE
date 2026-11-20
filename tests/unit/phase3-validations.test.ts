import { describe, expect, it } from "vitest";
import {
  assignmentSchema,
  classSchema,
  documentLinkSchema,
  documentUploadSchema,
  messageModerationSchema,
  systemSettingsSchema,
  timetableSlotSchema,
  userRoleSchema,
} from "@/lib/validations/phase3";
import { uuidSchema } from "@/lib/validations/common";

const COURSE = "2f6e4b0a-6f5d-4c8e-9b2a-1d3e5f7a9c11";
const USER = "b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("Phase 3 input validation", () => {
  it("rejects non-HTTPS document links", () => {
    expect(documentLinkSchema.safeParse({ title: "Notes", courseId: COURSE, driveUrl: "http://example.com" }).success).toBe(false);
    expect(documentLinkSchema.safeParse({ title: "Notes", courseId: COURSE, driveUrl: "https://example.com" }).success).toBe(true);
  });

  it("rejects unsupported upload types, oversized files and mismatched metadata", () => {
    const base = { title: "Lecture", courseId: COURSE, byteSize: 1024 };
    expect(documentUploadSchema.safeParse({ ...base, fileName: "notes.exe", contentType: "application/x-msdownload" }).success).toBe(false);
    expect(documentUploadSchema.safeParse({ ...base, fileName: "notes.pdf", contentType: "image/png" }).success).toBe(false);
    expect(documentUploadSchema.safeParse({ ...base, fileName: "notes.pdf", contentType: "application/pdf", byteSize: 26 * 1024 * 1024 }).success).toBe(false);
    expect(documentUploadSchema.safeParse({ ...base, fileName: "notes.pdf", contentType: "application/pdf" }).success).toBe(true);
  });

  it("enforces timetable time order and allowed days", () => {
    const base = { courseId: COURSE, subject: "Algorithms", day: "monday", startTime: "10:00", endTime: "12:00", type: "lecture_cm" };
    expect(timetableSlotSchema.safeParse(base).success).toBe(true);
    expect(timetableSlotSchema.safeParse({ ...base, endTime: "09:00" }).success).toBe(false);
    expect(timetableSlotSchema.safeParse({ ...base, day: "funday" }).success).toBe(false);
  });

  it("accepts only known assignment categories", () => {
    expect(assignmentSchema.safeParse({ courseId: COURSE, title: "Task", category: "assignment" }).success).toBe(true);
    expect(assignmentSchema.safeParse({ courseId: COURSE, title: "Task", category: "random" }).success).toBe(false);
  });

  it("keeps moderation state explicit", () => {
    expect(messageModerationSchema.safeParse({ messageId: USER, moderationStatus: "hidden", isIndexed: false }).success).toBe(true);
    expect(messageModerationSchema.safeParse({ messageId: USER, moderationStatus: "published", isIndexed: false }).success).toBe(false);
  });

  it("normalises class codes and rejects short ones", () => {
    expect(classSchema.parse({ name: "CS 2026", code: "cs-2026" }).code).toBe("CS-2026");
    expect(classSchema.safeParse({ name: "CS", code: "ab" }).success).toBe(false);
  });

  it("only accepts the three real roles", () => {
    expect(userRoleSchema.safeParse({ userId: USER, role: "representative" }).success).toBe(true);
    expect(userRoleSchema.safeParse({ userId: USER, role: "superadmin" }).success).toBe(false);
  });

  it("bounds persisted settings to the platform hard cap", () => {
    expect(systemSettingsSchema.safeParse({ maxUploadMb: 25 }).success).toBe(true);
    expect(systemSettingsSchema.safeParse({ maxUploadMb: 26 }).success).toBe(false);
    expect(systemSettingsSchema.safeParse({ maxUploadMb: 0 }).success).toBe(false);
  });

  it("rejects malformed identifiers everywhere they are used", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(documentLinkSchema.safeParse({ title: "Notes", courseId: "bad", driveUrl: "https://example.com" }).success).toBe(false);
  });
});
