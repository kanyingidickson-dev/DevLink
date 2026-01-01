import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ take: 50, orderBy: { createdAt: "desc" }, select: { id: true, title: true, profileId: true, createdAt: true } });
  return NextResponse.json({ projects });
}
