import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import AnalyticsPanel from "./analytics-panel";
import LinksEditor from "./links-editor";
import ProfileForm from "./profile-form";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = session.user.username;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {username ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Public: <Link className="underline" href={`/u/${username}`}>{`/u/${username}`}</Link>
          </p>
        ) : null}
      </div>

      <div className="grid gap-8">
        <ProfileForm />
        <LinksEditor />
        <AnalyticsPanel />
      </div>
    </div>
  );
}
