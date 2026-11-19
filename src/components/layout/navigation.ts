import type { Role } from "@/types/domain";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** false = roadmap item, rendered disabled with an explicit "Soon" badge. */
  available: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const item = (label: string, href: string, icon: NavItem["icon"], available = false): NavItem => ({
  label,
  href,
  icon,
  available,
});

export const NAVIGATION: Record<Role, NavSection[]> = {
  student: [
    {
      title: "Workspace",
      items: [
        item("Dashboard", "/student/dashboard", LayoutDashboard, true),
        item("Courses", "/student/courses", BookOpen),
        item("Documents", "/student/documents", FileText),
        item("Timetable", "/student/timetable", CalendarDays),
        item("Assignments", "/student/assignments", ClipboardList),
        item("Opportunities", "/student/opportunities", Trophy),
      ],
    },
    {
      title: "Learn",
      items: [
        item("Discussions", "/student/discussions", MessageSquare),
        item("HIVE AI", "/student/ai", Sparkles),
        item("Revision sheets", "/student/revision", GraduationCap),
        item("Quizzes", "/student/quizzes", ClipboardList),
      ],
    },
    {
      title: "Account",
      items: [
        item("Saved resources", "/student/saved", FileText),
        item("Settings", "/student/settings", Settings),
      ],
    },
  ],
  representative: [
    {
      title: "Workspace",
      items: [
        item("Dashboard", "/representative/dashboard", LayoutDashboard, true),
        item("Class overview", "/representative/class", Users),
        item("Students", "/representative/students", Users),
        item("Documents", "/representative/documents", FileText),
        item("Courses", "/representative/courses", BookOpen),
        item("Timetable", "/representative/timetable", CalendarDays),
      ],
    },
    {
      title: "Manage",
      items: [
        item("Assignments", "/representative/assignments", ClipboardList),
        item("Announcements", "/representative/announcements", MessageSquare),
        item("Opportunities", "/representative/opportunities", Trophy),
        item("Moderation", "/representative/moderation", ShieldCheck),
        item("AI Notebook", "/representative/notebook", Sparkles),
      ],
    },
  ],
  administrator: [
    {
      title: "Supervision",
      items: [
        item("Dashboard", "/admin/dashboard", LayoutDashboard, true),
        item("Users", "/admin/users", Users),
        item("Classes", "/admin/classes", GraduationCap),
        item("Roles & permissions", "/admin/roles", ShieldCheck),
      ],
    },
    {
      title: "System",
      items: [
        item("AI usage", "/admin/ai-monitoring", Sparkles),
        item("Storage", "/admin/storage", FileText),
        item("Audit logs", "/admin/audit", ClipboardList),
        item("Settings", "/admin/settings", Settings),
      ],
    },
  ],
};

export function flattenNavigation(role: Role): NavItem[] {
  return NAVIGATION[role].flatMap((section) => section.items);
}
