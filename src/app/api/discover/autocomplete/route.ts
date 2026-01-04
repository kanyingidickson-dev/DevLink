import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Lightweight autocomplete for the Discover search box.
 *
 * Notes:
 * - Rate limited to reduce DB load.
 * - `queryMode` is `as const` so Prisma treats it as the `QueryMode` literal instead of widening to `string`.
 */

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `discover:autocomplete:${ip}`, limit: 180, windowMs: 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const queryMode = "insensitive" as const;

  const { searchParams } = new URL(req.url);
  const qRaw = searchParams.get("q");
  const q = typeof qRaw === "string" ? qRaw.trim() : "";

  if (!q) return NextResponse.json({ suggestions: [] });

  const tokens = Array.from(
    new Set(
      q
        .split(/[\s,]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  ).slice(0, 5);

  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      OR: [
        { username: { contains: q, mode: queryMode } },
        ...tokens.map((t) => ({ username: { contains: t, mode: queryMode } }))
      ]
    },
    take: 8,
    select: {
      username: true,
      profile: {
        select: {
          displayName: true,
          avatarUrl: true
        }
      }
    }
  });

  const suggestions = users
    .filter((u) => u.username)
    .map((u) => ({
      username: u.username as string,
      displayName: u.profile?.displayName || (u.username as string),
      avatarUrl: u.profile?.avatarUrl ?? null
    }));

  return NextResponse.json({ suggestions });
}
