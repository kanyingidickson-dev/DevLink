import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

/**
 * NextAuth route handler for the App Router.
 * Exposes both GET and POST to support the NextAuth client helpers.
 */

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
