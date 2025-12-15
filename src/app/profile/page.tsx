import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = session.user.username;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="rounded border p-4">
        <div className="text-sm text-zinc-500">Signed in as</div>
        <div className="text-sm">
          {session.user.email ?? ""}
          {username ? <span className="text-zinc-500"> · @{username}</span> : null}
        </div>

        {username ? (
          <div className="mt-3 text-sm">
            Public profile: <Link className="underline" href={`/u/${username}`}>{`/u/${username}`}</Link>
          </div>
        ) : null}
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Edit profile details in the <Link className="underline" href="/dashboard">dashboard</Link>.
      </div>
    </div>
  );
}
