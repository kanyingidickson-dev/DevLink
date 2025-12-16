import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, normalizeUsername } from "@/lib/validators";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `register:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.max(Math.ceil((rl.resetAt - Date.now()) / 1000), 1))
        }
      }
    );
  }

  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const requestedUsername = normalizeUsername(body?.username);
  const base = requestedUsername ?? email.split("@")[0].replace(/[^a-zA-Z0-9_]+/g, "").toLowerCase();
  const usernameSeed = base || "dev";

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let username = usernameSeed;
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) username = `${usernameSeed}-${Math.random().toString(16).slice(2, 6)}`;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        profile: {
          create: {
            displayName: username
          }
        }
      },
      select: { id: true, email: true, username: true }
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
