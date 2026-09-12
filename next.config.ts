import type { NextConfig } from "next";

/**
 * One identifier for this build, shared by Next and the service worker.
 *
 * The worker needs it because its cache names carry a version and `sw.js` is a
 * static file: its bytes are identical from one deploy to the next, so the
 * browser never saw a new worker, `install` never ran again, and the versioned
 * shell and page caches — which `activate` deletes by name — were never any
 * version but the first. The offline page stayed pinned to whichever build
 * first installed it, for the life of the site.
 *
 * Registering `/sw.js?v=<build>` is what makes the byte-identical file a new
 * worker. Netlify supplies COMMIT_REF; the timestamp is the local fallback.
 */
const buildId = process.env.COMMIT_REF || `dev-${Date.now()}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  generateBuildId: () => buildId,
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
