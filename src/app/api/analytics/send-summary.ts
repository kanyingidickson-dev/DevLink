import { prisma } from "@/lib/prisma";

export async function sendWeeklySummary() {
  const users = await prisma.user.findMany({ where: { email: { not: null } }, select: { id: true, email: true, profile: { select: { id: true } } } });
  for (const user of users) {
    if (!user.email || !user.profile) continue;
    const views = await prisma.analyticsEvent.count({ where: { profileId: user.profile.id, type: "VIEW", createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } });
    const clicks = await prisma.analyticsEvent.count({ where: { profileId: user.profile.id, type: "CLICK", createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } } });
    // TODO: send email with summary to user.email
    console.log(`Would send summary to ${user.email}: ${views} views, ${clicks} clicks`);
  }
}

if (typeof require !== "undefined" && require.main === module) {
  sendWeeklySummary().then(() => process.exit(0));
}
