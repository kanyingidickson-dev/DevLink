import "./globals.css";

/**
 * App shell layout.
 *
 * Responsibilities:
 * - Apply global styles and metadata
 * - Mount global providers (auth session, theming, toasts)
 * - Render shared navigation and consistent page spacing
 */

import Link from "next/link";
import type { ReactNode } from "react";

import AppProviders from "@/components/app-providers";
import AppToaster from "@/components/toaster";
import HeaderNav from "@/components/header-nav";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: "DevLink",
  description: "Developer social profile hub"
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <AppProviders session={null}>
          <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-semibold tracking-tight">
                DevLink
              </Link>

              <div className="flex items-center gap-3">
                <HeaderNav />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 pb-8 pt-20">{children}</main>
          <AppToaster />
        </AppProviders>
      </body>
    </html>
  );
}
