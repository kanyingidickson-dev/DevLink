import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

function buildProviders() {
  const providers = [] as NextAuthOptions["providers"];

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      })
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username ?? undefined
        };
      }
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        (token as any).username = dbUser?.username ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.username = (token as any).username ?? null;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, username: true, email: true, name: true, profile: { select: { id: true } } }
      });

      if (!dbUser) return;
      if (dbUser.username && dbUser.profile?.id) return;

      const base = (dbUser.email?.split("@")[0] ?? "dev")
        .replace(/[^a-zA-Z0-9_]+/g, "")
        .toLowerCase();
      const candidate = base || "dev";

      const existing = await prisma.user.findUnique({ where: { username: candidate } });
      const username = existing ? `${candidate}-${user.id.slice(0, 6)}` : candidate;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: dbUser.username ?? username,
          profile: dbUser.profile?.id
            ? undefined
            : {
                create: {
                  displayName: dbUser.name ?? dbUser.username ?? username
                }
              }
        }
      });
    }
  }
};
