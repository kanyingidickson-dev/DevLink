"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

function sanitizeCallbackUrl(raw: string | null | undefined) {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  const v = raw.trim();
  if (!v) return fallback;
  if (!v.startsWith("/")) return fallback;
  if (v.startsWith("//")) return fallback;
  if (v.includes("://")) return fallback;
  return v;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md space-y-6">Loading…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(
    () => sanitizeCallbackUrl(searchParams.get("callbackUrl")),
    [searchParams]
  );

  const [providers, setProviders] = useState<Record<string, unknown> | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (!mounted) return;
        setProviders(data ?? {});
      })
      .catch(() => {
        if (!mounted) return;
        setProviders({});
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
    if (m === "signin") setMode("signin");
  }, [searchParams]);

  const hasGithub = Boolean(providers && (providers as any).github);
  const hasGoogle = Boolean(providers && (providers as any).google);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && username.trim().length < 2) {
      const msg = "Username must be at least 2 characters";
      setError(msg);
      toast.error(msg);
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, username })
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "Registration failed");
        }

        toast.success("Account created");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl
      });

      if (!result?.ok) throw new Error("Invalid email or password");

      toast.success("Signed in");
      router.push(callbackUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Use email + password, or continue with OAuth.
        </p>
      </div>

      {hasGithub || hasGoogle ? (
        <div className="flex gap-2">
          {hasGithub ? (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl })}
              className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              GitHub
            </button>
          ) : null}
          {hasGoogle ? (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Google
            </button>
          ) : null}
        </div>
      ) : null}

      {hasGithub || hasGoogle ? (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <div className="text-xs text-zinc-500">or</div>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "signup" ? (
          <label className="block space-y-1">
            <div className="text-sm">Username</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
              autoComplete="username"
              placeholder="your_handle"
            />
          </label>
        ) : null}

        <label className="block space-y-1">
          <div className="text-sm">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:focus:ring-zinc-800"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            type="password"
            required
          />
        </label>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-zinc-600 dark:text-zinc-300"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
