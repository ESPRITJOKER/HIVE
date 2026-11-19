import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { paginationSchema, sanitizeText } from "@/lib/validations/common";

describe("authentication validation", () => {
  it("rejects invalid login input", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success).toBe(true);
  });

  it("requires matching passwords on registration", () => {
    const base = {
      fullName: "Ada Lovelace",
      email: "ada@university.edu",
      password: " Analyst2026",
      classCode: "HIVE-DEMO",
    };
    expect(registerSchema.safeParse({ ...base, confirmPassword: "different1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirmPassword: base.password }).success).toBe(true);
  });

  it("enforces password strength", () => {
    const result = resetPasswordSchema.safeParse({ password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range pagination rather than silently clamping it", () => {
    expect(paginationSchema.safeParse({ page: 0, pageSize: 1000 }).success).toBe(false);
    expect(paginationSchema.parse({ page: "2", pageSize: "20" })).toEqual({ page: 2, pageSize: 20 });
  });

  it("strips control characters from user text", () => {
    expect(sanitizeText("hello\u0007world ")).toBe("helloworld");
  });
});
