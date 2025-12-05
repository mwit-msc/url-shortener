import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "../../prisma.config"
import { UserRole } from "@prisma/client"
import { AuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"

// Only validate environment variables when not in build mode
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-development-build'

if (!isBuildTime) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not configured")
  }

  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not configured")
  }

  if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_URL is required in production")
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          hd: "mwit.ac.th",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'dummy-secret',
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        try {
          // Get user with role from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true, linkLimit: true },
          })

          session.user.id = user.id
          session.user.role = dbUser?.role || UserRole.USER
          session.user.linkLimit = dbUser?.linkLimit || 10
        } catch (error) {
          console.error("Error fetching user data in session callback:", error)
          // Return session with defaults if database query fails
          session.user.id = user.id
          session.user.role = UserRole.USER
          session.user.linkLimit = 10
        }
      }
      return session
    },
    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          const emailDomain = profile.email.split("@")[1];
          if (emailDomain !== "mwit.ac.th") {
            console.warn(`Sign-in attempt from non-MWIT email: ${profile.email}`)
            return "/auth/error?error=OAuthSignin";
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error)
        return "/auth/error?error=Configuration"
      }
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        try {
          const role = UserRole.USER
          const linkLimit = role === UserRole.USER ? 10 : -1

          await prisma.user.update({
            where: { id: user.id },
            data: {
              role,
              linkLimit,
            },
          })

          console.log(`New user created: ${user.email} with role ${role}`)
        } catch (error) {
          console.error("Error updating user on creation:", error)
          // Don't throw - let the user be created even if role update fails
        }
      }
    },
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`First-time login for user: ${user.email}`)
      }
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email || token?.email || 'Unknown'}`)
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
