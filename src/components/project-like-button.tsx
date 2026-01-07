"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProjectLikeButton({ projectId }: { projectId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await fetch(`/api/social/project-like?projectId=${encodeURIComponent(projectId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!mounted) return;
      setLikeCount(data.likeCount ?? 0);
      setLiked(Boolean(data.liked));
      setLoaded(true);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  async function toggle() {
    setBusy(true);

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`/api/social/project-like?projectId=${encodeURIComponent(projectId)}`, { method });
      if (res.status === 401) {
        toast.error("Sign in to like projects");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Action failed");
      }

      const data = await res.json().catch(() => ({}));
      setLikeCount(data.likeCount ?? likeCount);
      setLiked(Boolean(data.liked));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return <div className="text-xs text-zinc-500">{likeCount} likes</div>;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
    >
      {liked ? "Liked" : "Like"} · {likeCount}
    </button>
  );
}
