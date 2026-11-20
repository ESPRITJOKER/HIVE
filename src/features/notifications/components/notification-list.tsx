"use client";

import { useState, useTransition } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { relativeTime } from "@/features/shared/format";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  setNotificationsReadAction,
} from "../actions/notification-actions";
import type { NotificationSummary } from "../services/notification-service";

export function NotificationList({ initial }: { initial: NotificationSummary[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [pending, startTransition] = useTransition();

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  function markAll() {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.ok) {
        toast.error(result.message ?? "Could not update notifications.");
        return;
      }
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
      );
      toast.success("All notifications marked as read.");
    });
  }

  function toggle(item: NotificationSummary) {
    const nextRead = !item.readAt;
    startTransition(async () => {
      const result = await setNotificationsReadAction({ ids: [item.id], read: nextRead });
      if (!result.ok) {
        toast.error(result.message ?? "Could not update notification.");
        return;
      }
      setNotifications((current) =>
        current.map((row) =>
          row.id === item.id
            ? { ...row, readAt: nextRead ? new Date().toISOString() : null }
            : row,
        ),
      );
    });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="Announcements and alerts from your classes will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
        <Button variant="outline" size="sm" onClick={markAll} disabled={pending || unreadCount === 0}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          Mark all read
        </Button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {notifications.map((item) => (
          <li
            key={item.id}
            className={cn("flex items-start gap-3 p-4", !item.readAt && "bg-primary/5")}
          >
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-secondary">
              <Bell className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{item.title}</p>
                {!item.readAt ? <Badge variant="info">New</Badge> : null}
              </div>
              <p className="mt-0.5 text-sm text-muted">{item.body}</p>
              <p className="mt-1 text-xs text-muted">{relativeTime(item.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item)}
              disabled={pending}
              className="shrink-0 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-surface-raised hover:text-foreground disabled:opacity-60"
            >
              {item.readAt ? "Unread" : "Mark read"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
