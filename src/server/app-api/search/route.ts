import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skills = searchParams.getAll("skill");
  const techStack = searchParams.getAll("tech");
  const location = searchParams.get("location");
  const openToWork = searchParams.get("openToWork") === "true";
  const sort = searchParams.get("sort") ?? "trending";

  const where: any = { user: { username: { not: null } } };
  if (skills.length) where.skills = { hasSome: skills };
  if (techStack.length) where.projects = { some: { techStack: { hasSome: techStack } } };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (openToWork) where.openToWork = true;

  let orderBy: any[] = [];
  if (sort === "trending") orderBy = [{ updatedAt: "desc" }];
  else if (sort === "new") orderBy = [{ createdAt: "desc" }];
  else if (sort === "active") orderBy = [{ updatedAt: "desc" }];

  const results = await prisma.profile.findMany({
    where,
    orderBy,
    take: 20,
    select: {
      user: { select: { username: true } },
      displayName: true,
      avatarUrl: true,
      skills: true,
      location: true,
      openToWork: true
    }
  });

  return NextResponse.json({ results });
}
