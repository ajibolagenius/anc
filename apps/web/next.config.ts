import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @anc/shared ships raw TypeScript source (no build step) — Next needs to
  // transpile it itself rather than treating it as pre-built node_modules.
  transpilePackages: ["@anc/shared"],
};

export default nextConfig;
