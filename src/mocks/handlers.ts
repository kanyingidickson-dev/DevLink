import { http, HttpResponse } from "msw";

import {
  findProfileByUserId,
  findUserById,
  findUserByUsername,
  getDb,
  makeId,
  updateDb
} from "@/mocks/db";

function getUserId(request: Request) {
  return new URL(request.url).searchParams.get("__user");
}

function requireUserId(request: Request) {
  const userId = getUserId(request);
  return userId || null;
}

function jsonError(message: string, status = 400) {
  return HttpResponse.json({ error: message }, { status });
}

function nowIso() {
  return new Date().toISOString();
}

function fallbackUserId(request: Request) {
  return getUserId(request) || "usr_demo";
}

export const handlers = [
  http.get(/\/api\/auth\/providers(\?.*)?$/, async () => {
    return HttpResponse.json({});
  }),

  http.post(/\/api\/register(\?.*)?$/, async ({ request }: { request: Request }) => {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
    const password = typeof body?.password === "string" ? body.password : null;

    if (!email || !password || password.length < 3) {
      return jsonError("Invalid email or password", 400);
    }

    const db = getDb();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return jsonError("Email already in use", 409);
    }

    let username =
      typeof body?.username === "string" ? body.username.trim().toLowerCase() : email.split("@")[0];
    username = username.replace(/[^a-z0-9_\-]+/g, "");
    if (!username) username = "dev";

    if (db.users.some((u) => u.username.toLowerCase() === username)) {
      username = `${username}-${Math.random().toString(16).slice(2, 6)}`;
    }

    const userId = makeId("usr");

    updateDb((state) => {
      state.users.push({ id: userId, email, username, password });
      state.profiles.push({
        id: `prf_${userId}`,
        userId,
        displayName: username,
        bio: null,
        avatarUrl: null,
        theme: "LIGHT",
        skills: [],
        colorPalette: null,
        vanityUrl: null,
        location: null,
        openToWork: false
      });
    });

    return HttpResponse.json({ user: { id: userId, email, username } });
  }),

  http.get(/\/api\/profile\/me(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const user = findUserById(db, userId);
    const profile = findProfileByUserId(db, userId);
    if (!user || !profile) return jsonError("Profile missing", 404);

    const links = db.links
      .filter((l) => l.profileUserId === userId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((l) => ({ id: l.id, label: l.label, url: l.url, clickCount: l.clickCount }));

    const views = db.analyticsEvents.filter((e) => e.profileUserId === userId && e.type === "VIEW").length;
    const clicks = db.analyticsEvents.filter((e) => e.profileUserId === userId && e.type === "CLICK").length;

    const followersCount = db.follows.filter((f) => f.followingId === userId).length;
    const followingCount = db.follows.filter((f) => f.followerId === userId).length;

    const likesReceived = db.projectLikes.filter((pl) => {
      const project = db.projects.find((p) => p.id === pl.projectId);
      return project?.profileUserId === userId;
    }).length;

    const activity = db.analyticsEvents
      .filter((e) => e.profileUserId === userId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 25)
      .map((e) => ({
        id: e.id,
        type: e.type,
        createdAt: e.createdAt,
        link: e.linkId
          ? {
              id: e.linkId,
              label: db.links.find((l) => l.id === e.linkId)?.label ?? "Link"
            }
          : null
      }));

    return HttpResponse.json({
      user: { email: user.email, username: user.username },
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        theme: profile.theme,
        colorPalette: profile.colorPalette,
        vanityUrl: profile.vanityUrl,
        skills: profile.skills,
        links
      },
      analytics: { views, clicks },
      social: { followersCount, followingCount, likesReceived },
      activity
    });
  }),

  http.get(/\/api\/profile\/links(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const links = db.links
      .filter((l) => l.profileUserId === userId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((l) => ({ id: l.id, label: l.label, url: l.url, clickCount: l.clickCount }));

    return HttpResponse.json(links);
  }),

  http.post(/\/api\/profile\/links(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await request.json().catch(() => null);
    const label = typeof body?.label === "string" ? body.label.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!label || !url) return jsonError("Invalid link", 400);

    const linkId = makeId("lnk");
    updateDb((db) => {
      db.links.push({
        id: linkId,
        profileUserId: userId,
        label,
        url,
        clickCount: 0,
        createdAt: nowIso()
      });
    });

    return HttpResponse.json({ id: linkId });
  }),

  http.delete(/\/api\/profile\/links(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const linkId = new URL(request.url).searchParams.get("linkId");
    if (!linkId) return jsonError("Missing linkId", 400);

    updateDb((db) => {
      db.links = db.links.filter((l) => !(l.id === linkId && l.profileUserId === userId));
    });

    return HttpResponse.json({ ok: true });
  }),

  http.get(/\/api\/profile\/projects(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const projects = db.projects
      .filter((p) => p.profileUserId === userId)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        techStack: p.techStack,
        imageUrl: p.imageUrl,
        featured: p.featured,
        sortOrder: p.sortOrder,
        markdown: p.markdown,
        mediaUrls: p.mediaUrls
      }));

    return HttpResponse.json(projects);
  }),

  http.post(/\/api\/profile\/projects(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return jsonError("Title is required", 400);

    const techStack =
      typeof body?.techStack === "string"
        ? body.techStack
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    const projectId = makeId("prj");
    const createdAt = nowIso();

    updateDb((db) => {
      db.projects.push({
        id: projectId,
        profileUserId: userId,
        title,
        description: typeof body?.description === "string" ? body.description : null,
        markdown: typeof body?.markdown === "string" ? body.markdown : null,
        repoUrl: typeof body?.repoUrl === "string" ? body.repoUrl : null,
        liveUrl: typeof body?.liveUrl === "string" ? body.liveUrl : null,
        techStack,
        imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl : null,
        mediaUrls: Array.isArray(body?.mediaUrls) ? (body.mediaUrls as string[]).filter(Boolean) : [],
        featured: Boolean(body?.featured),
        sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 999,
        createdAt,
        updatedAt: createdAt
      });
    });

    return HttpResponse.json({ id: projectId });
  }),

  http.put(/\/api\/profile\/projects(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const projectId = new URL(request.url).searchParams.get("projectId");
    if (!projectId) return jsonError("Missing projectId", 400);

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return jsonError("Title is required", 400);

    const techStack =
      typeof body?.techStack === "string"
        ? body.techStack
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    updateDb((db) => {
      const p = db.projects.find((x) => x.id === projectId && x.profileUserId === userId) ?? null;
      if (!p) return;
      p.title = title;
      p.description = typeof body?.description === "string" ? body.description : null;
      p.markdown = typeof body?.markdown === "string" ? body.markdown : null;
      p.repoUrl = typeof body?.repoUrl === "string" ? body.repoUrl : null;
      p.liveUrl = typeof body?.liveUrl === "string" ? body.liveUrl : null;
      p.techStack = techStack;
      p.imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : null;
      p.mediaUrls = Array.isArray(body?.mediaUrls) ? (body.mediaUrls as string[]).filter(Boolean) : [];
      p.featured = Boolean(body?.featured);
      p.sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : p.sortOrder;
      p.updatedAt = nowIso();
    });

    return HttpResponse.json({ ok: true });
  }),

  http.delete(/\/api\/profile\/projects(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const projectId = new URL(request.url).searchParams.get("projectId");
    if (!projectId) return jsonError("Missing projectId", 400);

    updateDb((db) => {
      db.projects = db.projects.filter((p) => !(p.id === projectId && p.profileUserId === userId));
      db.projectLikes = db.projectLikes.filter((pl) => pl.projectId !== projectId);
      db.projectComments = db.projectComments.filter((c) => c.projectId !== projectId);
      db.projectEndorsements = db.projectEndorsements.filter((e) => e.projectId !== projectId);
    });

    return HttpResponse.json({ ok: true });
  }),

  http.post(/\/api\/profile\/update(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : null;
    const displayName = typeof body?.displayName === "string" ? body.displayName : null;
    const bio = typeof body?.bio === "string" ? body.bio : null;
    const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl : null;
    const theme = body?.theme === "DARK" ? "DARK" : "LIGHT";
    const colorPalette = typeof body?.colorPalette === "string" ? body.colorPalette : null;
    const vanityUrl = typeof body?.vanityUrl === "string" ? body.vanityUrl : null;

    const skills =
      typeof body?.skills === "string"
        ? body.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    const db = getDb();
    if (username && username.length >= 2) {
      const exists = db.users.some((u) => u.username.toLowerCase() === username && u.id !== userId);
      if (exists) return jsonError("Username already taken", 409);
    }

    updateDb((state) => {
      const u = findUserById(state, userId);
      const p = findProfileByUserId(state, userId);
      if (!u || !p) return;

      if (username && username.length >= 2) u.username = username;
      if (displayName !== null) p.displayName = displayName;
      p.bio = bio;
      p.avatarUrl = avatarUrl;
      p.theme = theme;
      p.skills = skills;
      p.colorPalette = colorPalette;
      p.vanityUrl = vanityUrl;
    });

    return HttpResponse.json({ ok: true });
  }),

  http.post(/\/api\/profile\/avatar(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const avatarUrl = `https://picsum.photos/seed/${encodeURIComponent(userId)}/200`;

    updateDb((db) => {
      const p = findProfileByUserId(db, userId);
      if (!p) return;
      p.avatarUrl = avatarUrl;
    });

    return HttpResponse.json({ avatarUrl });
  }),

  http.get(/\/api\/social\/follow(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.trim() ?? "";
    if (!username) return jsonError("Missing username", 400);

    const target = findUserByUsername(db, username);
    if (!target) return jsonError("User not found", 404);

    const viewerId = getUserId(request);
    const followersCount = db.follows.filter((f) => f.followingId === target.id).length;
    const isFollowing = viewerId
      ? db.follows.some((f) => f.followerId === viewerId && f.followingId === target.id)
      : false;

    return HttpResponse.json({ followersCount, isFollowing });
  }),

  http.post(/\/api\/social\/follow(\?.*)?$/, async ({ request }: { request: Request }) => {
    const viewerId = requireUserId(request);
    if (!viewerId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.trim() ?? "";
    if (!username) return jsonError("Missing username", 400);

    const target = findUserByUsername(db, username);
    if (!target) return jsonError("User not found", 404);
    if (target.id === viewerId) return jsonError("Cannot follow yourself", 400);

    updateDb((state) => {
      const exists = state.follows.some((f) => f.followerId === viewerId && f.followingId === target.id);
      if (exists) return;

      state.follows.push({
        id: makeId("fol"),
        followerId: viewerId,
        followingId: target.id,
        createdAt: nowIso()
      });

      state.notifications.push({
        id: makeId("ntf"),
        userId: target.id,
        type: "FOLLOW",
        isRead: false,
        createdAt: nowIso(),
        readAt: null,
        actorId: viewerId,
        projectId: null
      });
    });

    const nextDb = getDb();
    const followersCount = nextDb.follows.filter((f) => f.followingId === target.id).length;
    const isFollowing = nextDb.follows.some((f) => f.followerId === viewerId && f.followingId === target.id);
    return HttpResponse.json({ followersCount, isFollowing });
  }),

  http.delete(/\/api\/social\/follow(\?.*)?$/, async ({ request }: { request: Request }) => {
    const viewerId = requireUserId(request);
    if (!viewerId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.trim() ?? "";
    if (!username) return jsonError("Missing username", 400);

    const target = findUserByUsername(db, username);
    if (!target) return jsonError("User not found", 404);

    updateDb((state) => {
      state.follows = state.follows.filter((f) => !(f.followerId === viewerId && f.followingId === target.id));
    });

    const nextDb = getDb();
    const followersCount = nextDb.follows.filter((f) => f.followingId === target.id).length;
    const isFollowing = nextDb.follows.some((f) => f.followerId === viewerId && f.followingId === target.id);
    return HttpResponse.json({ followersCount, isFollowing });
  }),

  http.get(/\/api\/social\/project-like(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId")?.trim() ?? "";
    if (!projectId) return jsonError("Missing projectId", 400);

    const viewerId = getUserId(request);
    const likeCount = db.projectLikes.filter((pl) => pl.projectId === projectId).length;
    const liked = viewerId
      ? db.projectLikes.some((pl) => pl.projectId === projectId && pl.userId === viewerId)
      : false;

    return HttpResponse.json({ likeCount, liked });
  }),

  http.post(/\/api\/social\/project-like(\?.*)?$/, async ({ request }: { request: Request }) => {
    const viewerId = requireUserId(request);
    if (!viewerId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId")?.trim() ?? "";
    if (!projectId) return jsonError("Missing projectId", 400);

    const project = db.projects.find((p) => p.id === projectId) ?? null;
    if (!project) return jsonError("Project not found", 404);

    updateDb((state) => {
      const exists = state.projectLikes.some((pl) => pl.projectId === projectId && pl.userId === viewerId);
      if (exists) return;

      state.projectLikes.push({ id: makeId("pl"), userId: viewerId, projectId, createdAt: nowIso() });

      if (project.profileUserId !== viewerId) {
        state.notifications.push({
          id: makeId("ntf"),
          userId: project.profileUserId,
          type: "PROJECT_LIKED",
          isRead: false,
          createdAt: nowIso(),
          readAt: null,
          actorId: viewerId,
          projectId
        });
      }
    });

    const nextDb = getDb();
    const likeCount = nextDb.projectLikes.filter((pl) => pl.projectId === projectId).length;
    const liked = nextDb.projectLikes.some((pl) => pl.projectId === projectId && pl.userId === viewerId);
    return HttpResponse.json({ likeCount, liked });
  }),

  http.delete(/\/api\/social\/project-like(\?.*)?$/, async ({ request }: { request: Request }) => {
    const viewerId = requireUserId(request);
    if (!viewerId) return jsonError("Unauthorized", 401);

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId")?.trim() ?? "";
    if (!projectId) return jsonError("Missing projectId", 400);

    updateDb((state) => {
      state.projectLikes = state.projectLikes.filter((pl) => !(pl.projectId === projectId && pl.userId === viewerId));
    });

    const nextDb = getDb();
    const likeCount = nextDb.projectLikes.filter((pl) => pl.projectId === projectId).length;
    const liked = nextDb.projectLikes.some((pl) => pl.projectId === projectId && pl.userId === viewerId);
    return HttpResponse.json({ likeCount, liked });
  }),

  http.get(/\/api\/notifications(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const notifications = db.notifications
      .filter((n) => n.userId === userId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((n) => {
        const actor = n.actorId ? findUserById(db, n.actorId) : null;
        const project = n.projectId ? db.projects.find((p) => p.id === n.projectId) ?? null : null;
        const actorIsFollowing = n.actorId
          ? db.follows.some((f) => f.followerId === userId && f.followingId === n.actorId)
          : false;

        return {
          id: n.id,
          type: n.type,
          createdAt: n.createdAt,
          isRead: n.isRead,
          actor: actor ? { username: actor.username } : null,
          project: project ? { title: project.title } : null,
          actorIsFollowing
        };
      });

    return HttpResponse.json({ notifications });
  }),

  http.post(/\/api\/notifications(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await request.json().catch(() => null);
    const notificationId = typeof body?.notificationId === "string" ? body.notificationId : null;
    if (!notificationId) return jsonError("Missing notificationId", 400);

    updateDb((db) => {
      const n = db.notifications.find((x) => x.id === notificationId && x.userId === userId) ?? null;
      if (!n) return;
      n.isRead = true;
      n.readAt = nowIso();
    });

    return HttpResponse.json({ ok: true });
  }),

  http.get(/\/api\/messages(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const url = new URL(request.url);
    const withUsername = url.searchParams.get("with")?.trim() ?? "";
    if (!withUsername) return jsonError("Missing with", 400);

    const other = findUserByUsername(db, withUsername);
    if (!other) return HttpResponse.json({ messages: [] });

    const messages = db.messages
      .filter(
        (m) =>
          (m.senderId === userId && m.receiverId === other.id) ||
          (m.senderId === other.id && m.receiverId === userId)
      )
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt }));

    return HttpResponse.json({ messages });
  }),

  http.post(/\/api\/messages(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = requireUserId(request);
    if (!userId) return jsonError("Unauthorized", 401);

    const db = getDb();
    const body = await request.json().catch(() => null);
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!to || !content) return jsonError("Invalid message", 400);

    const receiver = findUserByUsername(db, to);
    if (!receiver) return jsonError("User not found", 404);

    updateDb((state) => {
      state.messages.push({
        id: makeId("msg"),
        senderId: userId,
        receiverId: receiver.id,
        content,
        createdAt: nowIso()
      });
    });

    return HttpResponse.json({ ok: true });
  }),

  http.get(/\/api\/projects\/comments(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId")?.trim() ?? "";
    if (!projectId) return jsonError("Missing projectId", 400);

    const comments = db.projectComments
      .filter((c) => c.projectId === projectId)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((c) => ({ id: c.id, message: c.message, createdAt: c.createdAt }));

    return HttpResponse.json({ comments });
  }),

  http.post(/\/api\/projects\/comment(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = fallbackUserId(request);
    const body = await request.json().catch(() => null);
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!projectId || !message) return jsonError("Invalid comment", 400);

    updateDb((db) => {
      db.projectComments.push({ id: makeId("cmt"), projectId, userId, message, createdAt: nowIso() });
    });

    return HttpResponse.json({ ok: true });
  }),

  http.post(/\/api\/projects\/endorse(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = fallbackUserId(request);
    const body = await request.json().catch(() => null);
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : null;
    if (!projectId) return jsonError("Missing projectId", 400);

    updateDb((db) => {
      const existing = db.projectEndorsements.find((e) => e.projectId === projectId && e.userId === userId) ?? null;
      if (existing) {
        existing.message = message;
        existing.updatedAt = nowIso();
        return;
      }

      const createdAt = nowIso();
      db.projectEndorsements.push({
        id: makeId("end"),
        projectId,
        userId,
        message,
        createdAt,
        updatedAt: createdAt
      });
    });

    return HttpResponse.json({ ok: true });
  }),

  http.get(/\/api\/discover\/trending(\?.*)?$/, async () => {
    const db = getDb();

    const profiles = db.users
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        const views7d = db.analyticsEvents.filter((e) => e.profileUserId === u.id && e.type === "VIEW").length;
        const followersCount = db.follows.filter((f) => f.followingId === u.id).length;
        const likesReceived = db.projectLikes.filter((pl) => {
          const prj = db.projects.find((x) => x.id === pl.projectId);
          return prj?.profileUserId === u.id;
        }).length;

        return {
          username: u.username,
          displayName: p?.displayName ?? u.username,
          avatarUrl: p?.avatarUrl ?? null,
          skills: p?.skills ?? [],
          views7d,
          followersCount,
          likesReceived
        };
      })
      .sort((a, b) => (b.views7d + b.followersCount + b.likesReceived) - (a.views7d + a.followersCount + a.likesReceived))
      .slice(0, 12);

    return HttpResponse.json({ profiles });
  }),

  http.get(/\/api\/discover\/search(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
    if (!q) return HttpResponse.json({ results: [] });

    const results = db.users
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        return {
          username: u.username,
          displayName: p?.displayName ?? u.username,
          avatarUrl: p?.avatarUrl ?? null,
          bio: p?.bio ?? null,
          skills: p?.skills ?? []
        };
      })
      .filter((r) => {
        const hay = `${r.username} ${r.displayName} ${r.bio ?? ""} ${r.skills.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 30);

    return HttpResponse.json({ results });
  }),

  http.get(/\/api\/discover\/autocomplete(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
    if (!q) return HttpResponse.json({ suggestions: [] });

    const suggestions = db.users
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        return {
          username: u.username,
          displayName: p?.displayName ?? u.username,
          avatarUrl: p?.avatarUrl ?? null
        };
      })
      .filter((s) => s.username.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q))
      .slice(0, 10);

    return HttpResponse.json({ suggestions });
  }),

  http.get(/\/api\/discover\/browse(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const cursorRaw = new URL(request.url).searchParams.get("cursor");
    const offset = cursorRaw ? Math.max(0, Number.parseInt(cursorRaw, 10) || 0) : 0;
    const limit = 10;

    const all = db.users
      .slice()
      .sort((a, b) => a.username.localeCompare(b.username))
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        return {
          cursor: u.id,
          username: u.username,
          displayName: p?.displayName ?? u.username,
          avatarUrl: p?.avatarUrl ?? null,
          bio: p?.bio ?? null,
          skills: p?.skills ?? []
        };
      });

    const slice = all.slice(offset, offset + limit);
    const nextCursor = offset + limit < all.length ? String(offset + limit) : null;

    return HttpResponse.json({ profiles: slice, nextCursor });
  }),

  http.get(/\/api\/search(\?.*)?$/, async ({ request }: { request: Request }) => {
    const db = getDb();
    const url = new URL(request.url);

    const skills = url.searchParams.getAll("skill").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const tech = url.searchParams.getAll("tech").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const location = url.searchParams.get("location")?.trim().toLowerCase() ?? "";
    const openToWork = url.searchParams.get("openToWork") === "true";

    const results = db.users
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        return {
          user: { username: u.username },
          displayName: p?.displayName ?? u.username,
          skills: p?.skills ?? [],
          location: p?.location ?? null,
          openToWork: Boolean(p?.openToWork)
        };
      })
      .filter((r) => {
        const rSkills = (r.skills ?? []).map((s: string) => s.toLowerCase());
        const skillOk = skills.length ? skills.every((s) => rSkills.includes(s)) : true;
        const techOk = tech.length ? tech.every((t) => rSkills.includes(t)) : true;
        const locOk = location ? (r.location ?? "").toLowerCase().includes(location) : true;
        const otwOk = openToWork ? r.openToWork : true;
        return skillOk && techOk && locOk && otwOk;
      })
      .slice(0, 50);

    return HttpResponse.json({ results });
  }),

  http.get(/\/api\/dashboard\/feed(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = fallbackUserId(request);
    const db = getDb();

    const followedIds = db.follows.filter((f) => f.followerId === userId).map((f) => f.followingId);
    const scope = new Set([userId, ...followedIds]);

    const activity = db.analyticsEvents
      .filter((e) => scope.has(e.profileUserId))
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 25)
      .map((e) => {
        const p = findProfileByUserId(db, e.profileUserId);
        const u = findUserById(db, e.profileUserId);
        return {
          id: e.id,
          type: e.type,
          createdAt: e.createdAt,
          profile: {
            displayName: p?.displayName ?? null,
            user: { username: u?.username ?? "unknown" }
          }
        };
      });

    return HttpResponse.json({ activity });
  }),

  http.get(/\/api\/dashboard\/suggestions(\?.*)?$/, async ({ request }: { request: Request }) => {
    const userId = fallbackUserId(request);
    const db = getDb();

    const following = new Set(db.follows.filter((f) => f.followerId === userId).map((f) => f.followingId));

    const suggestions = db.users
      .filter((u) => u.id !== userId && !following.has(u.id))
      .slice(0, 8)
      .map((u) => {
        const p = findProfileByUserId(db, u.id);
        return {
          username: u.username,
          profile: p ? { displayName: p.displayName } : null
        };
      });

    return HttpResponse.json({ suggestions });
  }),

  http.get(/\/api\/dashboard\/trending(\?.*)?$/, async () => {
    const db = getDb();

    const skillCounts = new Map<string, number>();
    for (const p of db.profiles) {
      for (const s of p.skills) {
        const key = s.trim();
        if (!key) continue;
        skillCounts.set(key, (skillCounts.get(key) ?? 0) + 1);
      }
    }

    const trendingSkills = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill]) => ({ skill }));

    const trendingProjects = db.projects
      .map((p) => {
        const likes = db.projectLikes.filter((pl) => pl.projectId === p.id).length;
        return { title: p.title, likes };
      })
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 8)
      .map((p) => ({ title: p.title }));

    return HttpResponse.json({ trendingSkills, trendingProjects });
  })
];
