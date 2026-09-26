import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolves its platform binary's path at runtime; bundling would break that.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],
};

export default nextConfig;
