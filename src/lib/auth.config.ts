// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");

      if (isAdminRoute) {
        // If not logged in, return false so NextAuth redirects to /login
        if (!auth?.user) return false;

        const role = (auth.user as any)?.role;
        const isApproved = (auth.user as any)?.isApproved;

        // Admin has full access; Managers must be approved
        if (role === "ADMIN") return true;
        if (role === "MANAGER" && isApproved) return true;

        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isApproved = (user as any).isApproved;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id as string;
        (session.user as any).isApproved = token.isApproved;
      }
      return session;
    },
  },
  providers: [],
};
