import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: 'output: export' removed — static export disables all API routes
  // including NextAuth (/api/auth/*), Prisma, and Supabase server handlers.
  // This app requires server-side rendering to function correctly.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
