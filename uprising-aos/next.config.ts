import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  // Fix for Next.js 16 + Turbopack + PWA
  experimental: {
    turbo: {
      // Configure Turbopack rules if needed, or leave empty to disable the error
    }
  }
};

export default withPWA(nextConfig);
