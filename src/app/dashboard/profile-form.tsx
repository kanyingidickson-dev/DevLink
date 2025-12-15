"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  user: { email: string | null; username: string | null };
  profile: {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    theme: "LIGHT" | "DARK";
    skills: string[];
  };
};

export default function ProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);
      const res = await fetch("/api/profile/me");
      if (!res.ok) {
        setError("Failed to load profile");
        return;
      }

      const data = (await res.json()) as MeResponse;
      if (!mounted) return;

      setUsername(data.user.username ?? "");
      setDisplayName(data.profile.displayName ?? "");
      setBio(data.profile.bio ?? "");
      setAvatarUrl(data.profile.avatarUrl ?? "");
      setTheme(data.profile.theme);
      setSkills((data.profile.skills ?? []).join(", "));
      setLoaded(true);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSave() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          displayName,
          bio,
          avatarUrl,
          theme,
          skills
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Save failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={!loaded || saving}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="grid gap-3">
        <label className="grid gap-1">
          <div className="text-sm">Public username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border bg-transparent px-3 py-2"
            placeholder="your_handle"
            autoComplete="username"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Display name</div>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded border bg-transparent px-3 py-2"
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Bio</div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-24 rounded border bg-transparent px-3 py-2"
            placeholder="A sentence or two."
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Skills (comma-separated)</div>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="rounded border bg-transparent px-3 py-2"
            placeholder="TypeScript, React, Postgres"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Avatar URL</div>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="rounded border bg-transparent px-3 py-2"
            placeholder="https://…"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "LIGHT" | "DARK")}
            className="rounded border bg-transparent px-3 py-2"
          >
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </label>
      </div>
    </section>
  );
}
