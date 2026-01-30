"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/api-url";

type TrendingItem = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  skills: string[];
  views7d: number;
  followersCount: number;
  likesReceived: number;
};

export default function HomeTrending() {
  const [items, setItems] = useState<TrendingItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await fetch(apiUrl("/api/discover/trending"));
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (!mounted) return;
      setItems((data.profiles ?? []) as TrendingItem[]);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Trending developers</h2>
        <Link href="/discover" className="text-sm underline">
          Browse
        </Link>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {items.slice(0, 6).map((t) => (
          <Link
            key={t.username}
            href={`/u/${t.username}`}
            className="flex items-center justify-between gap-3 rounded border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <div className="flex min-w-0 items-center gap-3">
              {t.avatarUrl ? (
                <img alt={t.displayName} src={t.avatarUrl} className="h-8 w-8 rounded-full border border-zinc-200 object-cover dark:border-zinc-800" />
              ) : (
                <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800" />
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{t.displayName}</div>
                <div className="truncate text-xs text-zinc-500">@{t.username}</div>
              </div>
            </div>
            <div className="shrink-0 text-right text-xs text-zinc-500">
              <div>{t.views7d} views</div>
              <div>
                {t.followersCount} followers · {t.likesReceived} likes
              </div>
            </div>
          </Link>
        ))}

        {!items.length ? <div className="text-sm text-zinc-500">No trending profiles yet.</div> : null}
      </div>
    </section>
  );
}
