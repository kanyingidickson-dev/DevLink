import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `discover:trending:${ip}`, limit: 120, windowMs: 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["profileId"],
    where: { type: "VIEW", createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10
  });

  const profileIds = grouped.map((g) => g.profileId);
  if (!profileIds.length) {
    const recent = await prisma.profile.findMany({
      where: { user: { username: { not: null } } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        skills: true,
        user: { select: { id: true, username: true } }
      }
    });

    const userIds = recent.map((p) => p.user.id);
    const followerGroups = await prisma.follow.groupBy({
      by: ["followingId"],
      where: { followingId: { in: userIds } },
      _count: { id: true }
    });
    const followersByUserId = new Map(
      followerGroups.map((g) => [g.followingId, g._count.id] as const)
    );

    const recentProfileIds = recent.map((p) => p.id);
    const likeRows = recentProfileIds.length
      ? await prisma.$queryRaw<{ profileId: string; count: bigint }[]>(Prisma.sql`
          SELECT
            p."profileId" as "profileId",
            COUNT(pl.id) as count
          FROM "ProjectLike" pl
          JOIN "Project" p ON p.id = pl."projectId"
          WHERE p."profileId" IN (${Prisma.join(recentProfileIds)})
          GROUP BY p."profileId"
        `)
      : [];
    const likesByProfileId = new Map(
      likeRows.map((r) => [r.profileId, typeof r.count === "bigint" ? Number(r.count) : Number(r.count)] as const)
    );

    const profiles = recent.map((p) => ({
      username: p.user.username as string,
      displayName: p.displayName || (p.user.username as string),
      avatarUrl: p.avatarUrl ?? null,
      skills: p.skills,
      views7d: 0,
      followersCount: followersByUserId.get(p.user.id) ?? 0,
      likesReceived: likesByProfileId.get(p.id) ?? 0
    }));

    return NextResponse.json({ profiles });
  }

  const profiles = await prisma.profile.findMany({
    where: { id: { in: profileIds } },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      skills: true,
      user: { select: { id: true, username: true } }
    }
  });

  const countById = new Map(grouped.map((g) => [g.profileId, g._count.id] as const));

  const userIds = profiles.map((p) => p.user.id);
  const followerGroups = await prisma.follow.groupBy({
    by: ["followingId"],
    where: { followingId: { in: userIds } },
    _count: { id: true }
  });
  const followersByUserId = new Map(
    followerGroups.map((g) => [g.followingId, g._count.id] as const)
  );

  const likeRows = profiles.length
    ? await prisma.$queryRaw<{ profileId: string; count: bigint }[]>(Prisma.sql`
        SELECT
          p."profileId" as "profileId",
          COUNT(pl.id) as count
        FROM "ProjectLike" pl
        JOIN "Project" p ON p.id = pl."projectId"
        WHERE p."profileId" IN (${Prisma.join(profiles.map((p) => p.id))})
        GROUP BY p."profileId"
      `)
    : [];
  const likesByProfileId = new Map(
    likeRows.map((r) => [r.profileId, typeof r.count === "bigint" ? Number(r.count) : Number(r.count)] as const)
  );

  const items = profiles
    .filter((p) => p.user.username)
    .map((p) => ({
      username: p.user.username as string,
      displayName: p.displayName || p.user.username,
      avatarUrl: p.avatarUrl ?? null,
      skills: p.skills,
      views7d: countById.get(p.id) ?? 0,
      followersCount: followersByUserId.get(p.user.id) ?? 0,
      likesReceived: likesByProfileId.get(p.id) ?? 0
    }))
    .sort((a, b) => b.views7d - a.views7d);

  return NextResponse.json({ profiles: items });
}
