import type { NextConfig } from "next";

const storageHost =
  (process.env.AWS_ENDPOINT_URL_S3 || process.env.STORAGE_ENDPOINT || "")
    .replace(/^https?:\/\//, "")
    .split("/")[0] || "storage.neon.tech";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: storageHost },
      { protocol: "https", hostname: "*.storage.c-*.aws.neon.tech" },
      { protocol: "https", hostname: "mock-storage.instant.fun" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
