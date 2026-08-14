import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // @anc/shared ships raw TypeScript source (no build step) — Next needs to
  // transpile it itself rather than treating it as pre-built node_modules.
  transpilePackages: ["@anc/shared"],
};

// Source-map upload is automatically skipped (with a warning, not a build
// failure) when SENTRY_AUTH_TOKEN/org/project aren't configured — safe to
// wrap unconditionally even before a real Sentry project exists.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
