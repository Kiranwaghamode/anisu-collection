import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Placeholder product photos until real ones are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the root so a stray lockfile in a parent folder isn't picked up.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
