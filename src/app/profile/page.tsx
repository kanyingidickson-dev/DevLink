"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { useDemoAuth } from "@/components/app-providers";
import LinksEditor from "@/app/dashboard/links-editor";
import ProfileForm from "@/app/dashboard/profile-form";
import ProjectsEditor from "@/app/dashboard/projects-editor";
import { findUserById, getDb } from "@/mocks/db";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, status, setUserId } = useDemoAuth();

  const user = useMemo(() => {
    if (!userId) return null;
    const db = getDb();
    return findUserById(db, userId);
  }, [userId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?mode=signin&callbackUrl=${encodeURIComponent("/profile")}`);
      return;
    }

    if (status === "authenticated" && userId && !user) {
      setUserId(null);
      router.replace(`/login?mode=signin&callbackUrl=${encodeURIComponent("/profile")}`);
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
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Manage your public profile details.</p>
      </div>

      <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-500">Signed in as</div>
        <div className="text-sm">
          {user.email ?? ""}
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
