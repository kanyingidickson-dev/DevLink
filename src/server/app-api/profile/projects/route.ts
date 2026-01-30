import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeUrl, parseSkills } from "@/lib/validators";

function optionalUrl(raw: unknown) {
  if (raw == null) return null;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return normalizeUrl(trimmed);
}

function parseTechStack(raw: unknown) {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 30);

    return Array.from(new Set(cleaned));
  }

  return parseSkills(raw);
}

function parseSortOrder(raw: unknown) {
  const n =
    typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n)) return 999;
  return Math.max(0, Math.min(9999, Math.floor(n)));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { profile: { userId: session.user.id } },
    select: {
      id: true,
      title: true,
      description: true,
      repoUrl: true,
      liveUrl: true,
      techStack: true,
      imageUrl: true,
      featured: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const description = typeof body?.description === "string" ? body.description.trim() : null;

  if (!title || title.length < 1 || title.length > 80) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  if (description && description.length > 600) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  const repoUrl = optionalUrl(body?.repoUrl);
  const liveUrl = optionalUrl(body?.liveUrl);
  const imageUrl = optionalUrl(body?.imageUrl);
  if (body?.repoUrl && !repoUrl) return NextResponse.json({ error: "Invalid repoUrl" }, { status: 400 });
  if (body?.liveUrl && !liveUrl) return NextResponse.json({ error: "Invalid liveUrl" }, { status: 400 });
  if (body?.imageUrl && !imageUrl) return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 });

  const techStack = parseTechStack(body?.techStack);
  const featured = body?.featured === true;
  const sortOrder = parseSortOrder(body?.sortOrder);

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  const project = await prisma.project.create({
    data: {
      profileId: profile.id,
      title,
      description: description ? description : null,
      repoUrl,
      liveUrl,
      techStack,
      imageUrl,
      featured,
      sortOrder
    },
    select: {
      id: true,
      title: true,
      description: true,
      repoUrl: true,
      liveUrl: true,
      techStack: true,
      imageUrl: true,
      featured: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json(project);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const description = typeof body?.description === "string" ? body.description.trim() : null;

  if (!title || title.length < 1 || title.length > 80) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  if (description && description.length > 600) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  const repoUrl = optionalUrl(body?.repoUrl);
  const liveUrl = optionalUrl(body?.liveUrl);
  const imageUrl = optionalUrl(body?.imageUrl);
  if (body?.repoUrl && !repoUrl) return NextResponse.json({ error: "Invalid repoUrl" }, { status: 400 });
  if (body?.liveUrl && !liveUrl) return NextResponse.json({ error: "Invalid liveUrl" }, { status: 400 });
  if (body?.imageUrl && !imageUrl) return NextResponse.json({ error: "Invalid imageUrl" }, { status: 400 });

  const techStack = parseTechStack(body?.techStack);
  const featured = body?.featured === true;
  const sortOrder = parseSortOrder(body?.sortOrder);

  const existing = await prisma.project.findFirst({
    where: { id: projectId, profile: { userId: session.user.id } },
    select: { id: true }
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.update({
    where: { id: existing.id },
    data: {
      title,
      description: description ? description : null,
      repoUrl,
      liveUrl,
      techStack,
      imageUrl,
      featured,
      sortOrder
    },
    select: {
      id: true,
      title: true,
      description: true,
      repoUrl: true,
      liveUrl: true,
      techStack: true,
      imageUrl: true,
      featured: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json(project);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const existing = await prisma.project.findFirst({
    where: { id: projectId, profile: { userId: session.user.id } },
    select: { id: true }
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
