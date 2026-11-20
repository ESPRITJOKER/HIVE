import Link from "next/link";
import { FileText } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listSavedResources } from "@/features/resources/services/saved-resources-service";
import { RemoveSavedButton } from "@/features/resources/components/remove-saved-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/features/shared/format";

export default async function StudentSavedPage() {
  const session = await requireRole(["student"]);
  const resources = await listSavedResources(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Saved resources"
        description="Documents you bookmarked for later. Only you can see this list."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {resources.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Bookmark documents from the library to keep them here."
          action={
            <Link href="/student/documents" className="text-sm font-semibold text-secondary hover:underline">
              Browse documents →
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {resources.map((resource) => (
            <li key={resource.savedId} className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-secondary">
                <FileText className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/student/documents/${resource.documentId}`} className="font-semibold hover:underline">
                  {resource.title}
                </Link>
                <p className="text-xs text-muted">
                  {resource.courseCode} · Saved {formatDate(resource.savedAt)}
                </p>
              </div>
              <Badge variant="neutral">{resource.status}</Badge>
              <RemoveSavedButton documentId={resource.documentId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
