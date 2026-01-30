import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      createdAt: true,
      readAt: true,
      actor: { select: { id: true, username: true } },
      project: { select: { id: true, title: true } }
    }
  });

  const followActorIds = notifications
    .filter((n) => n.type === "FOLLOW" && n.actor?.id)
    .map((n) => n.actor!.id);

  const following = followActorIds.length
    ? await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: Array.from(new Set(followActorIds)) }
        },
        select: { followingId: true }
      })
    : [];

  const followingSet = new Set(following.map((f) => f.followingId));

  const items = notifications.map((n) => ({
    ...n,
    actorIsFollowing: n.type === "FOLLOW" && n.actor?.id ? followingSet.has(n.actor.id) : null
  }));

  return NextResponse.json({ notifications: items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const notificationId = typeof body?.notificationId === "string" ? body.notificationId : null;
  if (!notificationId) return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { readAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
