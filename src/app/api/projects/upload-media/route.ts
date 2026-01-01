import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const form = await req.formData();
  const file = form.get("file");
  const projectId = form.get("projectId");
  if (typeof projectId !== "string" || !file || typeof file === "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  // TODO: Implement file storage, e.g., upload to S3, save URL in project.mediaUrls
  // Placeholder: reject
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
