import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary resizes and converts photos (f_auto,q_auto); see src/lib/image-url.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Placeholder product photos until real ones are uploaded.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Don't let other sites show this site in a frame (clickjacking).
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), payment=()" },
        ],
      },
    ];
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
