import { describe, expect, it } from "vitest";

import { getClientIp, rateLimitMemory } from "./rate-limit";

describe("rateLimit", () => {
  it("allows first request and tracks remaining", () => {
    const res = rateLimitMemory({ key: "test:1", limit: 2, windowMs: 1000, now: 0 });
    expect(res.ok).toBe(true);
    expect(res.remaining).toBe(1);
  });

  it("blocks after exceeding limit within window", () => {
    const key = "test:2";
    rateLimitMemory({ key, limit: 2, windowMs: 1000, now: 0 });
    rateLimitMemory({ key, limit: 2, windowMs: 1000, now: 10 });
    const third = rateLimitMemory({ key, limit: 2, windowMs: 1000, now: 20 });
    expect(third.ok).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after windowMs", () => {
    const key = "test:3";
    const first = rateLimitMemory({ key, limit: 1, windowMs: 1000, now: 0 });
    expect(first.ok).toBe(true);

    const blocked = rateLimitMemory({ key, limit: 1, windowMs: 1000, now: 100 });
    expect(blocked.ok).toBe(false);

    const afterReset = rateLimitMemory({ key, limit: 1, windowMs: 1000, now: 1500 });
    expect(afterReset.ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers x-forwarded-for", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" }
    });
    expect(getClientIp(req)).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "3.3.3.3" }
    });
    expect(getClientIp(req)).toBe("3.3.3.3");
  });

  it("returns unknown when no headers present", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});
