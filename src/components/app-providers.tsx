"use client";

/**
 * Client-side provider composition.
 *
 * Keep all client-only context providers (auth session, theme) in one place so the app shell
 * can remain a simple server component.
 */

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

let mswStartPromise: Promise<void> | null = null;

function ensureMswStarted() {
  if (typeof window === "undefined") return Promise.resolve();
  if (process.env.NEXT_PUBLIC_MSW === "disabled") return Promise.resolve();
  if (mswStartPromise) return mswStartPromise;

  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const basePath = rawBasePath && !rawBasePath.startsWith("/") ? `/${rawBasePath}` : rawBasePath;
  const swUrl = basePath ? `${basePath}/mockServiceWorker.js` : "/mockServiceWorker.js";
  const scope = basePath ? `${basePath}/` : "/";

  mswStartPromise = import("@/mocks/browser")
    .then(({ worker }) =>
      worker
        .start({
          serviceWorker: {
            url: swUrl,
            options: { scope }
          },
          onUnhandledRequest: "bypass"
        })
        .then(() => undefined)
    )
    .catch(() => undefined);

  return mswStartPromise;
}

void ensureMswStarted();

const DEMO_AUTH_KEY = "devlink_demo_user_id";

type DemoAuthContextValue = {
  userId: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setUserId: (userId: string | null) => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error("useDemoAuth must be used within AppProviders");
  return ctx;
}

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);

  const sync = useCallback(() => {
    if (typeof window === "undefined") return;
    setUserIdState(window.localStorage.getItem(DEMO_AUTH_KEY));
  }, []);

  useEffect(() => {
    sync();
    setLoaded(true);

    function onStorage(e: StorageEvent) {
      if (e.key === DEMO_AUTH_KEY) sync();
    }

    function onCustom() {
      sync();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("devlink_demo_auth", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("devlink_demo_auth", onCustom);
    };
  }, [sync]);

  const setUserId = useCallback(
    (next: string | null) => {
      if (typeof window === "undefined") return;
      if (next) window.localStorage.setItem(DEMO_AUTH_KEY, next);
      else window.localStorage.removeItem(DEMO_AUTH_KEY);
      window.dispatchEvent(new Event("devlink_demo_auth"));
      setUserIdState(next);
    },
    []
  );

  const value = useMemo<DemoAuthContextValue>(() => {
    const status = loaded ? (userId ? "authenticated" : "unauthenticated") : "loading";
    return { userId, status, setUserId };
  }, [loaded, setUserId, userId]);

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export default function AppProviders({
  children
}: {
  children: ReactNode;
}) {
  return (
    <DemoAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </DemoAuthProvider>
  );
}
