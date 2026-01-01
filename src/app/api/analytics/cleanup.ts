import { prisma } from "@/lib/prisma";

// Delete analytics events older than 90 days
export async function cleanupOldAnalytics() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const deleted = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });
  return deleted.count;
}

// Script entrypoint
if (typeof require !== "undefined" && require.main === module) {
  cleanupOldAnalytics().then((count) => {
    console.log(`Deleted ${count} old analytics events`);
    process.exit(0);
  });
}
