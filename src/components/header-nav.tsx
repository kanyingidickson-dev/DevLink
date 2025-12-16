"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import SignOutButton from "@/components/sign-out-button";

export default function HeaderNav() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center gap-3">
      <Link href="/discover" className="text-sm">
        Search
      </Link>

      {status === "loading" ? null : session ? (
        <>
          <Link href="/dashboard" className="text-sm">
            Dashboard
          </Link>
          <Link href="/profile" className="text-sm">
            Profile
          </Link>
          <Link href="/notifications" className="text-sm">
            Notifications
          </Link>
          <SignOutButton />
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login?mode=signin"
            className="rounded border px-2 py-1 text-sm"
            aria-label="Log in"
            title="Log in"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
            </svg>
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded border px-2 py-1 text-sm"
            aria-label="Sign up"
            title="Sign up"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <path d="M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
              <path d="M19 8v6" />
              <path d="M22 11h-6" />
            </svg>
          </Link>
        </div>
      )}
    </nav>
  );
}
