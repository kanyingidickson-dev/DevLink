"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/discover?q=${encodeURIComponent(query)}` : "/discover");
  }

  return (
    <section className="space-y-2 rounded border p-4">
      <div className="text-sm font-medium">Search</div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded border bg-transparent px-3 py-2 text-sm"
          placeholder="Search developer profiles by username, name, skills, etc."
        />
        <button type="submit" className="rounded bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          Search
        </button>
      </form>
    </section>
  );
}
