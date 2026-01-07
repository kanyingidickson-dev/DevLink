"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ProjectItem = {
  id: string;
  title: string;
  description: string | null;
  markdown?: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  imageUrl: string | null;
  mediaUrls?: string[];
  featured: boolean;
  sortOrder: number;
};

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("999");
  const [markdown, setMarkdown] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setRepoUrl("");
    setLiveUrl("");
    setTechStack("");
    setImageUrl("");
    setFeatured(false);
    setSortOrder("999");
  }

  async function refresh() {
    const res = await fetch("/api/profile/projects");
    if (!res.ok) {
      setError("Failed to load projects");
      return;
    }

    const data = (await res.json()) as ProjectItem[];
    setProjects(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  function startEdit(project: ProjectItem) {
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description ?? "");
    setRepoUrl(project.repoUrl ?? "");
    setLiveUrl(project.liveUrl ?? "");
    setTechStack((project.techStack ?? []).join(", "));
    setImageUrl(project.imageUrl ?? "");
    setFeatured(Boolean(project.featured));
    setSortOrder(String(project.sortOrder ?? 999));
    setMarkdown(project.markdown ?? "");
    setMediaUrls(project.mediaUrls ?? []);
  }

  async function save() {
    setBusy(true);
    setError(null);

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `/api/profile/projects?projectId=${encodeURIComponent(editingId as string)}`
        : "/api/profile/projects";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          repoUrl,
          liveUrl,
          techStack,
          imageUrl,
          featured,
          sortOrder,
          markdown,
          mediaUrls
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? (isEditing ? "Failed to update project" : "Failed to add project"));
      }

      await refresh();
      resetForm();
      toast.success(isEditing ? "Project updated" : "Project added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function remove(projectId: string) {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/profile/projects?projectId=${encodeURIComponent(projectId)}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to delete project");
      }

      await refresh();
      if (editingId === projectId) resetForm();
      toast.success("Project deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex items-center gap-2">
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              disabled={busy}
              className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          ) : null}

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {busy ? "Saving…" : editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 md:col-span-2">
          <div className="text-sm">Markdown (optional)</div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-24 rounded border border-zinc-200 bg-transparent px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="Project details in markdown..."
          />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <div className="text-sm">Media URLs (comma separated)</div>
          <input
            value={mediaUrls.join(", ")}
            onChange={(e) => setMediaUrls(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="https://img1, https://img2"
          />
        </label>
        <label className="grid gap-1">
          <div className="text-sm">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="My awesome project"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Sort order</div>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            inputMode="numeric"
            placeholder="1"
          />
        </label>

        <label className="grid gap-1 md:col-span-2">
          <div className="text-sm">Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="What it does, why it matters."
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Repo URL</div>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="https://github.com/..."
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Live URL</div>
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="https://..."
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Tech stack (comma-separated)</div>
          <input
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="Next.js, Prisma, Postgres"
          />
        </label>

        <label className="grid gap-1">
          <div className="text-sm">Image URL</div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            placeholder="https://..."
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          <div className="text-sm">Featured on public profile</div>
        </label>
      </div>

      <div className="divide-y">
        {projects.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium">{p.title}</div>
                {p.featured ? (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-900">Featured</span>
                ) : null}
              </div>
              {p.description ? (
                <div className="text-sm text-zinc-600 dark:text-zinc-300">{p.description}</div>
              ) : null}
              <div className="text-xs text-zinc-500">sort: {p.sortOrder}</div>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {p.markdown ? <pre className="whitespace-pre-wrap font-mono">{p.markdown}</pre> : null}
              {p.mediaUrls && p.mediaUrls.length
                ? (
                  <div className="flex gap-2 py-1">
                    {p.mediaUrls.map((url, i) => (
                      <img key={i} src={url} alt="media" className="h-12 w-12 object-cover rounded" />
                    ))}
                  </div>
                ) : null}
              <button
                type="button"
                className="mt-2 rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                onClick={() => fetch("/api/projects/endorse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: p.id, message: "Great work!" }) }).then(() => toast.success("Endorsed!"))}
              >
                Endorse
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => startEdit(p)}
                disabled={busy}
                className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                tabIndex={0}
                aria-label="Edit project"
                role="button"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                disabled={busy}
                className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-900"
                tabIndex={0}
                aria-label="Delete project"
                role="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!projects.length ? <div className="py-6 text-sm text-zinc-500">No projects yet.</div> : null}
      </div>
    </section>
  );
}
