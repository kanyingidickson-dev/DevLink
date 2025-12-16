import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">The page you requested doesn’t exist.</p>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded border px-3 py-2 text-sm" href="/">
          Go home
        </Link>
        <Link className="rounded border px-3 py-2 text-sm" href="/discover">
          Search profiles
        </Link>
      </div>
    </div>
  );
}
