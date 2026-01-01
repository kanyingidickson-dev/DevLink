import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, type: true, isRead: true, createdAt: true, actor: { select: { username: true } }, project: { select: { title: true } } }
  });
  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const { notificationId } = body || {};
  if (typeof notificationId !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.notification.update({ where: { id: notificationId, userId }, data: { isRead: true, readAt: new Date() } });
  return NextResponse.json({ ok: true });
}
