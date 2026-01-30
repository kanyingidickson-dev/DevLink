export function apiUrl(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (!path) return basePath || "/";

  const prefixed = basePath
    ? path.startsWith("/")
      ? `${basePath}${path}`
      : `${basePath}/${path}`
    : path;

  if (typeof window === "undefined") return prefixed;
  if (!prefixed.includes("/api/")) return prefixed;

  const userId = window.localStorage.getItem("devlink_demo_user_id");
  if (!userId) return prefixed;
  if (prefixed.includes("__user=")) return prefixed;

  const sep = prefixed.includes("?") ? "&" : "?";
  return `${prefixed}${sep}__user=${encodeURIComponent(userId)}`;
}
