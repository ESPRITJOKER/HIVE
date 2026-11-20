import Link from "next/link";
import { Hash, MessageSquare } from "lucide-react";
import { requireRole } from "@/lib/permissions/guards";
import { PageHeader } from "@/components/shared/page-header";
import { ConfigNotice } from "@/features/authentication/components/config-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { listChannels, listMessages } from "@/features/discussions/services/discussion-service";
import { DiscussionRoom } from "@/features/discussions/components/discussion-room";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";

export default async function StudentDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const session = await requireRole(["student"]);
  const { channel: requested } = await searchParams;
  const channels = await listChannels(session);

  const active = channels.find((channel) => channel.id === requested) ?? channels[0] ?? null;
  const messages = active ? await listMessages(session, active.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn"
        title="Discussions"
        description="Class channels for questions and shared learning. Messages are visible to your class."
      />
      {!isSupabaseConfigured ? <ConfigNotice /> : null}

      {channels.length === 0 ? (
        <EmptyState
          title="No channels yet"
          description="Discussion channels will appear here once your representative creates them."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(12rem,16rem)_1fr]">
          <nav aria-label="Channels" className="space-y-1">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">Channels</p>
            {channels.map((channel) => (
              <Link
                key={channel.id}
                href={`/student/discussions?channel=${channel.id}`}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                  active?.id === channel.id
                    ? "bg-primary/15 font-semibold text-secondary"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <Hash className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate">{channel.name}</span>
                  {channel.courseLabel ? (
                    <span className="block truncate text-xs opacity-70">{channel.courseLabel}</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </nav>

          <div className="min-w-0">
            {active ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="size-5 text-secondary" aria-hidden="true" />
                  <h3 className="font-heading text-lg font-bold">{active.name}</h3>
                  <Badge variant="neutral">{active.type}</Badge>
                </div>
                <DiscussionRoom
                  key={active.id}
                  channelId={active.id}
                  initialMessages={messages}
                  currentUserId={session.userId}
                />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
