import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUrl } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = await prisma.link.findMany({
    where: { profile: { userId: session.user.id } },
    select: { id: true, label: true, url: true, clickCount: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(links);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : null;
  const url = normalizeUrl(body?.url);

  if (!label || label.length < 1 || label.length > 32) {
    return NextResponse.json({ error: "Invalid label" }, { status: 400 });
  }
  if (!url) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  const link = await prisma.link.create({
    data: { profileId: profile.id, label, url },
    select: { id: true, label: true, url: true, clickCount: true }
  });

  return NextResponse.json(link);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("linkId");
  if (!linkId) return NextResponse.json({ error: "Missing linkId" }, { status: 400 });

  const link = await prisma.link.findFirst({
    where: { id: linkId, profile: { userId: session.user.id } },
    select: { id: true }
  });

  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.link.delete({ where: { id: link.id } });
  return NextResponse.json({ ok: true });
}
