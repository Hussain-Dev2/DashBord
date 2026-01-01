import { withAuth } from "next-auth/middleware"

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "secret",
})

export const config = { matcher: ["/admin/:path*"] }
