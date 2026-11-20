"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/features/shared/format";
import { SaveDocumentButton } from "@/features/resources/components/save-document-button";
import type { DocumentSummary } from "../services/document-service";

type StatusVariant = "neutral" | "success" | "warning" | "danger" | "info";

function statusVariant(status: string): StatusVariant {
  if (status === "indexed") return "success";
  if (status === "failed") return "danger";
  if (status === "uploaded") return "warning";
  return "info";
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
        <Input
          aria-label="Search documents"
          placeholder="Search documents…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
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
            <li key={document.id} className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-secondary">
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
