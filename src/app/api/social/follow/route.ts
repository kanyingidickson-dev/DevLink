import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.toLowerCase();
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [followersCount, session] = await Promise.all([
    prisma.follow.count({ where: { followingId: target.id } }),
    getServerSession(authOptions)
  ]);

  if (!session) {
    return NextResponse.json({ followersCount, isFollowing: false });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: target.id
      }
    },
    select: { id: true }
  });

  return NextResponse.json({ followersCount, isFollowing: Boolean(existing) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.toLowerCase();
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: target.id }
    });

    await prisma.notification.create({
      data: {
        userId: target.id,
        type: "FOLLOW",
        actorId: session.user.id
      }
    });
  } catch {
    // ignore duplicates
  }

  const followersCount = await prisma.follow.count({ where: { followingId: target.id } });
  return NextResponse.json({ ok: true, followersCount, isFollowing: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.toLowerCase();
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.follow
    .delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: target.id
        }
      }
    })
    .catch(() => null);

  const followersCount = await prisma.follow.count({ where: { followingId: target.id } });
  return NextResponse.json({ ok: true, followersCount, isFollowing: false });
}
