import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { formatDateTime } from "@/features/shared/format";
import { listModerationQueue } from "@/features/representative/services/representative-service";
import { ModerationButtons } from "@/features/representative/components/screens";

export default async function RepresentativeModerationPage() {
  const session = await requireRole(["representative"]);
  const messages = await listModerationQueue(session);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Discussion moderation"
        description="Hide inappropriate messages or mark useful explanations for the AI Notebook. Only messages in your assigned classes are visible."
      />

      {messages.length === 0 ? (
        <EmptyState
          title="No messages to review"
          description="Course discussion messages from your assigned classes will appear here."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-semibold text-foreground">{message.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{message.courseCode}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(message.createdAt)}</span>
                </div>
                <Badge variant={message.status === "indexed" ? "success" : message.status === "hidden" ? "danger" : "neutral"}>
                  {message.status}
                </Badge>
              </div>
              <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              <ModerationButtons messageId={message.id} status={message.status} isIndexed={message.isIndexed} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
