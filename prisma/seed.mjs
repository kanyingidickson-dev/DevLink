import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.projectComment.deleteMany({});
  await prisma.projectEndorsement.deleteMany({});
  await prisma.projectLike.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const skillsList = ["TypeScript", "React", "Node.js", "Postgres", "Python", "Go", "Next.js", "Prisma", "Docker", "AWS"];
  const users = [];
  for (let i = 1; i <= 5; ++i) {
    const username = `user${i}`;
    const email = `user${i}@devlink.local`;
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: {
          create: {
            displayName: `User ${i}`,
            bio: `Bio for user ${i}`,
            skills: skillsList.slice(0, 2 + (i % 4)),
            theme: i % 2 === 0 ? "DARK" : "LIGHT",
            colorPalette: i % 2 === 0 ? "#111827,#4f46e5" : "#f59e42,#fff",
            vanityUrl: `vanity${i}`,
            links: { create: [
              { label: "GitHub", url: `https://github.com/user${i}` },
              { label: "Website", url: `https://user${i}.dev` }
            ] },
            projects: { create: [
              {
                title: `Project ${i}A`,
                description: `Description for project ${i}A`,
                markdown: `# Project ${i}A\nThis is a markdown description for project ${i}A.`,
                repoUrl: `https://github.com/user${i}/projA`,
                techStack: skillsList.slice(i, i+3),
                imageUrl: null,
                mediaUrls: ["https://placehold.co/200x200"],
                featured: true,
                sortOrder: 1
              },
              {
                title: `Project ${i}B`,
                description: `Description for project ${i}B`,
                markdown: `# Project ${i}B\nThis is a markdown description for project ${i}B.`,
                repoUrl: `https://github.com/user${i}/projB`,
                techStack: skillsList.slice(i+1, i+4),
                imageUrl: null,
                mediaUrls: ["https://placehold.co/200x200"],
                featured: false,
                sortOrder: 2
              }
            ] }
          }
        }
      },
      include: { profile: { include: { projects: true } } }
    });
    users.push(user);
  }

  // Follows
  await prisma.follow.createMany({
    data: [
      { followerId: users[0].id, followingId: users[1].id },
      { followerId: users[1].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[0].id },
      { followerId: users[3].id, followingId: users[2].id }
    ]
  });

  // Project likes, endorsements, comments
  for (let i = 0; i < users.length; ++i) {
    const user = users[i];
    for (const project of user.profile.projects) {
      // Likes
      if (i + 1 < users.length) {
        await prisma.projectLike.create({ data: { userId: users[i+1].id, projectId: project.id } });
      }
      // Endorsements
      if (i + 2 < users.length) {
        await prisma.projectEndorsement.create({ data: { userId: users[i+2].id, projectId: project.id, message: `Great work on ${project.title}!` } });
      }
      // Comments
      await prisma.projectComment.create({ data: { userId: user.id, projectId: project.id, message: `Nice project!` } });
    }
  }

  // Analytics events
  for (const user of users) {
    for (const project of user.profile.projects) {
      await prisma.analyticsEvent.create({ data: { profileId: user.profile.id, type: "VIEW" } });
      await prisma.analyticsEvent.create({ data: { profileId: user.profile.id, type: "CLICK", linkId: null } });
    }
  }

  // Messages
  await prisma.message.create({ data: { senderId: users[0].id, receiverId: users[1].id, content: "Hey there!" } });
  await prisma.message.create({ data: { senderId: users[1].id, receiverId: users[0].id, content: "Hello!" } });

  // Notifications
  await prisma.notification.create({ data: { userId: users[0].id, type: "FOLLOW", actorId: users[1].id } });
  await prisma.notification.create({ data: { userId: users[1].id, type: "PROJECT_LIKED", actorId: users[0].id, projectId: users[1].profile.projects[0].id } });

  // Demo abuse report (not stored, just for completeness)
  console.log("Seeded demo data: 5 users, profiles, projects, follows, likes, endorsements, comments, analytics, messages, notifications.");
}


main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
