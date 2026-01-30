"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { apiUrl } from "@/lib/api-url";

export default function FollowButton({ username }: { username: string }) {
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [unauth, setUnauth] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await fetch(apiUrl(`/api/social/follow?username=${encodeURIComponent(username)}`));
      if (!res.ok) return;
      const data = await res.json();
      if (!mounted) return;
      setFollowersCount(data.followersCount ?? 0);
      setIsFollowing(Boolean(data.isFollowing));
      setLoaded(true);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [username]);

  async function toggle() {
    setBusy(true);

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(apiUrl(`/api/social/follow?username=${encodeURIComponent(username)}`), { method });
      if (res.status === 401) {
        setUnauth(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Action failed");
      }

      const data = await res.json().catch(() => ({}));
      setFollowersCount(data.followersCount ?? followersCount);
      setIsFollowing(Boolean(data.isFollowing));
      toast.success(isFollowing ? "Unfollowed" : "Followed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return <div className="text-sm text-zinc-500">{followersCount} followers</div>;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-zinc-500">{followersCount} followers</div>
      {unauth ? (
        <Link
          href="/login"
          className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Sign in to follow
        </Link>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
