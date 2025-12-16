import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import LinksEditor from "@/app/dashboard/links-editor";
import ProfileForm from "@/app/dashboard/profile-form";
import ProjectsEditor from "@/app/dashboard/projects-editor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const username = session.user.username;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Manage your public profile details.</p>
      </div>

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
        Looking for notifications? Go to <Link className="underline" href="/notifications">Notifications</Link>.
      </div>

      <div className="grid gap-8">
        <ProfileForm />
        <LinksEditor />
        <ProjectsEditor />
      </div>
    </div>
  );
}
