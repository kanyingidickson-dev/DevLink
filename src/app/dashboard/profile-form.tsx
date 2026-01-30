"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { apiUrl } from "@/lib/api-url";

type MeResponse = {
  user: { email: string | null; username: string | null };
  profile: {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    theme: "LIGHT" | "DARK";
    skills: string[];
    colorPalette: string | null;
    vanityUrl: string | null;
  };
};

export default function ProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [skills, setSkills] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [vanityUrl, setVanityUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);
      const res = await fetch(apiUrl("/api/profile/me"));
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
      setColorPalette(data.profile.colorPalette ?? "");
      setVanityUrl(data.profile.vanityUrl ?? "");
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
      const res = await fetch(apiUrl("/api/profile/update"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          displayName,
          bio,
          avatarUrl,
          theme,
          skills,
          colorPalette,
          vanityUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Save failed");
      }

      toast.success("Profile updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", avatarFile);

      const res = await fetch(apiUrl("/api/profile/avatar"), {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Upload failed");
      }

      const data = await res.json().catch(() => ({}));
      const url = typeof data?.avatarUrl === "string" ? data.avatarUrl : null;
      if (url) {
        setAvatarUrl(url);
        setAvatarFile(null);
      }

      toast.success("Avatar uploaded");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <section className="space-y-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Profile</h2>
        <button
          type="button"
          onClick={onSave}
          disabled={!loaded || saving}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          tabIndex={0}
          aria-label="Save profile"
          role="button"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="grid gap-3">
        <div className="flex flex-col gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="text-sm font-medium">Avatar</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  alt="Avatar preview"
                  src={avatarUrl}
                  className="h-12 w-12 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                />
              ) : (
                <div className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-800" />
              )}

              <div className="text-xs text-zinc-500">PNG/JPG/WebP/GIF up to 2MB</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={!loaded || saving || uploadingAvatar}
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={uploadAvatar}
                disabled={!avatarFile || uploadingAvatar}
                className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                tabIndex={0}
                aria-label="Upload avatar"
                role="button"
              >
                {uploadingAvatar ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>

        <label className="grid gap-1">
          <div className="text-sm">Public username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="your_handle"
            autoComplete="username"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Display name</div>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Bio</div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-24 rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="A sentence or two."
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Skills (comma-separated)</div>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="TypeScript, React, Postgres"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Avatar URL</div>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="https://…"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Theme</div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "LIGHT" | "DARK")}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
          >
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </label>
      </div>
    </section>
  );
}
