import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS, hasPermission, hasRole, HOME_PATH, roleLabel } from "@/lib/permissions/roles";

describe("role-based permissions", () => {
  it("never grants administrative permissions to students or representatives", () => {
    const adminOnly = ["users:manage", "roles:manage", "audit:read", "settings:manage"] as const;
    for (const permission of adminOnly) {
      expect(hasPermission("student", permission)).toBe(false);
      expect(hasPermission("representative", permission)).toBe(false);
      expect(hasPermission("administrator", permission)).toBe(true);
    }
  });

  it("does not let students upload documents, publish timetables or manage assignments", () => {
    expect(hasPermission("student", "documents:upload")).toBe(false);
    expect(hasPermission("student", "timetable:publish")).toBe(false);
    expect(hasPermission("student", "assignments:manage")).toBe(false);
    expect(hasPermission("student", "discussions:moderate")).toBe(false);
    expect(hasPermission("student", "ai:generate_shared")).toBe(false);
  });

  it("grants representatives class-management powers but not admin powers", () => {
    expect(hasPermission("representative", "documents:upload")).toBe(true);
    expect(hasPermission("representative", "timetable:publish")).toBe(true);
    expect(hasPermission("representative", "assignments:manage")).toBe(true);
    expect(hasPermission("representative", "discussions:index")).toBe(true);
    expect(hasPermission("representative", "users:manage")).toBe(false);
  });

  it("denies all permissions when no role is present", () => {
    expect(hasPermission(null, "documents:read")).toBe(false);
    expect(hasPermission(undefined, "ai:use")).toBe(false);
    expect(hasRole(null, ["student"])).toBe(false);
  });

  it("maps each role to its own home path", () => {
    expect(new Set(Object.values(HOME_PATH)).size).toBe(3);
    expect(HOME_PATH.student).toBe("/student/dashboard");
    expect(HOME_PATH.representative).toBe("/representative/dashboard");
    expect(HOME_PATH.administrator).toBe("/admin/dashboard");
  });

  it("has a distinct permission set for every role", () => {
    const serialized = Object.values(ROLE_PERMISSIONS).map((list) => [...list].sort().join(","));
    expect(new Set(serialized).size).toBe(3);
    expect(roleLabel("student")).toBe("Student");
  });
});
