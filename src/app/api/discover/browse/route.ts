import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `discover:browse:${ip}`, limit: 120, windowMs: 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);

  const takeRaw = searchParams.get("take");
  const take = Math.min(Math.max(Number(takeRaw ?? 12) || 12, 1), 50);

  const cursor = searchParams.get("cursor");

  const rows = await prisma.profile.findMany({
    where: { user: { username: { not: null } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1
        }
      : {}),
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      skills: true,
      user: { select: { username: true } }
    }
  });

  const hasMore = rows.length > take;
  const slice = hasMore ? rows.slice(0, take) : rows;

  const profiles = slice
    .filter((p) => p.user.username)
    .map((p) => ({
      cursor: p.id,
      username: p.user.username as string,
      displayName: p.displayName || (p.user.username as string),
      avatarUrl: p.avatarUrl ?? null,
      bio: p.bio ?? null,
      skills: p.skills ?? []
    }));

  return NextResponse.json({
    profiles,
    nextCursor: hasMore ? rows[take].id : null
  });
}
