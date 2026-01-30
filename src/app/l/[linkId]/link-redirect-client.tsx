"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getDb, makeId, updateDb } from "@/mocks/db";

export default function LinkRedirectClient({ linkId }: { linkId: string }) {
  const router = useRouter();

  useEffect(() => {
    const db = getDb();
    const link = db.links.find((l) => l.id === linkId) ?? null;

    if (!link) {
      router.replace("/");
      return;
    }

    updateDb((state) => {
      const l = state.links.find((x) => x.id === linkId) ?? null;
      if (!l) return;
      l.clickCount += 1;
      state.analyticsEvents.push({
        id: makeId("evt"),
        profileUserId: l.profileUserId,
        type: "CLICK",
        createdAt: new Date().toISOString(),
        linkId: l.id
      });
    });

    window.location.href = link.url;
  }, [linkId, router]);

  return <div className="text-sm text-zinc-500">Redirecting…</div>;
}
