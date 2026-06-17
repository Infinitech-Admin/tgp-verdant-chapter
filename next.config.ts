import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local development (Laravel API)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",  // Allow all paths
      },
      // Production API
      {
        protocol: "https",
        hostname: "infinitech-api13.site",
        pathname: "/**",  // Allow all paths
      },
      // Vercel deployments
      {
        protocol: "https",
        hostname: "*.vercel.app",
        pathname: "/**",
      },
    ],
    domains: [
      "localhost",
      "infinitech-api13.site",
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ]
  },
}

export default nextConfig
