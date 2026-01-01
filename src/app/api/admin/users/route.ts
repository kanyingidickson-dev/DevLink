import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ take: 50, orderBy: { createdAt: "desc" }, select: { id: true, email: true, username: true, createdAt: true } });
  return NextResponse.json({ users });
}
