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

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  return null;
}
