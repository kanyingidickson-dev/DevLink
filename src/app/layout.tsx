import "./globals.css";

import Link from "next/link";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";

import AppProviders from "@/components/app-providers";
import SignOutButton from "@/components/sign-out-button";
import ThemeToggle from "@/components/theme-toggle";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "DevLink",
  description: "Developer social profile hub"
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <AppProviders session={session}>
          <header className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-semibold">
                DevLink
              </Link>

              <nav className="flex items-center gap-3">
                {session ? (
                  <>
                    <Link href="/dashboard" className="text-sm">
                      Dashboard
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <Link href="/login" className="text-sm">
                    Sign in
                  </Link>
                )}

                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
