import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, FileWarning } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { getDocument, signedDocumentUrl } from "@/features/documents/services/document-service";
import { isDocumentSaved } from "@/features/resources/services/saved-resources-service";
import { SaveDocumentButton } from "@/features/resources/components/save-document-button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/features/shared/format";

export default async function StudentDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["student"]);
  const { id } = await params;
  const document = await getDocument(session, id);
  if (!document) notFound();

  const [signedUrl, saved] = await Promise.all([
    document.hasFile && document.filePath ? signedDocumentUrl(document.filePath) : Promise.resolve(null),
    isDocumentSaved(session, id),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/student/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden="true" /> Document library
      </Link>

      <PageHeader
        eyebrow={`${document.courseCode} · ${document.courseTitle}`}
        title={document.title}
        description={`Version ${document.version} · Added ${formatDateTime(document.createdAt)}`}
        actions={
          <>
            <Badge variant={document.status === "indexed" ? "success" : document.status === "failed" ? "danger" : "warning"}>
              {DOCUMENT_STATUS_LABELS[document.status] ?? document.status}
            </Badge>
            <SaveDocumentButton documentId={document.id} saved={saved} />
          </>
        }
      />

      {document.status === "failed" && document.errorMessage ? (
        <div role="status" className="flex gap-3 rounded-md border border-danger/40 bg-danger/10 p-4 text-sm">
          <FileWarning className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <p className="font-semibold text-danger">This document could not be processed</p>
            <p className="text-xs text-muted">{document.errorMessage}</p>
          </div>
        </div>
      ) : null}

      <Card className="glass">
        <CardHeader>
          <CardTitle>View document</CardTitle>
          <CardDescription>
            Files are served through short-lived signed links. AI answers cite only indexed material.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {signedUrl ? (
            <>
              <iframe
                src={signedUrl}
                title={`Preview of ${document.title}`}
                className="h-[min(70vh,42rem)] w-full rounded-md border border-border bg-white"
              />
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
              >
                <Download className="size-3.5" aria-hidden="true" /> Open in a new tab
              </a>
            </>
          ) : document.hasExternalLink && document.driveUrl ? (
            <a
              href={document.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-semibold hover:bg-border/30"
            >
              <ExternalLink className="size-4" aria-hidden="true" /> Open source document
            </a>
          ) : (
            <p className="text-sm text-muted">
              No preview is available for this document yet. If it is still processing, check back shortly.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
