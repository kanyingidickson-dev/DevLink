import DiscoverClient from "./discover-client";
import { Suspense } from "react";

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Search profiles, browse trending, and explore the directory.</p>
      </div>

      <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
        <DiscoverClient />
      </Suspense>
    </div>
  );
}
