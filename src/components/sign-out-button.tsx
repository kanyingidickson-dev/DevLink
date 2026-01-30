"use client";

import { useRouter } from "next/navigation";

import { useDemoAuth } from "@/components/app-providers";

export default function SignOutButton() {
  const router = useRouter();
  const { setUserId } = useDemoAuth();

  return (
    <button
      type="button"
      onClick={() => {
        setUserId(null);
        router.push("/");
      }}
      className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
    >
      Sign out
    </button>
  );
}
