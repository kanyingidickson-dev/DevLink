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
    <section className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="text-sm font-medium">Search</div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
          placeholder="Search developer profiles by username, name, skills, etc."
        />
        <button type="submit" className="rounded bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Search
        </button>
      </form>
    </section>
  );
}
