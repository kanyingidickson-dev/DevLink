import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      username: true,
      profile: {
        select: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          theme: true,
          skills: true,
          links: {
            select: { id: true, label: true, url: true, clickCount: true },
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  });

  if (!user?.profile) {
    return NextResponse.json({ error: "Profile missing" }, { status: 404 });
  }

  const [views, clicks] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { profileId: user.profile.id, type: "VIEW" }
    }),
    prisma.analyticsEvent.count({
      where: { profileId: user.profile.id, type: "CLICK" }
    })
  ]);

  return NextResponse.json({
    user: { email: user.email, username: user.username },
    profile: user.profile,
    analytics: { views, clicks }
  });
}
