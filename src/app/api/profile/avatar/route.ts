import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function safeExt(filename: string, mimeType: string) {
  const extFromName = path.extname(filename).toLowerCase();
  if (extFromName && extFromName.length <= 10) return extFromName;

  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".img";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const arrayBuf = await file.arrayBuffer();
  if (arrayBuf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const ext = safeExt(file.name, file.type);
  const name = `${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const absPath = path.join(uploadDir, name);
  await fs.writeFile(absPath, Buffer.from(arrayBuf));

  const avatarUrl = `/uploads/${name}`;

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { avatarUrl }
  });

  return NextResponse.json({ avatarUrl });
}
