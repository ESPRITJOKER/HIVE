import { describe, expect, it } from "vitest";
import {
  REMINDER_LABELS,
  categoryLabel,
  dueLabel,
  formatDate,
  formatDateTime,
  formatTime,
  groupedSlots,
  isActiveOpportunity,
  isOpportunity,
  reminderWindow,
  relativeTime,
  slotTypeLabel,
  subjectColor,
} from "@/features/shared/format";

const NOW = new Date("2026-11-20T12:00:00.000Z");

describe("reminderWindow", () => {
  it("buckets deadlines deterministically", () => {
    expect(reminderWindow(null, NOW)).toBe("no-date");
    expect(reminderWindow("not-a-date", NOW)).toBe("no-date");
    expect(reminderWindow("2026-11-20T11:59:00.000Z", NOW)).toBe("overdue");
    expect(reminderWindow("2026-11-20T13:30:00.000Z", NOW)).toBe("h-2");
    expect(reminderWindow("2026-11-21T11:00:00.000Z", NOW)).toBe("d-1");
    expect(reminderWindow("2026-11-23T11:00:00.000Z", NOW)).toBe("d-3");
    expect(reminderWindow("2026-12-01T12:00:00.000Z", NOW)).toBe("upcoming");
  });

  it("uses the exclusive upper edge of each bucket", () => {
    expect(reminderWindow(new Date(NOW.getTime() + 2 * 60 * 60 * 1000).toISOString(), NOW)).toBe("h-2");
    expect(reminderWindow(new Date(NOW.getTime() + 2 * 60 * 60 * 1000 + 1).toISOString(), NOW)).toBe("d-1");
  });
});

describe("dueLabel", () => {
  it("handles missing dates and same-day deadlines", () => {
    expect(dueLabel({ dueDate: null }, NOW)).toBe(REMINDER_LABELS["no-date"]);
    // Use local components for both instants so the expectation is TZ-independent.
    const localNow = new Date(2026, 10, 20, 12, 0, 0);
    const localDeadline = new Date(2026, 10, 20, 15, 45, 0);
    expect(dueLabel({ dueDate: localDeadline.toISOString() }, localNow)).toBe("Today, 15:45");
  });
});

describe("opportunities", () => {
  it("recognises only the four opportunity categories", () => {
    expect(isOpportunity({ category: "hackathon" })).toBe(true);
    expect(isOpportunity({ category: "scholarship" })).toBe(true);
    expect(isOpportunity({ category: "assignment" })).toBe(false);
    expect(isOpportunity({ category: "exam" })).toBe(false);
  });

  it("hides archived and expired opportunities", () => {
    const base = { category: "event" as const, archivedAt: null, dueDate: null };
    expect(isActiveOpportunity(base, NOW)).toBe(true);
    expect(isActiveOpportunity({ ...base, archivedAt: "2026-11-01T00:00:00Z" }, NOW)).toBe(false);
    expect(isActiveOpportunity({ ...base, dueDate: "2026-11-19T12:00:00Z" }, NOW)).toBe(false);
    expect(isActiveOpportunity({ ...base, dueDate: "2026-11-21T12:00:00Z" }, NOW)).toBe(true);
  });
});

describe("groupedSlots", () => {
  it("groups by day and sorts each day by start time", () => {
    const groups = groupedSlots([
      { id: "1", day: "monday", startTime: "14:00", label: "Late" },
      { id: "2", day: "monday", startTime: "09:00", label: "Early" },
      { id: "3", day: "wednesday", startTime: "11:00", label: "Mid" },
    ]);
    expect(groups.map((group) => group.day)).toEqual(["monday", "wednesday"]);
    expect(groups[0]?.label).toBe("Monday");
    expect(groups[0]?.slots.map((slot) => slot.id)).toEqual(["2", "1"]);
  });

  it("returns an empty list when there are no slots", () => {
    expect(groupedSlots([])).toEqual([]);
  });
});

describe("labels and colours", () => {
  it("falls back to the raw value for unknown labels", () => {
    expect(categoryLabel("assignment")).toBe("Assignment");
    expect(slotTypeLabel("lecture_cm")).toBe("Lecture (CM)");
  });

  it("maps a subject to a stable colour", () => {
    expect(subjectColor("Algorithms")).toBe(subjectColor("Algorithms"));
    expect(subjectColor("Algorithms")).toMatch(/^(bg-|border-)/);
  });
});

describe("date/time formatting", () => {
  it("formats times and handles invalid values honestly", () => {
    expect(formatTime("09:30:00")).toBe("09:30");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("bad-date")).toBe("—");
    expect(formatDateTime("2026-11-20T12:00:00Z")).toContain("2026");
  });

  it("renders relative time", () => {
    expect(relativeTime("2026-11-20T12:00:00Z", NOW)).toBe("just now");
    expect(relativeTime("2026-11-20T11:00:00Z", NOW)).toBe("1h ago");
  });
});
