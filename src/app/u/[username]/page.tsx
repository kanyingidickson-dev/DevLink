import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import FollowButton from "@/components/follow-button";
import ProjectLikeButton from "@/components/project-like-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params
}: {
  params: { username: string };
}) {
  const username = (params.username || "").toLowerCase();
  if (!username) notFound();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: {
        include: {
          links: { orderBy: { createdAt: "desc" } },
          projects: {
            where: { featured: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
          }
        }
      }
    }
  });

  if (!user?.profile) notFound();

  const session = await getServerSession(authOptions);
  const canFollow = session?.user?.id ? session.user.id !== user.id : true;

  void prisma.analyticsEvent
    .create({
      data: {
        profileId: user.profile.id,
        type: "VIEW"
      }
    })
    .catch(() => null);

  const profile = user.profile;
  const displayName = profile.displayName || username;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-8">
      <section className="rounded border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {profile.avatarUrl ? (
            <img
              alt={displayName}
              src={profile.avatarUrl}
              className="h-20 w-20 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-zinc-50 text-lg font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
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
        <section className="space-y-3 rounded border p-6">
          <h2 className="text-lg font-semibold">Featured projects</h2>
          <div className="grid gap-3">
            {profile.projects.map((p) => (
              <div key={p.id} className="rounded border p-4">
                <div className="flex gap-4">
                  {p.imageUrl ? (
                    <img
                      alt={p.title}
                      src={p.imageUrl}
                      className="hidden h-16 w-16 rounded border object-cover sm:block"
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

            {!profile.projects.length ? (
              <div className="text-sm text-zinc-500">No featured projects yet.</div>
            ) : null}
          </div>
        </section>

        <section className="space-y-3 rounded border p-6">
          <h2 className="text-lg font-semibold">Links</h2>
          <div className="grid gap-2">
            {profile.links.map((l) => (
              <Link
                key={l.id}
                href={`/l/${l.id}`}
                className="flex items-center justify-between gap-3 rounded border px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                rel="noopener noreferrer"
              >
                <span className="truncate font-medium">{l.label}</span>
                <span className="text-xs text-zinc-500">Open</span>
              </Link>
            ))}

            {!profile.links.length ? <div className="text-sm text-zinc-500">No links yet.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
