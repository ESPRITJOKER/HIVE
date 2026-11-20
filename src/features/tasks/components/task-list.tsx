"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { categoryLabel, dueLabel, reminderWindow, REMINDER_LABELS } from "@/features/shared/format";
import { TaskToggle } from "./task-toggle";
import type { TaskSummary } from "../services/task-service";

type StatusFilter = "active" | "completed" | "all";

export function TaskList({ tasks, title = "Tasks" }: { tasks: TaskSummary[]; title?: string }) {
  const [status, setStatus] = useState<StatusFilter>("active");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (status === "active" && task.completed) return false;
      if (status === "completed" && !task.completed) return false;
      return !needle || `${task.title} ${task.courseCode}`.toLowerCase().includes(needle);
    });
  }, [tasks, status, query]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title={`No ${title.toLowerCase()} yet`}
        description="Items published by your representatives will appear here."
      />
    );
  }

  return (
    <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <Input
          aria-label={`Search ${title.toLowerCase()}`}
          placeholder={`Search ${title.toLowerCase()}…`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      {(["active", "completed", "all"] as const).map((value) => (
        <TabsContent key={value} value={value} className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState title="Nothing here" description="Try a different filter or search term." />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {filtered.map((task) => {
                const urgent = !task.completed && ["overdue", "h-2", "d-1"].includes(reminderWindow(task.dueDate));
                return (
                  <li key={task.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-secondary">
                      <ClipboardList className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/student/assignments/${task.id}`} className="font-semibold hover:underline">
                        {task.title}
                      </Link>
                      <p className="text-xs text-muted">
                        {task.courseCode} · {categoryLabel(task.category)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={urgent ? "danger" : task.completed ? "success" : "neutral"}>
                        {task.completed ? "Done" : REMINDER_LABELS[reminderWindow(task.dueDate)]}
                      </Badge>
                      <span className="text-xs text-muted">{dueLabel(task)}</span>
                      <TaskToggle taskId={task.id} completed={task.completed} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
