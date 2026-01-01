import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createYoga, createSchema } from "graphql-yoga";

const typeDefs = `
  type User { id: String! username: String! profile: Profile }
  type Profile { id: String! displayName: String skills: [String!]! }
  type Query { user(username: String!): User }
`;

const resolvers = {
  Query: {
    async user(_: any, { username }: { username: string }) {
      return prisma.user.findUnique({ where: { username }, include: { profile: true } });
    }
  },
  User: {
    profile: (parent: any) => parent.profile
  }
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });

export { yoga as GET, yoga as POST };
