import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === "string" ? body.profileId : null;

  if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 });

  await prisma.analyticsEvent.create({
    data: { profileId, type: "VIEW" }
  });

  return NextResponse.json({ ok: true });
}
