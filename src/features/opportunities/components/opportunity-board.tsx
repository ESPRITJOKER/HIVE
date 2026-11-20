"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  CalendarDays,
  Code2,
  Search,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { categoryLabel, dueLabel, OPPORTUNITY_CATEGORY_OPTIONS } from "@/features/shared/format";
import type { TaskSummary } from "@/features/tasks/services/task-service";
import type { TaskEventCategory } from "@/types/domain";

const CATEGORY_META: Record<string, { icon: LucideIcon; tile: string; chip: string }> = {
  hackathon: { icon: Code2, tile: "bg-primary", chip: "bg-primary/12 text-secondary" },
  internship: { icon: Briefcase, tile: "bg-success", chip: "bg-success/12 text-success" },
  scholarship: { icon: Award, tile: "bg-accent", chip: "bg-accent/15 text-accent" },
  event: { icon: CalendarDays, tile: "bg-info", chip: "bg-info/12 text-info" },
};
const FALLBACK = { icon: Trophy, tile: "bg-secondary", chip: "bg-primary/12 text-secondary" };

export function OpportunityBoard({ opportunities }: { opportunities: TaskSummary[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  const courses = useMemo(
    () => [...new Map(opportunities.map((item) => [item.courseId, item.courseCode])).entries()],
    [opportunities],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return opportunities.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (course !== "all" && item.courseId !== course) return false;
      return !needle || `${item.title} ${item.description ?? ""}`.toLowerCase().includes(needle);
    });
  }, [opportunities, category, course, query]);

  if (opportunities.length === 0) {
    return (
      <EmptyState
        title="No open opportunities"
        description="Hackathons, internships, scholarships and events posted by your representatives will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex h-10 items-center gap-2.5 rounded-md border border-border bg-surface px-3 focus-within:border-secondary">
          <Search className="size-4 text-muted" aria-hidden="true" />
          <input
            aria-label="Search opportunities"
            placeholder="Search opportunities…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
        </label>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
        >
          <option value="all">All categories</option>
          {OPPORTUNITY_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          aria-label="Filter by course"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
        >
          <option value="all">All courses</option>
          {courses.map(([id, code]) => (
            <option key={id} value={id}>{code}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try clearing a filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const meta = CATEGORY_META[item.category as TaskEventCategory] ?? FALLBACK;
            const Icon = meta.icon;
            return (
              <Card key={item.id} className="glass flex flex-col transition-colors hover:border-secondary/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                        meta.chip,
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {categoryLabel(item.category)}
                    </span>
                    <span className="text-xs text-muted">{item.courseCode}</span>
                  </div>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  {item.description ? (
                    <p className="line-clamp-3 text-sm text-muted">{item.description}</p>
                  ) : null}
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between gap-2 pt-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {dueLabel(item)}
                  </span>
                  <Link
                    href={`/student/opportunities/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                  >
                    Details <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
