import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const secret = speakeasy.generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret.base32 } });
  return NextResponse.json({ otpauth_url: secret.otpauth_url });
}
