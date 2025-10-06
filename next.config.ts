import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,

  // Configure asset prefix for proper static asset serving
  assetPrefix: process.env.ASSET_PREFIX || "",

  // Ensure proper handling of static optimization
  poweredByHeader: false,

  // Configure distDir if needed
  distDir: ".next",

  // Ensure proper handling of images
  images: {
    unoptimized: true, // Vercel optimizes images automatically
  },
};

export default nextConfig;
