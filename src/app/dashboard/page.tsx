import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AnalyticsPanel from "./analytics-panel";
import AnalyticsInsights from "./analytics-insights";
import { FeedPanel, SuggestionsPanel, TrendingPanel } from "./social-panels";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = session.user.username;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Account overview and activity.</p>
      </div>

      <section className="space-y-3 rounded border p-4">
        <div className="text-sm text-zinc-500">Signed in as</div>
        <div className="text-sm">
          {session.user.email ?? ""}
          {username ? <span className="text-zinc-500"> · @{username}</span> : null}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link className="rounded border px-3 py-1.5 text-sm" href="/profile">
            Edit profile
          </Link>
          <Link className="rounded border px-3 py-1.5 text-sm" href="/notifications">
            Notifications
          </Link>
          {username ? (
            <Link className="rounded border px-3 py-1.5 text-sm" href={`/u/${username}`}>{
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
