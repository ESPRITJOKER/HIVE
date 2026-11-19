import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date for display without leaking timezone surprises. */
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", options ?? { dateStyle: "medium" }).format(
    typeof value === "string" ? new Date(value) : value,
  );
}

/** Format a due date with a human-readable relative hint. */
export function formatDeadline(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);

  if (diff < 0) return `Overdue · ${formatDate(date)}`;
  if (days === 0) return `Due today · ${formatDate(date, { timeStyle: "short" })}`;
  if (days === 1) return `Due tomorrow · ${formatDate(date, { timeStyle: "short" })}`;
  if (days <= 7) return `Due in ${days} days · ${formatDate(date)}`;
  return formatDate(date);
}

/** Deterministic pastel colour from an arbitrary string (used for subject chips). */
export function stableHue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}
