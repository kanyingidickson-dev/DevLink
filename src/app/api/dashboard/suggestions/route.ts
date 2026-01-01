import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  // Suggest users not already followed
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = following.map(f => f.followingId).concat([userId]);

  const suggestions = await prisma.user.findMany({
    where: { id: { notIn: followingIds }, username: { not: null } },
    take: 8,
    select: { username: true, profile: { select: { displayName: true, avatarUrl: true } } }
  });

  return NextResponse.json({ suggestions });
}
