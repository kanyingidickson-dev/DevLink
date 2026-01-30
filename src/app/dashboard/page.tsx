"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useDemoAuth } from "@/components/app-providers";
import { findUserById, getDb } from "@/mocks/db";
import AnalyticsPanel from "./analytics-panel";
import AnalyticsInsights from "./analytics-insights";
import { FeedPanel, SuggestionsPanel, TrendingPanel } from "./social-panels";

export default function DashboardPage() {
  const router = useRouter();
  const { userId, status, setUserId } = useDemoAuth();

  const user = useMemo(() => {
    if (!userId) return null;
    const db = getDb();
    return findUserById(db, userId);
  }, [userId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?mode=signin&callbackUrl=${encodeURIComponent("/dashboard")}`);
      return;
    }

    if (status === "authenticated" && userId && !user) {
      setUserId(null);
      router.replace(`/login?mode=signin&callbackUrl=${encodeURIComponent("/dashboard")}`);
    }
  }, [router, setUserId, status, user, userId]);

  if (status === "loading") {
    return <div className="text-sm text-zinc-500">Loading…</div>;
  }

  if (!userId || !user) {
    return null;
  }

  const username = user.username;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Account overview and activity.</p>
      </div>

      <section className="space-y-3 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-500">Signed in as</div>
        <div className="text-sm">
          {user.email ?? ""}
          {username ? <span className="text-zinc-500"> · @{username}</span> : null}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href="/profile">
            Edit profile
          </Link>
          <Link className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href="/notifications">
            Notifications
          </Link>
          {username ? (
            <Link className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900" href={`/u/${username}`}>{
              "View public profile"
            }</Link>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <FeedPanel />
        </div>
        <div className="space-y-6">
          <SuggestionsPanel />
          <TrendingPanel />
        </div>
      </div>
      <AnalyticsPanel />
      <AnalyticsInsights />
    </div>
  );
}
