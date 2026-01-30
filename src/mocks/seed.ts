export type SeedUser = {
  id: string;
  email: string;
  username: string;
  password: string;
};

export type SeedProfile = {
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

export type SeedLink = {
  id: string;
  profileUserId: string;
  label: string;
  url: string;
  clickCount: number;
  createdAt: string;
};

export type SeedProject = {
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
};

export const SEED_USERS: SeedUser[] = [
  {
    id: "usr_demo",
    email: "demo@devlink.app",
    username: "demo",
    password: "demo"
  },
  {
    id: "usr_alex",
    email: "alex@devlink.app",
    username: "alex",
    password: "demo"
  },
  {
    id: "usr_sam",
    email: "sam@devlink.app",
    username: "sam",
    password: "demo"
  },
  {
    id: "usr_taylor",
    email: "taylor@devlink.app",
    username: "taylor",
    password: "demo"
  },
  {
    id: "usr_riley",
    email: "riley@devlink.app",
    username: "riley",
    password: "demo"
  },
  {
    id: "usr_jordan",
    email: "jordan@devlink.app",
    username: "jordan",
    password: "demo"
  },
  {
    id: "usr_morgan",
    email: "morgan@devlink.app",
    username: "morgan",
    password: "demo"
  },
  {
    id: "usr_casey",
    email: "casey@devlink.app",
    username: "casey",
    password: "demo"
  },
  {
    id: "usr_lee",
    email: "lee@devlink.app",
    username: "lee",
    password: "demo"
  },
  {
    id: "usr_ava",
    email: "ava@devlink.app",
    username: "ava",
    password: "demo"
  },
  {
    id: "usr_noah",
    email: "noah@devlink.app",
    username: "noah",
    password: "demo"
  },
  {
    id: "usr_zoe",
    email: "zoe@devlink.app",
    username: "zoe",
    password: "demo"
  }
];

export const SEED_PROFILES: SeedProfile[] = [
  {
    userId: "usr_demo",
    displayName: "Demo User",
    bio: "A seeded demo account for the DevLink MSW preview.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["Next.js", "TypeScript", "MSW"],
    colorPalette: null,
    vanityUrl: null,
    location: "Remote",
    openToWork: true
  },
  {
    userId: "usr_alex",
    displayName: "Alex Kim",
    bio: "Full-stack dev. Building tiny tools that feel fast.",
    avatarUrl: "https://images.unsplash.com/photo-1520975958225-7f61d78b77b2?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["React", "Node.js", "Postgres"],
    colorPalette: null,
    vanityUrl: null,
    location: "Berlin",
    openToWork: false
  },
  {
    userId: "usr_sam",
    displayName: "Sam Patel",
    bio: "Design systems + frontend performance.",
    avatarUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["UI", "Tailwind", "Accessibility"],
    colorPalette: null,
    vanityUrl: null,
    location: "London",
    openToWork: true
  },
  {
    userId: "usr_taylor",
    displayName: "Taylor Nguyen",
    bio: "Backend engineer. API ergonomics enthusiast.",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["Go", "Kubernetes", "GraphQL"],
    colorPalette: null,
    vanityUrl: null,
    location: "Toronto",
    openToWork: false
  },
  {
    userId: "usr_riley",
    displayName: "Riley Chen",
    bio: "Developer advocate & community builder.",
    avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["Content", "DevRel", "OSS"],
    colorPalette: null,
    vanityUrl: null,
    location: "San Francisco",
    openToWork: true
  },
  {
    userId: "usr_jordan",
    displayName: "Jordan Smith",
    bio: "Mobile + web. Shipping features weekly.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["React Native", "Expo", "TypeScript"],
    colorPalette: null,
    vanityUrl: null,
    location: "Austin",
    openToWork: false
  },
  {
    userId: "usr_morgan",
    displayName: "Morgan Rivera",
    bio: "Data + product. Turning ideas into dashboards.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["Python", "Data Viz", "SQL"],
    colorPalette: null,
    vanityUrl: null,
    location: "New York",
    openToWork: true
  },
  {
    userId: "usr_casey",
    displayName: "Casey Johnson",
    bio: "SRE-ish. Reliability, observability, and calm incident response.",
    avatarUrl: "https://images.unsplash.com/photo-1520975693411-b4dd8b76d51f?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["Terraform", "AWS", "Observability"],
    colorPalette: null,
    vanityUrl: null,
    location: "Seattle",
    openToWork: false
  },
  {
    userId: "usr_lee",
    displayName: "Lee Park",
    bio: "Frontend engineer focused on UX and speed.",
    avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["React", "Performance", "CSS"],
    colorPalette: null,
    vanityUrl: null,
    location: "Seoul",
    openToWork: true
  },
  {
    userId: "usr_ava",
    displayName: "Ava Martinez",
    bio: "API design + DX. I like clean contracts.",
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["TypeScript", "REST", "OpenAPI"],
    colorPalette: null,
    vanityUrl: null,
    location: "Madrid",
    openToWork: true
  },
  {
    userId: "usr_noah",
    displayName: "Noah Williams",
    bio: "Building side projects with friends. Always iterating.",
    avatarUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=240&q=80",
    theme: "DARK",
    skills: ["Next.js", "Stripe", "Product"],
    colorPalette: null,
    vanityUrl: null,
    location: "Dublin",
    openToWork: false
  },
  {
    userId: "usr_zoe",
    displayName: "Zoe Chen",
    bio: "Designer who codes. Prototyping ideas quickly.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
    theme: "LIGHT",
    skills: ["Design", "Figma", "React"],
    colorPalette: null,
    vanityUrl: null,
    location: "Singapore",
    openToWork: true
  }
];

export const SEED_LINKS: SeedLink[] = [
  {
    id: "lnk_demo_github",
    profileUserId: "usr_demo",
    label: "GitHub",
    url: "https://github.com/",
    clickCount: 14,
    createdAt: "2024-01-04T12:00:00.000Z"
  },
  {
    id: "lnk_demo_site",
    profileUserId: "usr_demo",
    label: "Portfolio",
    url: "https://example.com",
    clickCount: 9,
    createdAt: "2024-01-06T12:00:00.000Z"
  },
  {
    id: "lnk_demo_twitter",
    profileUserId: "usr_demo",
    label: "X / Twitter",
    url: "https://x.com",
    clickCount: 7,
    createdAt: "2024-01-07T12:00:00.000Z"
  },
  {
    id: "lnk_alex_linkedin",
    profileUserId: "usr_alex",
    label: "LinkedIn",
    url: "https://linkedin.com",
    clickCount: 2,
    createdAt: "2024-01-02T12:00:00.000Z"
  },
  {
    id: "lnk_alex_github",
    profileUserId: "usr_alex",
    label: "GitHub",
    url: "https://github.com/",
    clickCount: 6,
    createdAt: "2024-01-03T12:00:00.000Z"
  },
  {
    id: "lnk_sam_portfolio",
    profileUserId: "usr_sam",
    label: "Portfolio",
    url: "https://example.com",
    clickCount: 8,
    createdAt: "2024-01-09T12:00:00.000Z"
  },
  {
    id: "lnk_sam_blog",
    profileUserId: "usr_sam",
    label: "Blog",
    url: "https://example.com/blog",
    clickCount: 5,
    createdAt: "2024-01-08T12:00:00.000Z"
  },
  {
    id: "lnk_taylor_github",
    profileUserId: "usr_taylor",
    label: "GitHub",
    url: "https://github.com/",
    clickCount: 4,
    createdAt: "2024-01-05T12:00:00.000Z"
  },
  {
    id: "lnk_taylor_blog",
    profileUserId: "usr_taylor",
    label: "Notes",
    url: "https://example.com/notes",
    clickCount: 3,
    createdAt: "2024-01-06T12:00:00.000Z"
  },
  {
    id: "lnk_riley_youtube",
    profileUserId: "usr_riley",
    label: "YouTube",
    url: "https://youtube.com",
    clickCount: 11,
    createdAt: "2024-01-11T12:00:00.000Z"
  },
  {
    id: "lnk_riley_newsletter",
    profileUserId: "usr_riley",
    label: "Newsletter",
    url: "https://example.com/newsletter",
    clickCount: 5,
    createdAt: "2024-01-12T12:00:00.000Z"
  },
  {
    id: "lnk_jordan_github",
    profileUserId: "usr_jordan",
    label: "GitHub",
    url: "https://github.com/",
    clickCount: 5,
    createdAt: "2024-01-05T12:00:00.000Z"
  },
  {
    id: "lnk_morgan_kaggle",
    profileUserId: "usr_morgan",
    label: "Kaggle",
    url: "https://kaggle.com",
    clickCount: 9,
    createdAt: "2024-01-13T12:00:00.000Z"
  },
  {
    id: "lnk_morgan_github",
    profileUserId: "usr_morgan",
    label: "GitHub",
    url: "https://github.com/",
    clickCount: 6,
    createdAt: "2024-01-14T12:00:00.000Z"
  },
  {
    id: "lnk_casey_status",
    profileUserId: "usr_casey",
    label: "Status page",
    url: "https://statuspage.io",
    clickCount: 4,
    createdAt: "2024-01-10T12:00:00.000Z"
  },
  {
    id: "lnk_lee_codepen",
    profileUserId: "usr_lee",
    label: "CodePen",
    url: "https://codepen.io",
    clickCount: 7,
    createdAt: "2024-01-15T12:00:00.000Z"
  },
  {
    id: "lnk_ava_docs",
    profileUserId: "usr_ava",
    label: "API Docs",
    url: "https://example.com/docs",
    clickCount: 3,
    createdAt: "2024-01-16T12:00:00.000Z"
  },
  {
    id: "lnk_noah_product",
    profileUserId: "usr_noah",
    label: "Side project",
    url: "https://example.com/product",
    clickCount: 10,
    createdAt: "2024-01-16T12:00:00.000Z"
  },
  {
    id: "lnk_zoe_dribbble",
    profileUserId: "usr_zoe",
    label: "Dribbble",
    url: "https://dribbble.com",
    clickCount: 12,
    createdAt: "2024-01-17T12:00:00.000Z"
  },
  {
    id: "lnk_zoe_figma",
    profileUserId: "usr_zoe",
    label: "Figma community",
    url: "https://www.figma.com/community",
    clickCount: 6,
    createdAt: "2024-01-18T12:00:00.000Z"
  }
];

export const SEED_PROJECTS: SeedProject[] = [
  {
    id: "prj_demo_1",
    profileUserId: "usr_demo",
    title: "DevLink MSW Demo",
    description: "A frontend-only demo backed by MSW and an in-browser database.",
    markdown: "# DevLink Demo\n\nThis is a seeded project that demonstrates static export + MSW.",
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Next.js", "MSW", "TypeScript"],
    imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-10T12:00:00.000Z"
  },
  {
    id: "prj_demo_2",
    profileUserId: "usr_demo",
    title: "MSW Handlers Cookbook",
    description: "A collection of patterns for realistic frontend-only demos.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["MSW", "TypeScript"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: false,
    sortOrder: 2,
    createdAt: "2024-01-11T12:00:00.000Z"
  },
  {
    id: "prj_alex_1",
    profileUserId: "usr_alex",
    title: "Postgres Toolkit",
    description: "CLI helpers for common Postgres workflows.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Node.js", "Postgres"],
    imageUrl: "https://images.unsplash.com/photo-1526378722370-1b1f1c4fdca4?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-12T12:00:00.000Z"
  },
  {
    id: "prj_alex_2",
    profileUserId: "usr_alex",
    title: "Latency Lens",
    description: "A tiny web app to visualize request latency distributions.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["React", "Charts"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: false,
    sortOrder: 2,
    createdAt: "2024-01-13T12:00:00.000Z"
  },
  {
    id: "prj_sam_1",
    profileUserId: "usr_sam",
    title: "Accessible UI Kit",
    description: "A tiny component kit focused on accessibility defaults.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["React", "Tailwind"],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-14T12:00:00.000Z"
  },
  {
    id: "prj_taylor_1",
    profileUserId: "usr_taylor",
    title: "API Gateway Playground",
    description: "Experimenting with rate limits, retries, and schema validation.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Go", "HTTP", "Observability"],
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981d?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-15T12:00:00.000Z"
  },
  {
    id: "prj_riley_1",
    profileUserId: "usr_riley",
    title: "OSS Onboarding Kit",
    description: "Templates and tips for welcoming contributors.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Community", "Docs"],
    imageUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-16T12:00:00.000Z"
  },
  {
    id: "prj_jordan_1",
    profileUserId: "usr_jordan",
    title: "Offline-first Notes",
    description: "A small notes app with sync and conflict resolution experiments.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["React Native", "IndexedDB"],
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-17T12:00:00.000Z"
  },
  {
    id: "prj_morgan_1",
    profileUserId: "usr_morgan",
    title: "Metrics Studio",
    description: "Dashboards for product experiments and cohorts.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Python", "SQL", "Charts"],
    imageUrl: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-18T12:00:00.000Z"
  },
  {
    id: "prj_casey_1",
    profileUserId: "usr_casey",
    title: "Incident Timeline",
    description: "Post-incident timeline builder for teams.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["SRE", "TypeScript"],
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-19T12:00:00.000Z"
  },
  {
    id: "prj_lee_1",
    profileUserId: "usr_lee",
    title: "CSS Microinteractions",
    description: "A gallery of small interaction patterns.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["CSS", "Motion"],
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: false,
    sortOrder: 2,
    createdAt: "2024-01-20T12:00:00.000Z"
  },
  {
    id: "prj_ava_1",
    profileUserId: "usr_ava",
    title: "API Contract Tests",
    description: "Playground for contract testing and schema diffs.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["OpenAPI", "Node.js"],
    imageUrl: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-21T12:00:00.000Z"
  },
  {
    id: "prj_noah_1",
    profileUserId: "usr_noah",
    title: "Maker Checklist",
    description: "A small app for shipping weekly experiments.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Next.js", "Product"],
    imageUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-22T12:00:00.000Z"
  },
  {
    id: "prj_zoe_1",
    profileUserId: "usr_zoe",
    title: "Design Tokens Lab",
    description: "Exploring theme tokens and color palettes.",
    markdown: null,
    repoUrl: "https://github.com/",
    liveUrl: null,
    techStack: ["Design", "Tokens", "React"],
    imageUrl: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=320&q=80",
    mediaUrls: [],
    featured: true,
    sortOrder: 1,
    createdAt: "2024-01-23T12:00:00.000Z"
  }
];

export const SEED_USERNAMES = SEED_USERS.map((u) => u.username);
export const SEED_PROJECT_IDS = SEED_PROJECTS.map((p) => p.id);
export const SEED_LINK_IDS = SEED_LINKS.map((l) => l.id);
