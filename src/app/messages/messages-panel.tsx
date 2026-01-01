"use client";
import { useState } from "react";

export default function MessagesPanel({ withUser }: { withUser: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/messages?with=${encodeURIComponent(withUser)}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  async function send() {
    if (!content.trim()) return;
    await fetch("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to: withUser, content }) });
    setContent("");
    load();
  }

  return (
    <section className="space-y-2 rounded border p-4">
      <div className="font-semibold">Messages</div>
      <button onClick={load} className="rounded border px-2 py-1 text-sm">Load</button>
      <ul className="divide-y max-h-48 overflow-y-auto">
        {messages.map((m, i) => (
          <li key={i} className="py-1 text-sm">{m.content}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input value={content} onChange={e => setContent(e.target.value)} className="rounded border px-2 py-1 flex-1" placeholder="Type a message…" />
        <button onClick={send} className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">Send</button>
      </div>
    </section>
  );
}
