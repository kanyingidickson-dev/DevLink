import {
  SEED_LINKS,
  SEED_PROJECTS,
  SEED_PROFILES,
  SEED_USERS
} from "@/mocks/seed";

export type DemoUser = {
  id: string;
  email: string;
  username: string;
  password: string;
};

export type DemoProfile = {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  theme: "LIGHT" | "DARK";
  skills: string[];
  colorPalette: string | null;
  vanityUrl: string | null;
  location: string | null;
  openToWork: boolean;
};

export type DemoLink = {
  id: string;
  profileUserId: string;
  label: string;
  url: string;
  clickCount: number;
  createdAt: string;
};

export type DemoProject = {
  id: string;
  profileUserId: string;
  title: string;
  description: string | null;
  markdown: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  techStack: string[];
  imageUrl: string | null;
  mediaUrls: string[];
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type DemoFollow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

export type DemoProjectLike = {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
};

export type DemoNotification = {
  id: string;
  userId: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actorId: string | null;
  projectId: string | null;
};

export type DemoMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

export type DemoProjectComment = {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  createdAt: string;
};

export type DemoProjectEndorsement = {
  id: string;
  projectId: string;
  userId: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoAnalyticsEvent = {
  id: string;
  profileUserId: string;
  type: "VIEW" | "CLICK";
  createdAt: string;
  linkId: string | null;
};

export type DemoDb = {
  version: number;
  users: DemoUser[];
  profiles: DemoProfile[];
  links: DemoLink[];
  projects: DemoProject[];
  follows: DemoFollow[];
  projectLikes: DemoProjectLike[];
  notifications: DemoNotification[];
  messages: DemoMessage[];
  projectComments: DemoProjectComment[];
  projectEndorsements: DemoProjectEndorsement[];
  analyticsEvents: DemoAnalyticsEvent[];
};

const STORAGE_KEY = "devlink_demo_db_v1";
const DB_VERSION = 1;

let cache: DemoDb | null = null;

function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return `${prefix}_${id}`;
}

function makeSeedDb(): DemoDb {
  const seededUsers: DemoUser[] = SEED_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    password: u.password
  }));

  const seededProfiles: DemoProfile[] = SEED_PROFILES.map((p) => ({
    id: `prf_${p.userId}`,
    userId: p.userId,
    displayName: p.displayName,
    bio: p.bio,
    avatarUrl: p.avatarUrl,
    theme: p.theme,
    skills: p.skills,
    colorPalette: p.colorPalette,
    vanityUrl: p.vanityUrl,
    location: p.location,
    openToWork: p.openToWork
  }));

  const seededLinks: DemoLink[] = SEED_LINKS.map((l) => ({
    id: l.id,
    profileUserId: l.profileUserId,
    label: l.label,
    url: l.url,
    clickCount: l.clickCount,
    createdAt: l.createdAt
  }));

  const seededProjects: DemoProject[] = SEED_PROJECTS.map((p) => ({
    id: p.id,
    profileUserId: p.profileUserId,
    title: p.title,
    description: p.description,
    markdown: p.markdown,
    repoUrl: p.repoUrl,
    liveUrl: p.liveUrl,
    techStack: p.techStack,
    imageUrl: p.imageUrl,
    mediaUrls: p.mediaUrls,
    featured: p.featured,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt,
    updatedAt: p.createdAt
  }));

  const createdAt = nowIso();

  const follows: DemoFollow[] = [
    { id: "fol_demo_alex", followerId: "usr_demo", followingId: "usr_alex", createdAt },
    { id: "fol_demo_sam", followerId: "usr_demo", followingId: "usr_sam", createdAt },
    { id: "fol_demo_zoe", followerId: "usr_demo", followingId: "usr_zoe", createdAt },
    { id: "fol_demo_morgan", followerId: "usr_demo", followingId: "usr_morgan", createdAt },
    { id: "fol_demo_ava", followerId: "usr_demo", followingId: "usr_ava", createdAt },
    { id: "fol_alex_demo", followerId: "usr_alex", followingId: "usr_demo", createdAt },
    { id: "fol_zoe_demo", followerId: "usr_zoe", followingId: "usr_demo", createdAt },
    { id: "fol_morgan_zoe", followerId: "usr_morgan", followingId: "usr_zoe", createdAt },
    { id: "fol_casey_morgan", followerId: "usr_casey", followingId: "usr_morgan", createdAt },
    { id: "fol_lee_ava", followerId: "usr_lee", followingId: "usr_ava", createdAt },
    { id: "fol_noah_taylor", followerId: "usr_noah", followingId: "usr_taylor", createdAt },
    { id: "fol_riley_alex", followerId: "usr_riley", followingId: "usr_alex", createdAt },
    { id: "fol_jordan_riley", followerId: "usr_jordan", followingId: "usr_riley", createdAt }
  ];

  const projectLikes: DemoProjectLike[] = [
    { id: "pl_alex_demo", userId: "usr_alex", projectId: "prj_demo_1", createdAt },
    { id: "pl_sam_demo", userId: "usr_sam", projectId: "prj_demo_1", createdAt },
    { id: "pl_zoe_demo", userId: "usr_zoe", projectId: "prj_demo_1", createdAt },
    { id: "pl_morgan_demo", userId: "usr_morgan", projectId: "prj_demo_2", createdAt },
    { id: "pl_demo_taylor", userId: "usr_demo", projectId: "prj_taylor_1", createdAt },
    { id: "pl_demo_riley", userId: "usr_demo", projectId: "prj_riley_1", createdAt },
    { id: "pl_demo_morgan", userId: "usr_demo", projectId: "prj_morgan_1", createdAt },
    { id: "pl_alex_morgan", userId: "usr_alex", projectId: "prj_morgan_1", createdAt },
    { id: "pl_casey_ava", userId: "usr_casey", projectId: "prj_ava_1", createdAt },
    { id: "pl_ava_casey", userId: "usr_ava", projectId: "prj_casey_1", createdAt },
    { id: "pl_lee_zoe", userId: "usr_lee", projectId: "prj_zoe_1", createdAt },
    { id: "pl_zoe_lee", userId: "usr_zoe", projectId: "prj_lee_1", createdAt }
  ];

  const notifications: DemoNotification[] = [
    {
      id: "ntf_demo_follow_alex",
      userId: "usr_demo",
      type: "FOLLOW",
      isRead: false,
      createdAt,
      readAt: null,
      actorId: "usr_alex",
      projectId: null
    },
    {
      id: "ntf_demo_follow_zoe",
      userId: "usr_demo",
      type: "FOLLOW",
      isRead: false,
      createdAt,
      readAt: null,
      actorId: "usr_zoe",
      projectId: null
    },
    {
      id: "ntf_demo_like",
      userId: "usr_demo",
      type: "PROJECT_LIKED",
      isRead: false,
      createdAt,
      readAt: null,
      actorId: "usr_sam",
      projectId: "prj_demo_1"
    },
    {
      id: "ntf_demo_like_2",
      userId: "usr_demo",
      type: "PROJECT_LIKED",
      isRead: true,
      createdAt,
      readAt: createdAt,
      actorId: "usr_morgan",
      projectId: "prj_demo_2"
    }
  ];

  const messages: DemoMessage[] = [
    {
      id: "msg_demo_alex_1",
      senderId: "usr_alex",
      receiverId: "usr_demo",
      content: "Hey! Nice profile setup.",
      createdAt
    },
    {
      id: "msg_demo_sam_1",
      senderId: "usr_sam",
      receiverId: "usr_demo",
      content: "Want feedback on the project page layout?",
      createdAt
    },
    {
      id: "msg_demo_sam_2",
      senderId: "usr_demo",
      receiverId: "usr_sam",
      content: "Yes please — especially the featured projects section.",
      createdAt
    }
  ];

  const projectComments: DemoProjectComment[] = [
    {
      id: "cmt_demo_1",
      projectId: "prj_demo_1",
      userId: "usr_alex",
      message: "This is a clean demo!",
      createdAt
    }
  ];

  const projectEndorsements: DemoProjectEndorsement[] = [];

  const analyticsEvents: DemoAnalyticsEvent[] = [
    {
      id: "evt_demo_view_1",
      profileUserId: "usr_demo",
      type: "VIEW",
      createdAt,
      linkId: null
    },
    {
      id: "evt_demo_click_1",
      profileUserId: "usr_demo",
      type: "CLICK",
      createdAt,
      linkId: "lnk_demo_github"
    },
    { id: "evt_demo_view_2", profileUserId: "usr_demo", type: "VIEW", createdAt, linkId: null },
    { id: "evt_demo_view_3", profileUserId: "usr_demo", type: "VIEW", createdAt, linkId: null },
    { id: "evt_demo_view_4", profileUserId: "usr_demo", type: "VIEW", createdAt, linkId: null },
    { id: "evt_demo_click_2", profileUserId: "usr_demo", type: "CLICK", createdAt, linkId: "lnk_demo_site" },
    { id: "evt_demo_click_3", profileUserId: "usr_demo", type: "CLICK", createdAt, linkId: "lnk_demo_twitter" },

    { id: "evt_alex_view_1", profileUserId: "usr_alex", type: "VIEW", createdAt, linkId: null },
    { id: "evt_alex_view_2", profileUserId: "usr_alex", type: "VIEW", createdAt, linkId: null },
    { id: "evt_alex_view_3", profileUserId: "usr_alex", type: "VIEW", createdAt, linkId: null },

    { id: "evt_sam_view_1", profileUserId: "usr_sam", type: "VIEW", createdAt, linkId: null },
    { id: "evt_sam_view_2", profileUserId: "usr_sam", type: "VIEW", createdAt, linkId: null },

    { id: "evt_taylor_view_1", profileUserId: "usr_taylor", type: "VIEW", createdAt, linkId: null },
    { id: "evt_taylor_view_2", profileUserId: "usr_taylor", type: "VIEW", createdAt, linkId: null },
    { id: "evt_taylor_view_3", profileUserId: "usr_taylor", type: "VIEW", createdAt, linkId: null },
    { id: "evt_taylor_view_4", profileUserId: "usr_taylor", type: "VIEW", createdAt, linkId: null },

    { id: "evt_riley_view_1", profileUserId: "usr_riley", type: "VIEW", createdAt, linkId: null },
    { id: "evt_riley_view_2", profileUserId: "usr_riley", type: "VIEW", createdAt, linkId: null },
    { id: "evt_riley_view_3", profileUserId: "usr_riley", type: "VIEW", createdAt, linkId: null },
    { id: "evt_riley_view_4", profileUserId: "usr_riley", type: "VIEW", createdAt, linkId: null },
    { id: "evt_riley_view_5", profileUserId: "usr_riley", type: "VIEW", createdAt, linkId: null },

    { id: "evt_jordan_view_1", profileUserId: "usr_jordan", type: "VIEW", createdAt, linkId: null },

    { id: "evt_morgan_view_1", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },
    { id: "evt_morgan_view_2", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },
    { id: "evt_morgan_view_3", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },
    { id: "evt_morgan_view_4", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },
    { id: "evt_morgan_view_5", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },
    { id: "evt_morgan_view_6", profileUserId: "usr_morgan", type: "VIEW", createdAt, linkId: null },

    { id: "evt_casey_view_1", profileUserId: "usr_casey", type: "VIEW", createdAt, linkId: null },
    { id: "evt_casey_view_2", profileUserId: "usr_casey", type: "VIEW", createdAt, linkId: null },

    { id: "evt_lee_view_1", profileUserId: "usr_lee", type: "VIEW", createdAt, linkId: null },
    { id: "evt_lee_view_2", profileUserId: "usr_lee", type: "VIEW", createdAt, linkId: null },
    { id: "evt_lee_view_3", profileUserId: "usr_lee", type: "VIEW", createdAt, linkId: null },

    { id: "evt_ava_view_1", profileUserId: "usr_ava", type: "VIEW", createdAt, linkId: null },
    { id: "evt_ava_view_2", profileUserId: "usr_ava", type: "VIEW", createdAt, linkId: null },
    { id: "evt_ava_view_3", profileUserId: "usr_ava", type: "VIEW", createdAt, linkId: null },

    { id: "evt_noah_view_1", profileUserId: "usr_noah", type: "VIEW", createdAt, linkId: null },
    { id: "evt_noah_view_2", profileUserId: "usr_noah", type: "VIEW", createdAt, linkId: null },
    { id: "evt_noah_view_3", profileUserId: "usr_noah", type: "VIEW", createdAt, linkId: null },
    { id: "evt_noah_view_4", profileUserId: "usr_noah", type: "VIEW", createdAt, linkId: null },

    { id: "evt_zoe_view_1", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_2", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_3", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_4", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_5", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_6", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null },
    { id: "evt_zoe_view_7", profileUserId: "usr_zoe", type: "VIEW", createdAt, linkId: null }
  ];

  return {
    version: DB_VERSION,
    users: seededUsers,
    profiles: seededProfiles,
    links: seededLinks,
    projects: seededProjects,
    follows,
    projectLikes,
    notifications,
    messages,
    projectComments,
    projectEndorsements,
    analyticsEvents
  };
}

function loadFromStorage(): DemoDb | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoDb;

    if (!parsed || parsed.version !== DB_VERSION) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function getDb(): DemoDb {
  if (cache) return cache;
  cache = loadFromStorage() ?? makeSeedDb();
  saveDb();
  return cache;
}

export function saveDb() {
  if (typeof window === "undefined") return;
  if (!cache) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
  }
}

export function resetDb(): DemoDb {
  cache = makeSeedDb();
  saveDb();
  return cache;
}

export function updateDb(fn: (db: DemoDb) => void): DemoDb {
  const db = getDb();
  fn(db);
  saveDb();
  return db;
}

export function findUserById(db: DemoDb, userId: string) {
  return db.users.find((u) => u.id === userId) ?? null;
}

export function findUserByUsername(db: DemoDb, username: string) {
  const u = username.trim().toLowerCase();
  return db.users.find((x) => x.username.toLowerCase() === u) ?? null;
}

export function findProfileByUserId(db: DemoDb, userId: string) {
  return db.profiles.find((p) => p.userId === userId) ?? null;
}
