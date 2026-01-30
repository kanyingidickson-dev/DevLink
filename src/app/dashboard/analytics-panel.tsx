"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/api-url";

type LinkStat = { id: string; label: string; clickCount: number };
type Activity = {
  id: string;
  type: "VIEW" | "CLICK";
  createdAt: string;
  link?: { id: string; label: string } | null;
};
type Stats = {
  views: number;
  clicks: number;
  followers: number;
  following: number;
  likesReceived: number;
  links: LinkStat[];
  activity: Activity[];
};

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats>({
    views: 0,
    clicks: 0,
    followers: 0,
    following: 0,
    likesReceived: 0,
    links: [],
    activity: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await fetch(apiUrl("/api/profile/me"));
      if (!res.ok) {
        setError("Failed to load analytics");
        return;
      }

      const data = await res.json();
      if (!mounted) return;

      setStats({
        views: data.analytics?.views ?? 0,
        clicks: data.analytics?.clicks ?? 0,
        followers: data.social?.followersCount ?? 0,
        following: data.social?.followingCount ?? 0,
        likesReceived: data.social?.likesReceived ?? 0,
        links: (data.profile?.links ?? []).map((l: any) => ({
          id: l.id,
          label: l.label,
          clickCount: l.clickCount ?? 0
        })),
        activity: (data.activity ?? []).map((e: any) => ({
          id: e.id,
          type: e.type,
          createdAt: e.createdAt,
          link: e.link ?? null
        }))
      });
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Analytics</h2>
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">Views</div>
          <div className="text-lg font-semibold tabular-nums">{stats.views}</div>
        </div>
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">Clicks</div>
          <div className="text-lg font-semibold tabular-nums">{stats.clicks}</div>
        </div>
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">Followers</div>
          <div className="text-lg font-semibold tabular-nums">{stats.followers}</div>
        </div>
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">Likes received</div>
          <div className="text-lg font-semibold tabular-nums">{stats.likesReceived}</div>
        </div>
      </div>

      <div className="pt-2">
        <div className="text-sm font-medium">Clicks by link</div>
        <div className="mt-2 overflow-hidden rounded border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-3 gap-2 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            <div className="col-span-2">Link</div>
            <div className="text-right">Clicks</div>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {stats.links.map((l) => (
              <div key={l.id} className="grid grid-cols-3 gap-2 px-3 py-2 text-sm">
                <div className="col-span-2 truncate">{l.label}</div>
                <div className="text-right tabular-nums">{l.clickCount}</div>
              </div>
            ))}
            {!stats.links.length ? (
              <div className="px-3 py-3 text-sm text-zinc-500">No links yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="text-sm font-medium">Recent activity</div>
        <div className="mt-2 space-y-1 text-sm">
          {stats.activity.slice(0, 8).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 truncate">
                {e.type === "VIEW" ? "Profile view" : `Click: ${e.link?.label ?? "Link"}`}
              </div>
              <div className="shrink-0 text-xs text-zinc-500">
                {new Date(e.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {!stats.activity.length ? <div className="text-sm text-zinc-500">No activity yet.</div> : null}
        </div>
      </div>
    </section>
  );
}
