"use client";

import { useEffect, useState } from "react";

type LinkItem = { id: string; label: string; url: string; clickCount: number };

export default function LinksEditor() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/profile/links");
    if (!res.ok) {
      setError("Failed to load links");
      return;
    }
    const data = (await res.json()) as LinkItem[];
    setLinks(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add() {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, url })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to add link");
      }

      setLabel("");
      setUrl("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setBusy(false);
    }
  }

  async function remove(linkId: string) {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/profile/links?linkId=${encodeURIComponent(linkId)}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to delete link");
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Links</h2>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded border bg-transparent px-3 py-2"
          placeholder="Label (GitHub, LinkedIn…)"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="rounded border bg-transparent px-3 py-2 md:col-span-2"
          placeholder="https://…"
        />

        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="rounded bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 md:col-span-3"
        >
          Add link
        </button>
      </div>

      <div className="divide-y">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{link.label}</div>
              <div className="truncate text-sm text-zinc-600 dark:text-zinc-300">{link.url}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-500">{link.clickCount} clicks</div>
              <button
                type="button"
                onClick={() => remove(link.id)}
                disabled={busy}
                className="rounded border px-2 py-1 text-xs disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!links.length ? <div className="py-6 text-sm text-zinc-500">No links yet.</div> : null}
      </div>
    </section>
  );
}
