// src/lib/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

class PendingApprovalError extends CredentialsSignin {
  code = "pending_approval";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          throw new InvalidCredentialsError();
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
          throw new InvalidCredentialsError();
        }

        // Block accounts awaiting admin approval
        // ADMIN is always allowed. Other roles (MANAGER, EDITOR, VIEWER) require isApproved: true
        if (user.role !== "ADMIN" && !user.isApproved) {
          throw new PendingApprovalError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.isApproved = (user as any).isApproved;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id as string;
        (session.user as any).isApproved = token.isApproved;
      }
      return session;
    },
  },
});
