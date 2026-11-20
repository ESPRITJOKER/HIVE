import type { Role } from "@/types/domain";
import {
  Bell,
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
        item("Courses", "/student/courses", BookOpen, true),
        item("Documents", "/student/documents", FileText, true),
        item("Timetable", "/student/timetable", CalendarDays, true),
        item("Assignments", "/student/assignments", ClipboardList, true),
        item("My tasks", "/student/tasks", ClipboardList, true),
        item("Opportunities", "/student/opportunities", Trophy, true),
      ],
    },
    {
      title: "Learn",
      items: [
        item("Discussions", "/student/discussions", MessageSquare, true),
        item("HIVE AI", "/student/ai", Sparkles),
        item("Revision sheets", "/student/revision", GraduationCap),
        item("Quizzes", "/student/quizzes", ClipboardList),
      ],
    },
    {
      title: "Account",
      items: [
        item("Notifications", "/student/notifications", Bell, true),
        item("Saved resources", "/student/saved", FileText, true),
        item("Settings", "/student/settings", Settings, true),
      ],
    },
  ],
  representative: [
    {
      title: "Workspace",
      items: [
        item("Dashboard", "/representative/dashboard", LayoutDashboard, true),
        item("Class overview", "/representative/class", Users, true),
        item("Students", "/representative/students", Users),
        item("Documents", "/representative/documents", FileText, true),
        item("Courses", "/representative/courses", BookOpen),
        item("Timetable", "/representative/timetable", CalendarDays, true),
      ],
    },
    {
      title: "Manage",
      items: [
        item("Assignments", "/representative/assignments", ClipboardList, true),
        item("Announcements", "/representative/announcements", MessageSquare),
        item("Opportunities", "/representative/opportunities", Trophy),
        item("Moderation", "/representative/moderation", ShieldCheck, true),
        item("Class activity", "/representative/notebook", Sparkles, true),
      ],
    },
  ],
  administrator: [
    {
      title: "Supervision",
      items: [
        item("Dashboard", "/admin/dashboard", LayoutDashboard, true),
        item("Users", "/admin/users", Users, true),
        item("Classes", "/admin/classes", GraduationCap, true),
        item("Roles & permissions", "/admin/roles", ShieldCheck),
      ],
    },
    {
      title: "System",
      items: [
        item("AI usage", "/admin/ai-monitoring", Sparkles, true),
        item("Storage", "/admin/storage", FileText),
        item("Audit logs", "/admin/audit", ClipboardList, true),
        item("Settings", "/admin/settings", Settings, true),
      ],
    },
  ],
};

export function flattenNavigation(role: Role): NavItem[] {
  return NAVIGATION[role].flatMap((section) => section.items);
}
