export function normalizeEmail(raw: unknown) {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email.includes("@")) return null;
  return email;
}

export function normalizeUsername(raw: unknown) {
  if (typeof raw !== "string") return null;
  const username = raw.trim().toLowerCase();
  if (username.length < 2) return null;
  if (username.length > 32) return null;
  if (!/^[a-z0-9_]+$/.test(username)) return null;
  return username;
}

export function normalizeUrl(raw: unknown) {
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseSkills(raw: unknown) {
  if (typeof raw !== "string") return [] as string[];

  const cleaned = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

  return Array.from(new Set(cleaned));
}
