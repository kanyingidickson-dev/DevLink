import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, Bucket>;

type RateLimitGlobal = typeof globalThis & {
  __devlinkRateLimitStore?: RateLimitStore;
};

const globalForRateLimit = globalThis as RateLimitGlobal;

function getStore(): RateLimitStore {
  if (!globalForRateLimit.__devlinkRateLimitStore) {
    globalForRateLimit.__devlinkRateLimitStore = new Map();
  }
  return globalForRateLimit.__devlinkRateLimitStore;
}

export function rateLimitMemory(opts: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const store = getStore();
  const now = opts.now ?? Date.now();

  const existing = store.get(opts.key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    store.set(opts.key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(opts.limit - 1, 0), resetAt };
  }

  if (existing.count >= opts.limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(opts.key, existing);

  return {
    ok: true,
    remaining: Math.max(opts.limit - existing.count, 0),
    resetAt: existing.resetAt
  };
}

async function rateLimitDb(opts: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): Promise<RateLimitResult> {
  const nowMs = opts.now ?? Date.now();
  const now = new Date(nowMs);
  const newResetAt = new Date(nowMs + opts.windowMs);

  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>(Prisma.sql`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${opts.key}, 1, ${newResetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${newResetAt}
        ELSE "RateLimitBucket"."resetAt"
      END
    RETURNING "count", "resetAt";
  `);

  const row = rows[0];
  const count = row?.count ?? 1;
  const resetAtMs = (row?.resetAt ?? newResetAt).getTime();

  if (count > opts.limit) {
    return { ok: false, remaining: 0, resetAt: resetAtMs };
  }

  return {
    ok: true,
    remaining: Math.max(opts.limit - count, 0),
    resetAt: resetAtMs
  };
}

export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): Promise<RateLimitResult> {
  if (process.env.DEVLINK_RATE_LIMIT_STORE === "memory") {
    return rateLimitMemory(opts);
  }

  try {
    return await rateLimitDb(opts);
  } catch {
    return rateLimitMemory(opts);
  }
}

export function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim() || "unknown";

  return "unknown";
}
