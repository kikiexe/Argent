import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@hugeicons/core-free-icons"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ifyrxutgoacbitxuistd.supabase.co",
        pathname: "/storage/v1/object/**"
      }
    ]
  }
};

export default nextConfig;
