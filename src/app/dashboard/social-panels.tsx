"use client";
import useSWR from "swr";

function fetcher(url: string) {
  return fetch(url).then((r) => r.json());
}

export function FeedPanel() {
  const { data } = useSWR("/api/dashboard/feed", fetcher);
  if (!data) return <div>Loading feed...</div>;
  if (!data.activity?.length) return <div>No recent activity.</div>;
  return (
    <div className="space-y-2">
      <div className="font-semibold">Feed</div>
      <ul className="text-sm">
        {data.activity.map((a: any) => (
          <li key={a.id}>
            {a.profile.displayName || a.profile.user.username}: {a.type} ({new Date(a.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SuggestionsPanel() {
  const { data } = useSWR("/api/dashboard/suggestions", fetcher);
  if (!data) return <div>Loading suggestions...</div>;
  if (!data.suggestions?.length) return <div>No suggestions.</div>;
  return (
    <div className="space-y-2">
      <div className="font-semibold">Suggestions</div>
      <ul className="text-sm">
        {data.suggestions.map((u: any) => (
          <li key={u.username}>
            @{u.username} {u.profile?.displayName ? `(${u.profile.displayName})` : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendingPanel() {
  const { data } = useSWR("/api/dashboard/trending", fetcher);
  if (!data) return <div>Loading trending...</div>;
  return (
    <div className="space-y-2">
      <div className="font-semibold">Trending</div>
      <div className="text-sm">Skills: {data.trendingSkills?.map((s: any) => s.skill).join(", ")}</div>
      <div className="text-sm">Projects: {data.trendingProjects?.map((p: any) => p.title).join(", ")}</div>
    </div>
  );
}
