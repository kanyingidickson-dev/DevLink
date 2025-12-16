import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@devlink.local";
  const username = "demo";
  const password = "password123";

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    const profile =
      existing.profile ??
      (await prisma.profile.create({
        data: {
          userId: existing.id,
          displayName: "Demo Dev",
          bio: "This is seeded demo data.",
          skills: ["TypeScript", "Next.js", "Postgres"],
          theme: "LIGHT"
        }
      }));

    const projectCount = await prisma.project.count({ where: { profileId: profile.id } });
    if (projectCount === 0) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          projects: {
            create: [
              {
                title: "DevLink",
                description: "A developer profile hub with links, projects, and analytics.",
                repoUrl: "https://github.com",
                liveUrl: "https://example.com",
                techStack: ["Next.js", "Prisma", "Postgres"],
                featured: true,
                sortOrder: 1
              },
              {
                title: "CLI Toolbox",
                description: "A collection of small developer utilities.",
                repoUrl: "https://github.com",
                techStack: ["Node.js", "TypeScript"],
                featured: true,
                sortOrder: 2
              }
            ]
          }
        }
      });
    }

    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      username,
      profile: {
        create: {
          displayName: "Demo Dev",
          bio: "This is seeded demo data.",
          skills: ["TypeScript", "Next.js", "Postgres"],
          theme: "LIGHT",
          links: {
            create: [
              { label: "GitHub", url: "https://github.com" },
              { label: "Portfolio", url: "https://example.com" }
            ]
          },
          projects: {
            create: [
              {
                title: "DevLink",
                description: "A developer profile hub with links, projects, and analytics.",
                repoUrl: "https://github.com",
                liveUrl: "https://example.com",
                techStack: ["Next.js", "Prisma", "Postgres"],
                featured: true,
                sortOrder: 1
              },
              {
                title: "CLI Toolbox",
                description: "A collection of small developer utilities.",
                repoUrl: "https://github.com",
                techStack: ["Node.js", "TypeScript"],
                featured: true,
                sortOrder: 2
              }
            ]
          }
        }
      }
    }
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
