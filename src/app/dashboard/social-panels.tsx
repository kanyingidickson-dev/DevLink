"use client";
import useSWR from "swr";

import { apiUrl } from "@/lib/api-url";

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

export function FeedPanel() {
  const { data } = useSWR(apiUrl("/api/dashboard/feed"), fetcher);
  if (!data)
    return (
      <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="font-semibold">Feed</div>
        <div className="text-sm text-zinc-500">Loading…</div>
      </section>
    );

  if (!data.activity?.length)
    return (
      <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="font-semibold">Feed</div>
        <div className="text-sm text-zinc-500">No recent activity.</div>
      </section>
    );

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Feed</div>
      <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        {data.activity.map((a: any) => (
          <li key={a.id} className="py-2">
            {a.profile.displayName || a.profile.user.username}: {a.type} ({new Date(a.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SuggestionsPanel() {
  const { data } = useSWR(apiUrl("/api/dashboard/suggestions"), fetcher);
  if (!data)
    return (
      <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="font-semibold">Suggestions</div>
        <div className="text-sm text-zinc-500">Loading…</div>
      </section>
    );

  if (!data.suggestions?.length)
    return (
      <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="font-semibold">Suggestions</div>
        <div className="text-sm text-zinc-500">No suggestions.</div>
      </section>
    );

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Suggestions</div>
      <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        {data.suggestions.map((u: any) => (
          <li key={u.username} className="py-2">
            @{u.username} {u.profile?.displayName ? `(${u.profile.displayName})` : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TrendingPanel() {
  const { data } = useSWR(apiUrl("/api/dashboard/trending"), fetcher);
  if (!data)
    return (
      <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="font-semibold">Trending</div>
        <div className="text-sm text-zinc-500">Loading…</div>
      </section>
    );

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Trending</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Skills: {data.trendingSkills?.map((s: any) => s.skill).join(", ")}
      </div>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Projects: {data.trendingProjects?.map((p: any) => p.title).join(", ")}
      </div>
    </section>
  );
}
