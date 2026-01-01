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
    <section className="space-y-4 rounded border p-4">
      <div className="flex gap-2 flex-wrap">
        <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills (comma)" className="rounded border px-2 py-1" />
        <input value={tech} onChange={e => setTech(e.target.value)} placeholder="Tech stack (comma)" className="rounded border px-2 py-1" />
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="rounded border px-2 py-1" />
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={openToWork} onChange={e => setOpenToWork(e.target.checked)} /> Open to work
        </label>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded border px-2 py-1">
          <option value="trending">Trending</option>
          <option value="new">New</option>
          <option value="active">Active</option>
        </select>
        <button onClick={search} className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">Search</button>
      </div>
      {loading ? <div>Loading…</div> : null}
      <ul className="divide-y">
        {results.map((r, i) => (
          <li key={i} className="py-2">
            <span className="font-semibold">@{r.user.username}</span> {r.displayName} {r.skills?.length ? `· ${r.skills.join(", ")}` : ""} {r.location ? `· ${r.location}` : ""} {r.openToWork ? <span className="text-green-600">· Open to work</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
