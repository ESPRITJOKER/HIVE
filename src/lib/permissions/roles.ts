import type { Role } from "@/types/domain";

export const ROLES: readonly Role[] = ["student", "representative", "administrator"] as const;

export const HOME_PATH: Record<Role, string> = {
  student: "/student/dashboard",
  representative: "/representative/dashboard",
  administrator: "/admin/dashboard",
};

export type Permission =
  | "documents:read"
  | "documents:upload"
  | "documents:delete"
  | "courses:manage"
  | "timetable:read"
  | "timetable:publish"
  | "assignments:read"
  | "assignments:manage"
  | "opportunities:read"
  | "opportunities:manage"
  | "discussions:read"
  | "discussions:moderate"
  | "discussions:index"
  | "ai:use"
  | "ai:generate_shared"
  | "ai:monitor"
  | "quizzes:take"
  | "quizzes:generate"
  | "tasks:track_own"
  | "notifications:own"
  | "profile:own"
  | "users:manage"
  | "roles:manage"
  | "classes:manage"
  | "audit:read"
  | "settings:manage"
  | "storage:monitor";

const studentPermissions: Permission[] = [
  "documents:read",
  "timetable:read",
  "assignments:read",
  "opportunities:read",
  "discussions:read",
  "ai:use",
  "quizzes:take",
  "tasks:track_own",
  "notifications:own",
  "profile:own",
];

const representativePermissions: Permission[] = [
  ...studentPermissions,
  "documents:upload",
  "documents:delete",
  "courses:manage",
  "timetable:publish",
  "assignments:manage",
  "opportunities:manage",
  "discussions:moderate",
  "discussions:index",
  "ai:generate_shared",
  "quizzes:generate",
];

const administratorPermissions: Permission[] = [
  ...representativePermissions,
  "ai:monitor",
  "users:manage",
  "roles:manage",
  "classes:manage",
  "audit:read",
  "settings:manage",
  "storage:monitor",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  student: studentPermissions,
  representative: representativePermissions,
  administrator: administratorPermissions,
};

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Strict role check. Roles are intentionally not hierarchical for admin powers. */
export function hasRole(role: Role | null | undefined, allowed: readonly Role[]): boolean {
  return Boolean(role && allowed.includes(role));
}

export function roleLabel(role: Role): string {
  return {
    student: "Student",
    representative: "Class Representative",
    administrator: "Administrator",
  }[role];
}
