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
 * worker.
 *
 * DEPLOY_ID before COMMIT_REF because it is the more truthful of the two: a
 * redeploy of the same commit — which is how a bad environment variable gets
 * fixed — is a new deploy and should be a new worker, and its COMMIT_REF is
 * the one it had before. The timestamp is the local fallback.
 *
 * Next's own build id is left alone. Only the worker needs this.
 */
const buildId =
  process.env.DEPLOY_ID || process.env.COMMIT_REF || `dev-${Date.now()}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
