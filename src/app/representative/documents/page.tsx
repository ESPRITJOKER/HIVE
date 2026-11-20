import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { EmptyState } from "@/components/ui/states";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { formatDate } from "@/features/shared/format";
import { listCourseOptions, listDocuments } from "@/features/representative/services/representative-service";
import { deleteDocumentAction } from "@/features/representative/actions/representative-actions";
import {
  DocumentStatusBadge,
  LinkDocumentForm,
  UploadDocumentForm,
} from "@/features/representative/components/screens";

export default async function RepresentativeDocumentsPage() {
  const session = await requireRole(["representative"]);
  const [documents, courses] = await Promise.all([
    listDocuments(session),
    listCourseOptions(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Documents"
        description="Upload official material or link an external reference. Processing status is written by the backend, never by this screen."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <UploadDocumentForm courses={courses} />
        <LinkDocumentForm courses={courses} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Class documents</h2>
        {documents.length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Uploaded files and references for your assigned courses will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Added</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{document.title}</p>
                      {document.error ? <p className="text-xs text-danger">{document.error}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{document.courseCode}</td>
                    <td className="px-4 py-3"><DocumentStatusBadge status={document.status} /></td>
                    <td className="px-4 py-3 text-muted">{formatDate(document.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmActionButton
                        action={deleteDocumentAction}
                        input={{ documentId: document.id }}
                        label="Delete"
                        variant="ghost"
                        confirm={`Delete "${document.title}"? This also removes the stored file.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
