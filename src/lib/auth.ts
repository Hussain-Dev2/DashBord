import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { ADMIN_EMAIL } from "./constants"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "secret",
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session }) {
      if (session.user?.email) {
        session.user.isAdmin = session.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      }
      return session
    },
  },
}
