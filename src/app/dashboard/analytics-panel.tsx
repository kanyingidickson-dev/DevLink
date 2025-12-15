"use client";

import { useEffect, useState } from "react";

type Stats = { views: number; clicks: number };

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats>({ views: 0, clicks: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await fetch("/api/profile/me");
      if (!res.ok) {
        setError("Failed to load analytics");
        return;
      }

      const data = await res.json();
      if (!mounted) return;

      setStats({
        views: data.analytics?.views ?? 0,
        clicks: data.analytics?.clicks ?? 0
      });
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-2 rounded border p-4">
      <h2 className="text-lg font-semibold">Analytics</h2>
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      <div className="text-sm">Views: {stats.views}</div>
      <div className="text-sm">Clicks: {stats.clicks}</div>
    </section>
  );
}
