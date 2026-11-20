"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/features/shared/format";
import { cn } from "@/lib/utils";
import { SaveDocumentButton } from "@/features/resources/components/save-document-button";
import type { DocumentSummary } from "../services/document-service";

type StatusVariant = "neutral" | "success" | "warning" | "danger" | "info";

function statusVariant(status: string): StatusVariant {
  if (status === "indexed") return "success";
  if (status === "failed") return "danger";
  if (status === "uploaded") return "warning";
  return "info";
}

/** Tile tint mirrors the document's indexing state at a glance. */
function tileTint(status: string): string {
  if (status === "indexed") return "bg-success/12 text-success";
  if (status === "failed") return "bg-danger/15 text-danger";
  if (status === "uploaded") return "bg-warning/15 text-warning";
  return "bg-info/12 text-info";
}

export function DocumentLibrary({
  documents,
  savedIds,
}: {
  documents: DocumentSummary[];
  savedIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");

  const courses = useMemo(
    () => [...new Map(documents.map((document) => [document.courseId, document.courseCode])).entries()],
    [documents],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((document) => {
      if (course !== "all" && document.courseId !== course) return false;
      return !needle || `${document.title} ${document.courseCode}`.toLowerCase().includes(needle);
    });
  }, [documents, query, course]);

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Study documents will appear here once your representative publishes them."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_minmax(10rem,14rem)]">
        <label className="flex h-10 items-center gap-2.5 rounded-md border border-border bg-surface px-3 focus-within:border-secondary">
          <Search className="size-4 text-muted" aria-hidden="true" />
          <input
            aria-label="Search documents"
            placeholder="Search documents…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
        </label>
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
        <EmptyState title="No matches" description="Try a different search or course filter." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {filtered.map((document) => (
            <li key={document.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-raised">
              <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tileTint(document.status))}>
                <FileText className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/student/documents/${document.id}`} className="font-semibold hover:underline">
                  {document.title}
                </Link>
                <p className="text-xs text-muted">
                  {document.courseCode} · v{document.version} · {formatDate(document.createdAt)}
                </p>
              </div>
              <Badge variant={statusVariant(document.status)}>
                {DOCUMENT_STATUS_LABELS[document.status] ?? document.status}
              </Badge>
              <SaveDocumentButton documentId={document.id} saved={savedIds.includes(document.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
