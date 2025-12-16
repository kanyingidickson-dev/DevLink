import DiscoverClient from "./discover-client";

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Search profiles, browse trending, and explore the directory.</p>
      </div>

      <DiscoverClient />
    </div>
  );
}
