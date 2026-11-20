"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { DAY_LABELS, DAY_ORDER } from "@/lib/constants";
import { formatTime, slotTypeLabel, subjectColor } from "@/features/shared/format";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import type { TimetableSlotType } from "@/types/domain";

export interface TimetableSlotView {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  courseCode: string;
  type: TimetableSlotType;
  room: string | null;
}

const hourOf = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h) + Number(m) / 60;
};

export function WeekTimetable({ slots }: { slots: TimetableSlotView[] }) {
  const [view, setView] = React.useState<"Week" | "Day">("Week");
  const [dayIndex, setDayIndex] = React.useState(0);

  if (slots.length === 0) {
    return (
      <EmptyState
        title="No timetable yet"
        description="Weekly schedule slots will appear here once your representative publishes them."
      />
    );
  }

  // Days that actually have sessions (keep weekday order).
  const activeDays = DAY_ORDER.filter((d) => slots.some((s) => s.day === d));
  const days: string[] = activeDays.length ? [...activeDays] : [...DAY_ORDER.slice(0, 5)];

  const starts = slots.map((s) => Math.floor(hourOf(s.startTime)));
  const ends = slots.map((s) => Math.ceil(hourOf(s.endTime)));
  const base = Math.min(8, ...starts);
  const top = Math.max(18, ...ends);
  const hours = Array.from({ length: top - base }, (_, i) => base + i);
  const ROW = 60;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="size-4 text-secondary" aria-hidden="true" />
          <span className="font-semibold text-foreground">This week</span>
        </div>
        <div className="flex rounded-lg border border-border bg-surface p-0.5">
          {(["Week", "Day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                view === v ? "bg-primary text-white" : "text-muted hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "Week" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface p-3">
          <div style={{ minWidth: `${80 + days.length * 120}px` }}>
            <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
              <div />
              {days.map((d) => (
                <div key={d} className="pb-2 text-center text-xs font-bold">
                  {DAY_LABELS[d]?.slice(0, 3) ?? d}
                </div>
              ))}
            </div>
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
                gridTemplateRows: `repeat(${hours.length}, ${ROW}px)`,
              }}
            >
              {hours.map((h, i) => (
                <div key={h} className="-translate-y-2 text-[11px] text-muted" style={{ gridColumn: 1, gridRow: i + 1 }}>
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
              {hours.map((_, ri) =>
                days.map((_, ci) => (
                  <div key={`${ri}-${ci}`} className="border-l border-t border-border/50" style={{ gridColumn: ci + 2, gridRow: ri + 1 }} />
                )),
              )}
              {slots.map((s) => {
                const ci = days.indexOf(s.day);
                if (ci < 0) return null;
                const rowStart = Math.round(hourOf(s.startTime) - base) + 1;
                const span = Math.max(1, Math.round(hourOf(s.endTime) - hourOf(s.startTime)));
                return (
                  <div
                    key={s.id}
                    className={cn("m-1 overflow-hidden rounded-lg border p-2 text-[11px] leading-tight", subjectColor(s.subject))}
                    style={{ gridColumn: ci + 2, gridRow: `${rowStart} / span ${span}` }}
                  >
                    <div className="truncate font-bold">{s.subject}</div>
                    <div className="truncate opacity-80">{slotTypeLabel(s.type)}{s.room ? ` · ${s.room}` : ""}</div>
                    <div className="mt-0.5 opacity-70">{formatTime(s.startTime)}–{formatTime(s.endTime)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {days.map((d, i) => (
              <button
                key={d}
                onClick={() => setDayIndex(i)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  dayIndex === i ? "bg-primary text-white" : "border border-border bg-surface text-muted hover:text-foreground",
                )}
              >
                {DAY_LABELS[d]?.slice(0, 3) ?? d}
              </button>
            ))}
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {slots
              .filter((s) => s.day === days[dayIndex])
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4">
                  <span className="w-20 shrink-0 text-sm font-semibold tabular-nums text-muted">{formatTime(s.startTime)}</span>
                  <span className={cn("h-10 w-1 shrink-0 rounded-full border", subjectColor(s.subject))} />
                  <div className="min-w-0">
                    <div className="font-bold">{s.subject}</div>
                    <div className="text-xs text-muted">{slotTypeLabel(s.type)}{s.room ? ` · ${s.room}` : ""}</div>
                  </div>
                </div>
              ))}
            {slots.filter((s) => s.day === days[dayIndex]).length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">No sessions on this day.</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
