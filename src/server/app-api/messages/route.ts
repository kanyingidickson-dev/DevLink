import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const withUser = searchParams.get("with");
  if (!withUser) return NextResponse.json({ error: "Missing with" }, { status: 400 });
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: withUser },
        { senderId: withUser, receiverId: userId }
      ]
    },
    orderBy: { createdAt: "asc" },
    take: 50
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const { to, content } = body || {};
  if (typeof to !== "string" || typeof content !== "string" || !content.trim()) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.message.create({ data: { senderId: userId, receiverId: to, content } });
  return NextResponse.json({ ok: true });
}
