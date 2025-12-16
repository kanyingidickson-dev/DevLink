import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  const link = await prisma.link.findUnique({
    where: { id: params.linkId },
    include: { profile: true }
  });

  if (!link) return NextResponse.redirect(new URL("/", req.url));

  await prisma.$transaction([
    prisma.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } }
    }),
    prisma.analyticsEvent.create({
      data: {
        profileId: link.profileId,
        linkId: link.id,
        type: "CLICK"
      }
    })
  ]);

  return NextResponse.redirect(link.url);
}
