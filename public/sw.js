/*
 * Shadow Harbor's service worker.
 *
 * Hand-written rather than generated. Workbox would be a reasonable choice for
 * a site of ordinary pages, but the one thing this worker has to get right is
 * the thing a generic recipe gets wrong: an <audio> element does not fetch a
 * track, it fetches byte ranges of a track, and a cached-response handler that
 * answers a Range request with the whole file makes every seek re-read the
 * entire album from disk. Everything here exists to serve real 206s out of the
 * Cache API.
 *
 * What it does not do is cache anything a listener has not asked it to. The
 * catalog, the unlock endpoint and every admin route go to the network, always.
 * A stale answer to "is this record open on this device" would be a security
 * bug dressed as a performance feature.
 */

/* Kept audio. Deliberately unversioned: bumping the worker must never throw
   away tracks somebody chose to keep. It is emptied only when they say so. */
const AUDIO = "shadow-harbor-audio";

/* The shell and the last-seen pages. Versioned, and cleared on activate — a
   new deploy has new markup, and a kept album is no use if it opens in last
   week's page. */
const SHELL = "shadow-harbor-shell-v1";
const PAGES = "shadow-harbor-pages-v1";

/* Cover art. Unversioned like the audio, and for a softer version of the same
   reason: a sleeve is a couple of hundred kilobytes and part of the record, so
   throwing it away on a deploy would leave somebody who kept an album looking
   at an empty mount on the next flight for no benefit at all. */
const COVERS = "shadow-harbor-covers";

const KEEP = new Set([AUDIO, SHELL, PAGES, COVERS]);

/** The offline stand-in, for a page nobody has visited yet. */
const OFFLINE = "/offline";

/* One track's audio. The trailing query carries the format, which is part of
   the cache key — a FLAC and an MP3 of the same track are different files and
   a device may hold either. */
const AUDIO_PATH = /^\/api\/records\/[^/]+\/tracks\/[^/]+\/audio$/;

/* A record's cover. Unlike the audio this is kept as a side effect of looking
   at it, because it is small and because the alternative is an album page that
   opens offline with a hole where the sleeve was. */
const COVER_PATH = /^\/api\/records\/[^/]+\/cover$/;

/** Content-hashed by the build, so it can be trusted forever. */
const IMMUTABLE = /^\/(_next\/static|flac)\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Best effort throughout. A failed pre-cache must not stop the worker
      // installing, or one missing file means no offline at all.
      await precache(cache);
      await self.skipWaiting();
    })(),
  );
});

/**
 * Pre-cache the offline page — and the files it needs to be a page.
 *
 * Caching the document alone is not enough and fails in the worst possible
 * way. The HTML arrives, the framework starts, its own route chunk is missing,
 * and the error boundary replaces the whole page with "a client-side exception
 * has occurred" — so the one screen whose entire job is to be reassuring when
 * nothing else loads becomes the ugliest failure on the site.
 *
 * The asset names are content-hashed by the build, so they cannot be listed
 * here. They are read out of the page's own markup instead, which means this
 * needs no build step and cannot drift: whatever the page asks for is what
 * gets kept.
 */
async function precache(cache) {
  try {
    // `reload` so a stale copy in the HTTP cache cannot be what gets stored.
    const page = await fetch(OFFLINE, { cache: "reload" });
    if (!page.ok) return;

    const html = await page.clone().text();
    await cache.put(OFFLINE, page);

    const assets = new Set(
      [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]),
    );
    assets.add("/manifest.webmanifest");

    await Promise.all(
      [...assets].map(async (url) => {
        try {
          const res = await fetch(url, { cache: "reload" });
          if (res.ok) await cache.put(url, res);
        } catch {
          /* one missing asset is not worth failing the install over */
        }
      }),
    );
  } catch {
    /* No network during install. The worker still installs; it simply has
       nothing to fall back on until a visit that does have one. */
  }
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KEEP.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

/**
 * Answer a Range request out of a cached whole file.
 *
 * `cache.match` ignores the Range header and hands back the complete response,
 * which an <audio> element reads as "this server does not do ranges" — and then
 * refetches everything on every seek. Some browsers now synthesise the 206
 * themselves; not all of them do, and the ones that do have not always. So it
 * is done here, where it is the same on every browser.
 *
 * The slicing goes through Blob.slice rather than an ArrayBuffer, so a seek
 * into a 40 MB track does not pull 40 MB into memory to hand back 64 KB of it.
 */
async function rangeFrom(cached, header) {
  const blob = await cached.blob();
  const total = blob.size;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return unsatisfiable(total, cached);

  const [, rawStart, rawEnd] = match;
  let start;
  let end;

  if (rawStart === "") {
    // A suffix range: "bytes=-1024" is the last 1024 bytes. Players use it to
    // read trailing metadata before committing to a stream.
    const len = Number(rawEnd);
    if (!Number.isFinite(len) || len <= 0) return unsatisfiable(total, cached);
    start = Math.max(0, total - len);
    end = total - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? total - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return unsatisfiable(total, cached);
  }
  end = Math.min(end, total - 1);

  const slice = blob.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "content-type": cached.headers.get("content-type") || "application/octet-stream",
      "content-length": String(slice.size),
      "content-range": `bytes ${start}-${end}/${total}`,
      "accept-ranges": "bytes",
    },
  });
}

function unsatisfiable(total, cached) {
  return new Response(null, {
    status: 416,
    statusText: "Range Not Satisfiable",
    headers: {
      "content-range": `bytes */${total}`,
      "accept-ranges": "bytes",
      "content-type": cached.headers.get("content-type") || "application/octet-stream",
    },
  });
}

/**
 * A kept track, if this device has one.
 *
 * The lookup drops the Range header on purpose: what is stored is always the
 * whole file under the plain URL, and the range is answered from it. Without
 * `ignoreVary` a response cached from one request can fail to match another
 * that differs only in a header the server happened to vary on.
 */
async function keptAudio(request) {
  const cache = await caches.open(AUDIO);
  const cached = await cache.match(new Request(request.url), { ignoreVary: true });
  if (!cached) return null;

  const range = request.headers.get("range");
  return range ? rangeFrom(cached, range) : cached;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Uploads, unlocks, sign-ins, deletes: none of it is ours to touch.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (AUDIO_PATH.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const kept = await keptAudio(request);
        if (kept) return kept;
        /* Not kept, so it streams. Nothing is written to the cache here: a
           track lands on the device because somebody chose to keep it, never
           as a side effect of listening once. */
        return fetch(request);
      })(),
    );
    return;
  }

  if (COVER_PATH.test(url.pathname)) {
    event.respondWith(coverFor(request, url));
    return;
  }

  // Everything else under /api is live or it is wrong.
  if (url.pathname.startsWith("/api/")) return;

  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        const hit = await cache.match(request);
        if (hit) return hit;

        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
        return fresh;
      })(),
    );
    return;
  }

  /* Pages. Network first, because the catalog's state chips and the desk's
     contents have to be current; the copy in the cache is there for the plane,
     the tunnel and the basement. */
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        try {
          const fresh = await fetch(request);
          /* Only 200s, and never a redirect: a cached redirect to the gate
             would outlive the cookie it was about and send a listener who is
             perfectly well unlocked back to the phrase card. */
          if (fresh.status === 200 && !fresh.redirected) {
            cache.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const hit = await cache.match(request, { ignoreSearch: false });
          if (hit) return hit;
          const shell = await caches.open(SHELL);
          return (await shell.match(OFFLINE)) ?? Response.error();
        }
      })(),
    );
  }
});

/**
 * A cover: from the network when there is one, from the last copy when there
 * is not.
 *
 * Network first rather than cache first, even though the URL carries a version
 * and a cached copy can never be wrong for that URL. The reason is the version:
 * when the owner replaces the art the page asks for a new URL, and a cache-first
 * handler would still be right — it would just also be holding the old one
 * forever. Writing through on every fetch and dropping the record's other
 * entries keeps it to one sleeve per record.
 */
async function coverFor(request, url) {
  const cache = await caches.open(COVERS);

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      // One cover per record: the previous version's URL is now litter.
      for (const key of await cache.keys()) {
        const kept = new URL(key.url);
        if (kept.pathname === url.pathname && kept.search !== url.search) {
          await cache.delete(key);
        }
      }
      await cache.put(new Request(request.url), fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const hit = await cache.match(new Request(request.url), { ignoreVary: true });
    return hit ?? Response.error();
  }
}

/* Keeping and dropping a track happen in the page, not here.
   The worker is only ever the reader.

   That split is deliberate. A worker is not controlling the page on the very
   first load — it installs during it — so routing "keep" through a message
   would leave the bookmark button inert until the next visit. The Cache API is
   the same storage from either side, so the page writes and the worker reads,
   and the button works the moment it is painted. */
