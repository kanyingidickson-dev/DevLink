import Link from "next/link";

import HomeSearch from "./home-search";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">DevLink</h1>
        <p className="max-w-prose text-zinc-600 dark:text-zinc-300">
          A simple profile hub for developers: links, skills, and a clean public page.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login?mode=signup"
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Get started
          </Link>
          <Link href="/discover" className="rounded border px-4 py-2 text-sm">
            Explore profiles
          </Link>
          <Link href="/u/demo" className="rounded border px-4 py-2 text-sm">
            View demo URL
          </Link>
        </div>
      </div>

      <HomeSearch />
    </div>
  );
}
