import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const [likeCount, session] = await Promise.all([
    prisma.projectLike.count({ where: { projectId } }),
    getServerSession(authOptions)
  ]);

  if (!session) return NextResponse.json({ likeCount, liked: false });

  const liked = await prisma.projectLike.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
    select: { id: true }
  });

  return NextResponse.json({ likeCount, liked: Boolean(liked) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, profile: { select: { userId: true } } }
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.projectLike.create({
      data: { userId: session.user.id, projectId }
    });

    if (project.profile.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: project.profile.userId,
          type: "PROJECT_LIKED",
          actorId: session.user.id,
          projectId
        }
      });
    }
  } catch {
    // ignore duplicates
  }

  const likeCount = await prisma.projectLike.count({ where: { projectId } });
  return NextResponse.json({ ok: true, likeCount, liked: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  await prisma.projectLike
    .delete({
      where: { userId_projectId: { userId: session.user.id, projectId } }
    })
    .catch(() => null);

  const likeCount = await prisma.projectLike.count({ where: { projectId } });
  return NextResponse.json({ ok: true, likeCount, liked: false });
}
