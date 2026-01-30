import Link from "next/link";
import { notFound } from "next/navigation";

import FollowButton from "@/components/follow-button";
import ProjectLikeButton from "@/components/project-like-button";
import { SEED_LINKS, SEED_PROFILES, SEED_PROJECTS, SEED_USERS, SEED_USERNAMES } from "@/mocks/seed";

export const dynamicParams = false;

export function generateStaticParams() {
  return SEED_USERNAMES.map((username) => ({ username }));
}

export default function PublicProfilePage({
  params
}: {
  params: { username: string };
}) {
  const username = (params.username || "").toLowerCase();
  if (!username) notFound();

  const user = SEED_USERS.find((u) => u.username.toLowerCase() === username) ?? null;
  if (!user) notFound();

  const profile = SEED_PROFILES.find((p) => p.userId === user.id) ?? null;
  if (!profile) notFound();

  const links = SEED_LINKS
    .filter((l) => l.profileUserId === user.id)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const projects = SEED_PROJECTS
    .filter((p) => p.profileUserId === user.id && p.featured)
    .slice()
    .sort((a, b) => (a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : a.createdAt < b.createdAt ? 1 : -1));

  const canFollow = true;
  const displayName = profile.displayName || username;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-8">
      <section className="rounded border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profile.avatarUrl ? (
            <img
              alt={displayName}
              src={profile.avatarUrl}
              className="h-20 w-20 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-lg font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {initials || "?"}
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <div className="text-sm text-zinc-500">@{username}</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">{displayName}</h1>
            {profile.bio ? (
              <p className="max-w-prose text-zinc-600 dark:text-zinc-300">{profile.bio}</p>
            ) : null}

            {canFollow ? (
              <div className="pt-2">
                <FollowButton username={username} />
              </div>
            ) : null}
          </div>
        </div>

        {profile.skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-900">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Featured projects</h2>
          <div className="grid gap-3">
            {projects.map((p) => (
              <div key={p.id} className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex gap-4">
                  {p.imageUrl ? (
                    <img
                      alt={p.title}
                      src={p.imageUrl}
                      className="hidden h-16 w-16 rounded border border-zinc-200 object-cover dark:border-zinc-800 sm:block"
                    />
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/p/${p.id}`}
                        className="min-w-0 truncate text-sm font-semibold underline"
                      >
                        {p.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm">
                        <ProjectLikeButton projectId={p.id} />
                        <Link className="underline" href={`/p/${p.id}`}>
                          View
                        </Link>
                        {p.repoUrl ? (
                          <a className="underline" href={p.repoUrl} target="_blank" rel="noopener noreferrer">
                            Repo
                          </a>
                        ) : null}
                        {p.liveUrl ? (
                          <a className="underline" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                            Live
                          </a>
                        ) : null}
                      </div>
                    </div>

                    {p.description ? (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.description}</p>
                    ) : null}

                    {p.techStack.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.techStack.map((t) => (
                          <span key={t} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {!projects.length ? (
              <div className="text-sm text-zinc-500">No featured projects yet.</div>
            ) : null}
          </div>
        </section>

        <section className="space-y-3 rounded border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Links</h2>
          <div className="grid gap-2">
            {links.map((l) => (
              <Link
                key={l.id}
                href={`/l/${l.id}`}
                className="flex items-center justify-between gap-3 rounded border border-zinc-200 px-4 py-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                rel="noopener noreferrer"
              >
                <span className="truncate font-medium">{l.label}</span>
                <span className="text-xs text-zinc-500">Open</span>
              </Link>
            ))}

            {!links.length ? <div className="text-sm text-zinc-500">No links yet.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
