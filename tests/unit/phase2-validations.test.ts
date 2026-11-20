import { describe, expect, it } from "vitest";
import {
  messageSchema,
  notificationUpdateSchema,
  profileUpdateSchema,
  savedResourceSchema,
  taskStateSchema,
} from "@/lib/validations/phase2";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("Phase 2 mutation validation", () => {
  it("requires a valid task id and boolean completion state", () => {
    expect(taskStateSchema.safeParse({ taskId: UUID, completed: true }).success).toBe(true);
    expect(taskStateSchema.safeParse({ taskId: "not-a-uuid", completed: true }).success).toBe(false);
    expect(taskStateSchema.safeParse({ taskId: UUID, completed: "yes" }).success).toBe(false);
  });

  it("rejects empty and oversized messages and strips control characters", () => {
    expect(messageSchema.safeParse({ channelId: UUID, content: "   " }).success).toBe(false);
    expect(messageSchema.safeParse({ channelId: UUID, content: "x".repeat(10_001) }).success).toBe(false);
    const parsed = messageSchema.safeParse({ channelId: UUID, content: "hello\u0007 world" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.content).toBe("hello world");
  });

  it("validates notification selections", () => {
    expect(notificationUpdateSchema.safeParse({ ids: [], read: true }).success).toBe(false);
    expect(notificationUpdateSchema.safeParse({ ids: [UUID], read: true }).success).toBe(true);
    expect(notificationUpdateSchema.safeParse({ ids: ["bad"], read: false }).success).toBe(false);
  });

  it("validates saved-resource toggles", () => {
    expect(savedResourceSchema.safeParse({ documentId: UUID, save: true }).success).toBe(true);
    expect(savedResourceSchema.safeParse({ documentId: "bad", save: false }).success).toBe(false);
  });

  it("validates and sanitizes display names", () => {
    expect(profileUpdateSchema.safeParse({ fullName: "" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ fullName: "x".repeat(121) }).success).toBe(false);
    const parsed = profileUpdateSchema.safeParse({ fullName: "  Ada\u0007 Lovelace  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.fullName).toBe("Ada Lovelace");
  });
});
