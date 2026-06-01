import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to the monorepo root (this app lives in apps/web).
  // Without this, Next walks up and may pick a parent repo's lockfile.
  turbopack: {
    root: path.join(process.cwd(), "..", ".."),
  },
};

export default nextConfig;
