import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  const comments = await prisma.projectComment.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    take: 50
  });
  return NextResponse.json({ comments });
}
