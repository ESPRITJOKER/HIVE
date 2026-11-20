import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listDocuments } from "@/features/documents/services/document-service";
import { savedDocumentIds } from "@/features/resources/services/saved-resources-service";
import { DocumentLibrary } from "@/features/documents/components/document-library";

export default async function StudentDocumentsPage() {
  const session = await requireRole(["student"]);
  const [documents, savedIds] = await Promise.all([
    listDocuments(session),
    savedDocumentIds(session),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Document library"
        description="Study material shared across your courses. Bookmark anything you want to revisit."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}
      <DocumentLibrary documents={documents} savedIds={savedIds} />
    </div>
  );
}
