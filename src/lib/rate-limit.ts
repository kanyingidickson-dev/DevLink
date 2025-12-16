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

export function rateLimit(opts: {
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

export function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim() || "unknown";

  return "unknown";
}
