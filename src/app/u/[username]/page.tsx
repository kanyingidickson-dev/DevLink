import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params
}: {
  params: { username: string };
}) {
  const username = params.username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: {
        include: {
          links: { orderBy: { createdAt: "desc" } }
        }
      }
    }
  });

  if (!user?.profile) notFound();

  await prisma.analyticsEvent.create({
    data: {
      profileId: user.profile.id,
      type: "VIEW"
    }
  });

  const profile = user.profile;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-zinc-500">@{username}</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {profile.displayName || username}
        </h1>
        {profile.bio ? (
          <p className="max-w-prose text-zinc-600 dark:text-zinc-300">{profile.bio}</p>
        ) : null}
      </div>

      {profile.skills.length ? (
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <span key={s} className="rounded bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-900">
              {s}
            </span>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Links</h2>
        <div className="grid gap-2">
          {profile.links.map((l) => (
            <Link
              key={l.id}
              href={`/l/${l.id}`}
              className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
              rel="noopener noreferrer"
            >
              {l.label}
            </Link>
          ))}

          {!profile.links.length ? (
            <div className="text-sm text-zinc-500">No links yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
