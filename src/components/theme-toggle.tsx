"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const activeTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      type="button"
      onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
      className="rounded border px-3 py-1 text-sm"
      aria-label="Toggle theme"
    >
      {activeTheme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
