import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import NotificationsPanel from "@/app/profile/notifications-panel";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <NotificationsPanel />
    </div>
  );
}
