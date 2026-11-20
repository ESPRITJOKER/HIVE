import { DAY_LABELS, DAY_ORDER, TASK_CATEGORY_LABELS, SLOT_TYPE_LABELS } from "@/lib/constants";
import type { TaskEventCategory, TimetableSlotType } from "@/types/domain";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type ReminderWindow = "overdue" | "h-2" | "d-1" | "d-3" | "upcoming" | "no-date";

export const REMINDER_LABELS: Record<ReminderWindow, string> = {
  overdue: "Overdue",
  "h-2": "Due within 2 hours",
  "d-1": "Due within 24 hours",
  "d-3": "Due within 3 days",
  upcoming: "Upcoming",
  "no-date": "No deadline",
};

/** Deterministic reminder buckets used by the personal task tracker. */
export function reminderWindow(dueDate: string | null, now: Date = new Date()): ReminderWindow {
  if (!dueDate) return "no-date";
  const timestamp = new Date(dueDate).getTime();
  if (Number.isNaN(timestamp)) return "no-date";
  const remaining = timestamp - now.getTime();
  if (remaining < 0) return "overdue";
  if (remaining <= 2 * HOUR) return "h-2";
  if (remaining <= DAY) return "d-1";
  if (remaining <= 3 * DAY) return "d-3";
  return "upcoming";
}

export const REMINDER_PRIORITY: Record<ReminderWindow, number> = {
  overdue: 0,
  "h-2": 1,
  "d-1": 2,
  "d-3": 3,
  upcoming: 4,
  "no-date": 5,
};

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", options ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | null): string {
  return formatDate(value, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Postgres `time` values arrive as HH:MM:SS — slice to HH:MM for display. */
export function formatTime(value: string): string {
  return value.slice(0, 5);
}

export function relativeTime(value: string, now: Date = new Date()): string {
  const delta = now.getTime() - new Date(value).getTime();
  if (Number.isNaN(delta)) return "—";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value, { day: "numeric", month: "short" });
}

export function dueLabel(task: { dueDate: string | null }, now: Date = new Date()): string {
  const window = reminderWindow(task.dueDate, now);
  if (window === "no-date") return REMINDER_LABELS[window];
  const date = new Date(task.dueDate as string);
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Today, ${formatTime(date.toTimeString().slice(0, 8))}`;
  return formatDateTime(task.dueDate);
}

export function categoryLabel(category: TaskEventCategory): string {
  return TASK_CATEGORY_LABELS[category] ?? category;
}

export function slotTypeLabel(type: TimetableSlotType): string {
  return SLOT_TYPE_LABELS[type] ?? type;
}

const SUBJECT_PALETTE = [
  "bg-primary/15 text-secondary border-primary/40",
  "bg-accent/20 text-foreground border-accent/50",
  "bg-info/15 text-info border-info/40",
  "bg-success/15 text-success border-success/40",
  "bg-warning/15 text-warning border-warning/40",
] as const;

/** Stable colour per subject so the timetable stays consistent across views. */
export function subjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i += 1) hash = (hash * 31 + subject.charCodeAt(i)) | 0;
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length] ?? SUBJECT_PALETTE[0];
}

export function groupedSlots<T extends { day: string; startTime: string }>(
  slots: T[],
): Array<{ day: string; label: string; slots: T[] }> {
  return DAY_ORDER.map((day) => ({
    day,
    label: DAY_LABELS[day] ?? day,
    slots: slots
      .filter((slot) => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((group) => group.slots.length > 0);
}

const OPPORTUNITY_CATEGORIES: readonly TaskEventCategory[] = ["hackathon", "internship", "scholarship", "event"];

export function isOpportunity(task: { category: TaskEventCategory }): boolean {
  return OPPORTUNITY_CATEGORIES.includes(task.category);
}

/** Archived rows and rows whose deadline has passed are hidden automatically. */
export function isActiveOpportunity(
  task: { category: TaskEventCategory; archivedAt: string | null; dueDate: string | null },
  now: Date = new Date(),
): boolean {
  if (!isOpportunity(task) || task.archivedAt) return false;
  if (!task.dueDate) return true;
  const deadline = new Date(task.dueDate).getTime();
  return !Number.isNaN(deadline) && deadline >= now.getTime();
}

export const OPPORTUNITY_CATEGORY_OPTIONS = OPPORTUNITY_CATEGORIES.map((value) => ({
  value,
  label: categoryLabel(value),
}));
