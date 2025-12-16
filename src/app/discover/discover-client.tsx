"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ProfileItem = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
};

type TrendingItem = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  skills: string[];
  views7d: number;
  followersCount: number;
  likesReceived: number;
};

type SuggestionItem = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type BrowseItem = {
  cursor: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
};

export default function DiscoverClient() {
  const searchParams = useSearchParams();

  const initialQ = useMemo(() => searchParams.get("q")?.trim() ?? "", [searchParams]);
  const [q, setQ] = useState(initialQ);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<ProfileItem[]>([]);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const [browse, setBrowse] = useState<BrowseItem[]>([]);
  const [browseCursor, setBrowseCursor] = useState<string | null>(null);
  const [browseLoading, setBrowseLoading] = useState(false);

  const hasQuery = useMemo(() => q.trim().length > 0, [q]);

  useEffect(() => {
    if (initialQ) setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    let mounted = true;

    async function loadTrending() {
      const res = await fetch("/api/discover/trending");
      if (!res.ok) return;
      const data = await res.json();
      if (!mounted) return;
      setTrending(data.profiles ?? []);
    }

    loadTrending();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const handle = setTimeout(async () => {
      const query = q.trim();
      if (!query) {
        setResults([]);
        setSuggestions([]);
        return;
      }

      setBusy(true);
      setError(null);

      try {
        const res = await fetch(`/api/discover/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        if (!mounted) return;
        setResults(data.results ?? []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed";
        if (!mounted) return;
        setError(msg);
      } finally {
        if (mounted) setBusy(false);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(handle);
    };
  }, [q]);

  useEffect(() => {
    let mounted = true;
    const handle = setTimeout(async () => {
      const query = q.trim();
      if (!query) {
        if (mounted) setSuggestions([]);
        return;
      }

      try {
        const res = await fetch(`/api/discover/autocomplete?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (!mounted) return;
        setSuggestions((data.suggestions ?? []) as SuggestionItem[]);
      } catch {
        if (!mounted) return;
        setSuggestions([]);
      }
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(handle);
    };
  }, [q]);

  async function loadBrowse(initial = false) {
    if (!initial && !browseCursor) return;
    if (browseLoading) return;
    setBrowseLoading(true);

    try {
      const url = initial
        ? "/api/discover/browse"
        : `/api/discover/browse?cursor=${encodeURIComponent(browseCursor ?? "")}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Browse failed");
      const data = await res.json().catch(() => ({}));

      const next = (data.profiles ?? []) as BrowseItem[];
      setBrowse((prev) => (initial ? next : [...prev, ...next]));
      setBrowseCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
    } finally {
      setBrowseLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    setBrowseLoading(true);

    fetch("/api/discover/browse")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        setBrowse((data.profiles ?? []) as BrowseItem[]);
        setBrowseCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
      })
      .finally(() => {
        if (mounted) setBrowseLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="Search by username, name, bio, or skills"
          />

          {suggestions.length && hasQuery ? (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded border bg-white shadow-sm dark:bg-zinc-950">
              {suggestions.slice(0, 6).map((s) => (
                <Link
                  key={s.username}
                  href={`/u/${s.username}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  {s.avatarUrl ? (
                    <img alt={s.displayName} src={s.avatarUrl} className="h-7 w-7 rounded-full border object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full border" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.displayName}</div>
                    <div className="truncate text-xs text-zinc-500">@{s.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        {busy ? <div className="text-sm text-zinc-500">Searching…</div> : null}
      </div>

      {hasQuery ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Results</h2>
          <div className="grid gap-3">
            {results.map((r) => (
              <Link key={r.username} href={`/u/${r.username}`} className="rounded border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <div className="flex items-center gap-3">
                  {r.avatarUrl ? (
                    <img alt={r.displayName} src={r.avatarUrl} className="h-10 w-10 rounded-full border object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full border" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{r.displayName}</div>
                    <div className="truncate text-sm text-zinc-500">@{r.username}</div>
                  </div>
                </div>

                {r.bio ? <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{r.bio}</div> : null}

                {r.skills.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.skills.slice(0, 8).map((s) => (
                      <span key={s} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
            {!results.length && !busy ? <div className="text-sm text-zinc-500">No matches.</div> : null}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Trending this week</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {trending.map((t) => (
                <Link key={t.username} href={`/u/${t.username}`} className="rounded border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {t.avatarUrl ? (
                        <img alt={t.displayName} src={t.avatarUrl} className="h-10 w-10 rounded-full border object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full border" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{t.displayName}</div>
                        <div className="truncate text-sm text-zinc-500">@{t.username}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-zinc-500">
                      <div>{t.views7d} views</div>
                      <div>
                        {t.followersCount} followers · {t.likesReceived} likes
                      </div>
                    </div>
                  </div>

                  {t.skills.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.skills.slice(0, 8).map((s) => (
                        <span key={s} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ))}

              {!trending.length ? <div className="text-sm text-zinc-500">No trending profiles yet.</div> : null}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Browse profiles</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {browse.map((p) => (
                <Link key={p.cursor} href={`/u/${p.username}`} className="rounded border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex items-center gap-3">
                    {p.avatarUrl ? (
                      <img alt={p.displayName} src={p.avatarUrl} className="h-10 w-10 rounded-full border object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full border" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.displayName}</div>
                      <div className="truncate text-sm text-zinc-500">@{p.username}</div>
                    </div>
                  </div>

                  {p.bio ? <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.bio}</div> : null}

                  {p.skills.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.skills.slice(0, 8).map((s) => (
                        <span key={s} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadBrowse(false)}
                disabled={!browseCursor || browseLoading}
                className="rounded border px-3 py-2 text-sm disabled:opacity-60"
              >
                {browseLoading ? "Loading…" : browseCursor ? "Load more" : "No more"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
