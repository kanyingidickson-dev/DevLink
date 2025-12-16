import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { parseSkills } from "@/lib/validators";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `discover:search:${ip}`, limit: 120, windowMs: 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const qRaw = searchParams.get("q");
  const q = typeof qRaw === "string" ? qRaw.trim() : "";

  if (!q) return NextResponse.json({ results: [] });

  const tokens = Array.from(
    new Set(
      q
        .split(/[\s,]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  ).slice(0, 8);

  const skills = parseSkills(q);
  const allTerms = Array.from(new Set([...tokens, ...skills])).slice(0, 8);

  const whereParts: Prisma.Sql[] = [];
  for (const term of allTerms) {
    const like = `%${term}%`;
    whereParts.push(Prisma.sql`
      u.username ILIKE ${like}
      OR p."displayName" ILIKE ${like}
      OR COALESCE(p.bio, '') ILIKE ${like}
      OR EXISTS (SELECT 1 FROM unnest(p.skills) s WHERE s ILIKE ${like})
    `);
  }

  const whereSql = whereParts.length
    ? Prisma.sql`(${Prisma.join(whereParts, Prisma.sql` OR `)})`
    : Prisma.sql`(u.username ILIKE ${`%${q}%`} OR p."displayName" ILIKE ${`%${q}%`})`;

  const rows = await prisma.$queryRaw<
    {
      username: string | null;
      displayName: string;
      avatarUrl: string | null;
      bio: string | null;
      skills: string[];
    }[]
  >(Prisma.sql`
    SELECT
      u.username,
      p."displayName" as "displayName",
      p."avatarUrl" as "avatarUrl",
      p.bio,
      p.skills
    FROM "User" u
    JOIN "Profile" p ON p."userId" = u.id
    WHERE u.username IS NOT NULL AND ${whereSql}
    LIMIT 25
  `);

  const results = rows
    .filter((r) => r.username)
    .map((r) => ({
      username: r.username as string,
      displayName: r.displayName || (r.username as string),
      avatarUrl: r.avatarUrl ?? null,
      bio: r.bio ?? null,
      skills: r.skills ?? []
    }));

  return NextResponse.json({ results });
}
