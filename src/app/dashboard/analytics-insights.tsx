"use client";
import useSWR from "swr";

import { apiUrl } from "@/lib/api-url";

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

export default function AnalyticsInsights() {
  const { data } = useSWR(apiUrl("/api/profile/me"), fetcher);
  if (!data) return <div>Loading analytics…</div>;
  const { analytics, social } = data;
  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Analytics & Insights</div>
      <div className="text-sm">Views: {analytics?.views ?? 0}</div>
      <div className="text-sm">Clicks: {analytics?.clicks ?? 0}</div>
      <div className="text-sm">Followers: {social?.followersCount ?? 0}</div>
      <div className="text-sm">Following: {social?.followingCount ?? 0}</div>
      <div className="text-sm">Likes received: {social?.likesReceived ?? 0}</div>
    </section>
  );
}
