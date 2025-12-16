import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectLikeButton from "@/components/project-like-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  const projectId = params.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      profile: {
        include: {
          user: { select: { username: true } }
        }
      }
    }
  });

  if (!project?.profile) notFound();

  const ownerUsername = project.profile.user.username;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-sm text-zinc-500">Project</div>
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        {ownerUsername ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            By <Link className="underline" href={`/u/${ownerUsername}`}>{`@${ownerUsername}`}</Link>
          </div>
        ) : null}
      </div>

      <section className="rounded border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {project.imageUrl ? (
            <img
              alt={project.title}
              src={project.imageUrl}
              className="h-24 w-24 rounded border object-cover"
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ProjectLikeButton projectId={project.id} />

              <div className="flex items-center gap-3 text-sm">
                {project.repoUrl ? (
                  <a className="underline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    Repo
                  </a>
                ) : null}
                {project.liveUrl ? (
                  <a className="underline" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Live
                  </a>
                ) : null}
              </div>
            </div>

            {project.description ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{project.description}</p>
            ) : null}

            {project.techStack.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <span key={t} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
