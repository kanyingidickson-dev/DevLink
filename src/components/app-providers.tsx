"use client";

/**
 * Client-side provider composition.
 *
 * Keep all client-only context providers (auth session, theme) in one place so the app shell
 * can remain a simple server component.
 */

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function AppProviders({
  children,
  session
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
