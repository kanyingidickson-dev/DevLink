"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  actor: { username: string | null } | null;
  project: { title: string } | null;
  actorIsFollowing?: boolean;
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [followBusyId, setFollowBusyId] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/notifications");
    if (!res.ok) {
      setError("Failed to load notifications");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setNotifications((data.notifications ?? []) as NotificationItem[]);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function markRead(notificationId: string) {
    setBusyId(notificationId);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notificationId })
      });

      if (!res.ok) {
        setError("Failed to mark as read");
        return;
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } finally {
      setBusyId(null);
    }
  }

  async function followBack(notificationId: string, username: string) {
    setFollowBusyId(notificationId);
    setError(null);

    try {
      const res = await fetch(`/api/social/follow?username=${encodeURIComponent(username)}`, {
        method: "POST"
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to follow");
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, actorIsFollowing: true } : n))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to follow";
      setError(msg);
    } finally {
      setFollowBusyId(null);
    }
  }

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button
          type="button"
          onClick={refresh}
          className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="divide-y rounded border border-zinc-200 dark:border-zinc-800">
        {notifications.map((n) => {
          const actorUsername = n.actor?.username ?? null;
          const actorLabel = actorUsername ? `@${actorUsername}` : "Someone";

          const text =
            n.type === "FOLLOW"
              ? "followed you"
              : `liked your project${n.project?.title ? `: ${n.project.title}` : ""}`;

          return (
            <div key={n.id} className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="text-sm">
                  {actorUsername ? (
                    <>
                      <Link className="underline" href={`/u/${actorUsername}`}>{actorLabel}</Link> {text}
                    </>
                  ) : (
                    <div>
                      {actorLabel} {text}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                {n.type === "FOLLOW" && actorUsername ? (
                  n.actorIsFollowing ? (
                    <div className="text-xs text-zinc-500">Following</div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => followBack(n.id, actorUsername)}
                      disabled={followBusyId === n.id}
                      className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      {followBusyId === n.id ? "…" : "Follow back"}
                    </button>
                  )
                ) : null}

                {n.isRead ? (
                  <div className="text-xs text-zinc-500">Read</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    disabled={busyId === n.id}
                    className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    {busyId === n.id ? "…" : "Mark read"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!notifications.length ? <div className="p-3 text-sm text-zinc-500">No notifications yet.</div> : null}
      </div>
    </section>
  );
}
