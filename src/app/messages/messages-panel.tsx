"use client";
import { useState } from "react";

import { apiUrl } from "@/lib/api-url";

export default function MessagesPanel({ withUser }: { withUser: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(apiUrl(`/api/messages?with=${encodeURIComponent(withUser)}`));
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  async function send() {
    if (!content.trim()) return;
    await fetch(apiUrl("/api/messages"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: withUser, content }) });
    setContent("");
    load();
  }

  return (
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="font-semibold">Messages</div>
      <button onClick={load} className="rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">Load</button>
      <ul className="max-h-48 divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800">
        {messages.map((m, i) => (
          <li key={i} className="py-1 text-sm">{m.content}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
          placeholder="Type a message…"
        />
        <button onClick={send} className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">Send</button>
      </div>
    </section>
  );
}
