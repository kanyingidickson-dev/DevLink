import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true, projectLikes: true, projectEndorsements: true, projectComments: true, sentMessages: true, receivedMessages: true } });
  return NextResponse.json({ user });
}
