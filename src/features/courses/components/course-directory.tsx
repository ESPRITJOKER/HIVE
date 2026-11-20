"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, FileText, ListChecks, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import type { CourseSummary } from "../services/course-service";

/** Stable solid tile colour per course code, so a course looks the same everywhere. */
const TILES = ["bg-primary", "bg-info", "bg-success", "bg-accent", "bg-secondary"] as const;
function tileFor(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  return TILES[Math.abs(hash) % TILES.length] ?? TILES[0];
}

export function CourseDirectory({ courses }: { courses: CourseSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((course) =>
      `${course.code} ${course.title} ${course.description ?? ""}`.toLowerCase().includes(needle),
    );
  }, [courses, query]);

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses yet"
        description="Courses appear here once your class representative publishes them."
      />
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex h-11 items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 focus-within:border-secondary">
        <Search className="size-4 text-muted" aria-hidden="true" />
        <input
          aria-label="Search courses"
          placeholder="Search by code, title or description…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
        />
      </label>

      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="group flex items-center gap-3.5 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-secondary/50"
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-sm",
                  tileFor(course.code),
                )}
              >
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-bold">{course.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                  <span className="font-semibold text-secondary">{course.code}</span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3.5" aria-hidden="true" /> {course.documentCount} resources
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3.5" aria-hidden="true" /> {course.taskCount} tasks
                  </span>
                </p>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
