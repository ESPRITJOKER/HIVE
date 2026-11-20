"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FileText, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import type { CourseSummary } from "../services/course-service";

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
      <Input
        aria-label="Search courses"
        placeholder="Search by code, title or description…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Try a different search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="glass flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="info">{course.code}</Badge>
                  <BookOpen className="size-4 text-muted" aria-hidden="true" />
                </div>
                <CardTitle className="mt-2">
                  <Link href={`/student/courses/${course.id}`} className="hover:underline">
                    {course.title}
                  </Link>
                </CardTitle>
                {course.description ? (
                  <p className="line-clamp-2 text-sm text-muted">{course.description}</p>
                ) : null}
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between gap-3 pt-0">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="size-3.5" aria-hidden="true" />
                    {course.documentCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3.5" aria-hidden="true" />
                    {course.taskCount}
                  </span>
                </div>
                <Link
                  href={`/student/courses/${course.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
                  aria-label={`Open ${course.title}`}
                >
                  Open <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
