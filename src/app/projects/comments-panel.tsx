"use client";
import { useState } from "react";

import { apiUrl } from "@/lib/api-url";

export default function CommentsPanel({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(apiUrl(`/api/projects/comments?projectId=${encodeURIComponent(projectId)}`));
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  }

  async function send() {
    if (!message.trim()) return;
    await fetch(apiUrl("/api/projects/comment"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, message }) });
    setMessage("");
    load();
  }

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Comments</div>
      <button onClick={load} className="rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">Load</button>
      <ul className="max-h-48 divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800">
        {comments.map((c, i) => (
          <li key={i} className="py-1 text-sm">{c.message}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
          placeholder="Add a comment…"
        />
        <button onClick={send} className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">Send</button>
      </div>
    </section>
  );
}
