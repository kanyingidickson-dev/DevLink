import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUrl, normalizeUsername, parseSkills } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

  const username = normalizeUsername(body?.username);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : null;
  const bio = typeof body?.bio === "string" ? body.bio.trim() : null;
  const avatarUrl = normalizeUrl(body?.avatarUrl) ?? null;
  const theme = body?.theme === "DARK" ? "DARK" : "LIGHT";
  const skills = parseSkills(body?.skills);

  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username is taken" }, { status: 409 });
    }
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  const queries = [] as any[];

  if (username) {
    queries.push(
      prisma.user.update({
        where: { id: session.user.id },
        data: { username }
      })
    );
  }

  queries.push(
    prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        displayName: displayName ?? profile.displayName,
        bio,
        avatarUrl,
        theme,
        skills
      }
    })
  );

  await prisma.$transaction(queries);

  return NextResponse.json({ ok: true });
}
