import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  // Get recent activity from users you follow
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = following.map(f => f.followingId);
  if (!followingIds.length) return NextResponse.json({ activity: [] });

  const activity = await prisma.analyticsEvent.findMany({
    where: { profile: { userId: { in: followingIds } } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      type: true,
      createdAt: true,
      profile: { select: { user: { select: { username: true } }, displayName: true } }
    }
  });

  return NextResponse.json({ activity });
}
