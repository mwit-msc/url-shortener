import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"
import { AuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Get user with role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, linkLimit: true },
        })

        session.user.id = user.id
        session.user.role = dbUser?.role || UserRole.USER
        session.user.linkLimit = dbUser?.linkLimit || 10
      }
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const emailDomain = profile.email.split("@")[1];
        if (emailDomain !== "mwit.ac.th") return "/auth/login?error=OAuthSignin";
        return true;
      }
      return false;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        const role = UserRole.USER
        const linkLimit = role === UserRole.USER ? 10 : -1

        await prisma.user.update({
          where: { id: user.id },
          data: {
            role,
            linkLimit,
          },
        })
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
}
