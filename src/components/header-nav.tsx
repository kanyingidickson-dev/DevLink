"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

import SignOutButton from "@/components/sign-out-button";

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(() => {
    const items: Array<{ href: string; label: string }> = [{ href: "/discover", label: "Discover" }];

    if (status !== "loading" && session) {
      items.push(
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Profile" },
        { href: "/notifications", label: "Notifications" }
      );
    }

    return items;
  }, [session, status]);

  function NavItem({ href, label }: { href: string; label: string }) {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

    return (
      <Link
        href={href}
        className={
          "rounded px-2 py-1 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-900 " +
          (active
            ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
            : "text-zinc-600 dark:text-zinc-300")
        }
        onClick={() => setMobileOpen(false)}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="relative">
      <div className="flex items-center gap-1 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          Menu
        </button>
      </div>

      <div className="hidden items-center gap-1 sm:flex">
        {links.map((l) => (
          <NavItem key={l.href} href={l.href} label={l.label} />
        ))}

        <div className="ml-2 flex items-center gap-2 border-l border-zinc-200 pl-2 dark:border-zinc-800">
          {status === "loading" ? null : session ? (
            <SignOutButton />
          ) : (
            <>
              <Link
                href="/login?mode=signin"
                className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileOpen ? (
        <div className="absolute right-0 top-10 z-50 w-56 rounded border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:hidden">
          <div className="grid gap-1">
            {links.map((l) => (
              <NavItem key={l.href} href={l.href} label={l.label} />
            ))}

            <div className="mt-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              {status === "loading" ? null : session ? (
                <div className="px-1">
                  <SignOutButton />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login?mode=signin"
                    className="rounded border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
