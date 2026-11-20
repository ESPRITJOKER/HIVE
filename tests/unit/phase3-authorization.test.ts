import { describe, expect, it } from "vitest";
import type { SessionContext } from "@/lib/permissions/guards";
import {
  canAccessClass,
  canChangeRole,
  canManageClass,
  canModerateClass,
  managedClassIds,
  writeScopeClassIds,
} from "@/features/shared/authorization";

const AUTHORIZED = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

function session(role: SessionContext["role"], overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    email: "member@hive.app",
    fullName: "Member",
    role,
    classIds: [AUTHORIZED],
    assignedClassIds: [],
    ...overrides,
  };
}

describe("Phase 3 class-scoped authorization", () => {
  it("never lets a student manage or moderate any class", () => {
    const student = session("student", { assignedClassIds: [AUTHORIZED] });
    expect(canManageClass(student, AUTHORIZED)).toBe(false);
    expect(canModerateClass(student, AUTHORIZED)).toBe(false);
    expect(managedClassIds(student)).toEqual([]);
    expect(writeScopeClassIds(student)).toEqual([]);
  });

  it("lets representatives write only inside their assigned classes", () => {
    const rep = session("representative", { assignedClassIds: [AUTHORIZED] });
    expect(canManageClass(rep, AUTHORIZED)).toBe(true);
    expect(canManageClass(rep, OTHER)).toBe(false);
    expect(managedClassIds(rep)).toEqual([AUTHORIZED]);
    expect(writeScopeClassIds(rep)).toEqual([AUTHORIZED]);
  });

  it("does not treat a representative's student membership as write access", () => {
    const rep = session("representative", { classIds: [AUTHORIZED], assignedClassIds: [] });
    expect(canManageClass(rep, AUTHORIZED)).toBe(false);
    expect(canAccessClass(rep, AUTHORIZED)).toBe(true);
  });

  it("gives administrators global write scope but not unbounded session arrays", () => {
    const admin = session("administrator");
    expect(writeScopeClassIds(admin)).toBeNull();
    expect(canManageClass(admin, OTHER)).toBe(true);
    expect(canAccessClass(admin, OTHER)).toBe(true);
  });

  it("blocks self role changes for everybody, including administrators", () => {
    const admin = session("administrator");
    expect(canChangeRole(admin, admin.userId)).toBe(false);
    expect(canChangeRole(admin, "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).toBe(true);
    expect(canChangeRole(session("representative"), "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).toBe(false);
    expect(canChangeRole(session("student"), "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")).toBe(false);
  });

  it("uses an empty list rather than null for an unassigned representative (IDOR guard)", () => {
    const rep = session("representative");
    expect(writeScopeClassIds(rep)).toEqual([]);
    expect(canManageClass(rep, AUTHORIZED)).toBe(false);
  });
});
