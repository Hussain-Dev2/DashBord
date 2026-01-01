import { withAuth } from "next-auth/middleware"

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "secret",
})

// Public access to admin dashboard for demo mode
export const config = { matcher: [] }
