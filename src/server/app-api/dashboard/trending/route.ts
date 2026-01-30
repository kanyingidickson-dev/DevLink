import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Trending skills in last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.profile.findMany({
    where: { updatedAt: { gte: since } },
    select: { skills: true }
  });
  const skillCounts = new Map();
  for (const row of rows) {
    for (const skill of row.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }
  }
  const trendingSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Trending projects (most likes in last 7 days)
  const projectRows = await prisma.projectLike.groupBy({
    by: ["projectId"],
    where: { createdAt: { gte: since } },
    _count: { projectId: true },
    orderBy: { _count: { projectId: "desc" } },
    take: 10
  });
  const trendingProjects = await prisma.project.findMany({
    where: { id: { in: projectRows.map(p => p.projectId) } },
    select: { id: true, title: true, profile: { select: { displayName: true } } }
  });

  return NextResponse.json({ trendingSkills, trendingProjects });
}
