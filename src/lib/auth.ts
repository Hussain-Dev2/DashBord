import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error("Missing Google Client ID or Secret")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: clientId || "",
      clientSecret: clientSecret || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
  },
}
