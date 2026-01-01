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
  if (typeof projectId !== "string") return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  await prisma.projectEndorsement.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { message },
    create: { projectId, userId, message }
  });
  return NextResponse.json({ ok: true });
}
