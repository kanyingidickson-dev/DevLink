import { describe, expect, it } from "vitest";

import { normalizeEmail, normalizeUrl, normalizeUsername, parseSkills } from "./validators";

describe("normalizeEmail", () => {
  it("returns lowercased, trimmed email for valid input", () => {
    expect(normalizeEmail("  USER@Example.com  ")).toBe("user@example.com");
  });

  it("returns null for non string", () => {
    expect(normalizeEmail(null as unknown as string)).toBeNull();
  });

  it("returns null for missing @", () => {
    expect(normalizeEmail("no-at-symbol")).toBeNull();
  });
});

describe("normalizeUsername", () => {
  it("normalizes and validates username", () => {
    expect(normalizeUsername("  Foo_Bar  ")).toBe("foo_bar");
  });

  it("rejects too short, too long, or invalid chars", () => {
    expect(normalizeUsername("a")).toBeNull();
    expect(normalizeUsername("a".repeat(33))).toBeNull();
    expect(normalizeUsername("Bad-Name")).toBeNull();
  });
});

describe("normalizeUrl", () => {
  it("accepts http and https", () => {
    expect(normalizeUrl("https://example.com/path")).toBe("https://example.com/path");
  });

  it("rejects non http(s) schemes and invalid URL", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("not a url")).toBeNull();
  });
});

describe("parseSkills", () => {
  it("splits by comma, trims, deduplicates, and limits to 30", () => {
    expect(parseSkills("js, ts, js ")).toEqual(["js", "ts"]);

    const many = Array.from({ length: 40 }, (_, i) => `s${i}`).join(",");
    const parsed = parseSkills(many);
    expect(parsed.length).toBe(30);
  });

  it("returns empty array for non string", () => {
    expect(parseSkills(null as unknown as string[])).toEqual([]);
  });
});
