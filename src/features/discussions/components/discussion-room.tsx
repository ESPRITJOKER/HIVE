"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Send, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { relativeTime } from "@/features/shared/format";
import type { MessageSummary } from "../services/discussion-service";
import { postMessageAction } from "../actions/message-actions";

type ConnectionState = "connecting" | "live" | "reconnecting" | "offline";

export function DiscussionRoom({
  channelId,
  initialMessages,
  currentUserId,
}: {
  channelId: string;
  initialMessages: MessageSummary[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [connection, setConnection] = useState<ConnectionState>(() =>
    getBrowserSupabase() ? "connecting" : "offline",
  );
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    function subscribe() {
      if (disposed) return;
      setConnection(attempts === 0 ? "connecting" : "reconnecting");

      const channel = supabase!
        .channel(`discussion:${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${channelId}`,
          },
          (payload) => {
            const row = payload.new as {
              id: string;
              channel_id: string | null;
              course_id: string | null;
              user_id: string;
              content: string;
              created_at: string;
              moderation_status?: string;
            };
            // Hidden messages must never reach a student's screen.
            if (row.moderation_status && row.moderation_status !== "visible") return;
            const own = row.user_id === currentUserId;
            const incoming: MessageSummary = {
              id: row.id,
              channelId: row.channel_id,
              courseId: row.course_id,
              content: row.content,
              createdAt: row.created_at,
              isOwn: own,
              authorLabel: own ? "You" : "Class member",
            };
            setMessages((current) => {
              if (current.some((message) => message.id === incoming.id)) return current;
              return [...current, incoming];
            });
          },
        )
        .subscribe((status) => {
          if (disposed) return;
          if (status === "SUBSCRIBED") {
            attempts = 0;
            setConnection("live");
            return;
          }
          if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setConnection("reconnecting");
            attempts += 1;
            const delay = Math.min(1000 * 2 ** Math.min(attempts, 4), 15_000);
            retryTimer = setTimeout(() => {
              void supabase!.removeChannel(channel);
              subscribe();
            }, delay);
          }
        });
    }

    subscribe();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      void supabase.removeAllChannels();
    };
  }, [channelId, currentUserId]);

  function send() {
    const trimmed = content.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await postMessageAction({ channelId, content: trimmed });
      if (!result.ok) {
        toast.error(result.message ?? "Could not send your message.");
        return;
      }
      setContent("");
    });
  }

  return (
    <div className="flex h-[min(70vh,40rem)] flex-col rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 text-xs text-muted">
        <span>Live discussion</span>
        <span className="inline-flex items-center gap-1.5">
          {connection === "live" ? (
            <Wifi className="size-3.5 text-success" aria-hidden="true" />
          ) : (
            <WifiOff className="size-3.5 text-warning" aria-hidden="true" />
          )}
          {connection === "live" ? "Connected" : connection === "offline" ? "Live updates unavailable" : "Reconnecting…"}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Start the conversation — everyone in this channel can see it." />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.isOwn ? "ml-auto bg-primary text-white" : "bg-surface-raised text-foreground"
              }`}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {message.authorLabel} · {relativeTime(message.createdAt)}
              </p>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Textarea
          aria-label="Message"
          placeholder="Write a message…"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={2}
          maxLength={10_000}
          className="resize-none"
        />
        <Button type="submit" size="icon" disabled={pending || content.trim().length === 0} aria-label="Send message">
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        </Button>
      </form>
    </div>
  );
}
