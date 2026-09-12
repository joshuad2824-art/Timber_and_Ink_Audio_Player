"use client";

import { useEffect } from "react";

/**
 * Registers the service worker, and only in production.
 *
 * In development it does the opposite and tears any worker down. Next's dev
 * server hands out chunk URLs that are not content-hashed the way a build's
 * are, so a worker left over from a production visit to the same localhost
 * would serve yesterday's JavaScript to today's code and the failure would look
 * like anything but a stale cache.
 *
 * Nothing waits on this. If registration fails — an unsupported browser, a
 * private window, a user who has switched workers off — every screen still
 * works; what is lost is offline, which is the correct thing to lose.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      return;
    }

    /* The build id in the query is load-bearing, not decoration. `sw.js` is
       served as a static file and its bytes do not change between deploys, so
       without it the browser compares the two, finds them identical, and never
       installs the new worker — leaving the shell and page caches at whatever
       version first installed them. A changed URL is a new worker. */
    const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "1";
    void navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(version)}`, { scope: "/" })
      .catch(() => {});
  }, []);

  return null;
}
