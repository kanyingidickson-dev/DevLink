import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const { targetType, targetId, reason } = body || {};
  // TODO: Save to moderation queue
  console.log(`Abuse report: ${targetType} ${targetId} by ${userId}: ${reason}`);
  return NextResponse.json({ ok: true });
}
