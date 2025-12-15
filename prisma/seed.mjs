import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@devlink.local";
  const username = "demo";
  const password = "password123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);

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
