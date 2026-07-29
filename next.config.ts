import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@hugeicons/core-free-icons"]
  }
};

export default nextConfig;
