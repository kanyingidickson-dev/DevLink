"use client";
import { useState } from "react";

export default function SearchPanel() {
  const [skills, setSkills] = useState("");
  const [tech, setTech] = useState("");
  const [location, setLocation] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [sort, setSort] = useState("trending");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const params = new URLSearchParams();
    skills.split(",").map(s => s.trim()).filter(Boolean).forEach(s => params.append("skill", s));
    tech.split(",").map(t => t.trim()).filter(Boolean).forEach(t => params.append("tech", t));
    if (location) params.set("location", location);
    if (openToWork) params.set("openToWork", "true");
    if (sort) params.set("sort", sort);
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <section className="space-y-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap gap-2">
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma)"
          className="rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
        />
        <input
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder="Tech stack (comma)"
          className="rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
        />
        <label className="flex items-center gap-2 rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          <input
            type="checkbox"
            checked={openToWork}
            onChange={(e) => setOpenToWork(e.target.checked)}
            className="h-4 w-4"
          />
          Open to work
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
        >
          <option value="trending">Trending</option>
          <option value="new">New</option>
          <option value="active">Active</option>
        </select>
        <button
          onClick={search}
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </div>
      {loading ? <div>Loading…</div> : null}
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {results.map((r, i) => (
          <li key={i} className="py-2 text-sm">
            <span className="font-semibold">@{r.user.username}</span> {r.displayName} {r.skills?.length ? `· ${r.skills.join(", ")}` : ""} {r.location ? `· ${r.location}` : ""} {r.openToWork ? <span className="text-emerald-600 dark:text-emerald-400">· Open to work</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
