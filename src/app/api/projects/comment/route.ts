import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const { projectId, message } = body || {};
  if (typeof projectId !== "string" || typeof message !== "string" || !message.trim()) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await prisma.projectComment.create({ data: { projectId, userId, message } });
  return NextResponse.json({ ok: true });
}
