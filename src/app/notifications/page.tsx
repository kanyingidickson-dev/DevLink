"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDemoAuth } from "@/components/app-providers";
import NotificationsPanel from "@/app/profile/notifications-panel";

export default function NotificationsPage() {
  const router = useRouter();
  const { userId, status } = useDemoAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?mode=signin&callbackUrl=${encodeURIComponent("/notifications")}`);
    }
  }, [router, status]);

  if (status === "loading") {
    return <div className="text-sm text-zinc-500">Loading…</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <NotificationsPanel />
    </div>
  );
}
