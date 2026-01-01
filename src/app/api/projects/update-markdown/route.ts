import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const { projectId, markdown } = body || {};
  if (typeof projectId !== "string" || typeof markdown !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.profileId !== session.user.profileId) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  await prisma.project.update({ where: { id: projectId }, data: { markdown } });
  return NextResponse.json({ ok: true });
}
