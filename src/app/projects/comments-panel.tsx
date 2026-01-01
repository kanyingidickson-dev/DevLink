"use client";
import { useState } from "react";

export default function CommentsPanel({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/projects/comments?projectId=${encodeURIComponent(projectId)}`);
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  }

  async function send() {
    if (!message.trim()) return;
    await fetch("/api/projects/comment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, message }) });
    setMessage("");
    load();
  }

  return (
    <section className="space-y-2 rounded border p-4">
      <div className="font-semibold">Comments</div>
      <button onClick={load} className="rounded border px-2 py-1 text-sm">Load</button>
      <ul className="divide-y max-h-48 overflow-y-auto">
        {comments.map((c, i) => (
          <li key={i} className="py-1 text-sm">{c.message}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input value={message} onChange={e => setMessage(e.target.value)} className="rounded border px-2 py-1 flex-1" placeholder="Add a comment…" />
        <button onClick={send} className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">Send</button>
      </div>
    </section>
  );
}
