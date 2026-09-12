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

/* This deploy's identifier, put there by the page that registered us.

   The version had been a literal `v1` in the two names below, which made the
   comment under them false: `sw.js` is a static file whose bytes never change,
   so the browser never saw a new worker, `install` never ran again, and the
   names it deletes by were never anything but v1. The offline page stayed
   frozen at whichever build first installed it. */
const VERSION = new URL(self.location.href).searchParams.get("v") || "1";

/* Kept audio. Deliberately unversioned: bumping the worker must never throw
   away tracks somebody chose to keep. It is emptied only when they say so. */
const AUDIO = "shadow-harbor-audio";

/* The shell and the last-seen pages. Versioned, and cleared on activate — a
   new deploy has new markup, and a kept album is no use if it opens in last
   week's page. */
const SHELL = `shadow-harbor-shell-${VERSION}`;
const PAGES = `shadow-harbor-pages-${VERSION}`;

/* Cover art. Unversioned like the audio, and for a softer version of the same
   reason: a sleeve is a couple of hundred kilobytes and part of the record, so
   throwing it away on a deploy would leave somebody who kept an album looking
   at an empty mount on the next flight for no benefit at all. */
const COVERS = "shadow-harbor-covers";

const KEEP = new Set([AUDIO, SHELL, PAGES, COVERS]);

/** The offline stand-in, for a page nobody has visited yet. */
const OFFLINE = "/offline";

/**
 * Which track files this device is actually holding, as absolute URLs.
 *
 * A set in memory rather than a cache lookup, because the fetch handler has to
 * decide whether it is answering a request before it can await anything —
 * `respondWith` is called synchronously or not at all — so the answer has to be
 * there already.
 *
 * The reason it exists: on iOS, a media element in a home-screen app will not
 * play a ranged response that came back through a service worker. Every audio
 * request used to go through `respondWith`, including the ones this worker had
 * nothing cached for and simply proxied to the network, and in a standalone app
 * that is the difference between a record playing and a record sitting at
 * "Buffering" for good. The same build plays in Safari, where the media stack
 * is less particular, which is how it was found.
 *
 * So the rule is now: take over a track this device is holding, and let every
 * other one reach the network untouched, exactly as if nothing were installed.
 */
let keptUrls = null;

async function refreshKept() {
  try {
    const cache = await caches.open(AUDIO);
    const keys = await cache.keys();
    keptUrls = new Set(keys.map((request) => request.url));
  } catch {
    // Never leave it null on a failure — null means "not read yet", which
    // passes requests through, and that is the right answer here too.
    keptUrls = keptUrls ?? new Set();
  }
}

/* Read at worker start, not only on activate. A service worker is stopped and
   restarted freely between events, and the set has to be back when it is. */
void refreshKept();

/**
 * The page keeps and drops tracks itself — the worker is only ever the reader —
 * so it has to be told when the set moved underneath it. Without this a track
 * kept during this visit would go unrecognised until the worker next restarted,
 * and would stream instead of playing off the device.
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "kept-changed") {
    event.waitUntil(refreshKept());
  }
});

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

/* The pieces of the page that are not content-hashed and not in the markup.

   The two desk textures are referenced from inside a stylesheet, so the
   install scan — which reads src and href out of the offline page's own HTML —
   never saw them, and nothing else here matched their path. Offline, every
   screen lost its wear and its grain and came back as flat gradients: still
   legible, but plainly not the same site. They are versioned with the shell
   rather than trusted forever, because unlike a hashed chunk their URL stays
   the same when their contents change. */
const DRESSING = /^\/(textures|icons)\//;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Best effort throughout. A failed pre-cache must not stop the worker
      // installing, or one missing file means no offline at all.
      await precache(cache);
    })(),
  );
});

/* No `skipWaiting`, deliberately, and it used to be here.

   Now that a deploy really does produce a new worker, skipping the wait would
   mean a new worker activating under a page that is already open — and
   `activate` deletes the previous version's shell, which is where that page's
   own chunks are. It would pull the floor out from under a listener mid-record
   to install a build they have not asked for yet.

   The first install has nothing to wait for — there is no old worker — so it
   activates at once and `clients.claim()` below still takes control of the
   very first visit. Every later one lands on the next. */

/** The dressing: not in the markup, so it has to be named. */
const DRESSING_FILES = [
  "/textures/desk-wear.png",
  "/textures/desk-grain.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

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
    // Named rather than scanned: these are reached from inside a stylesheet,
    // where the scan above cannot see them.
    for (const file of DRESSING_FILES) assets.add(file);

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
      await refreshKept();
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
    /* Untouched unless this device is holding this exact file.

       Returning without calling `respondWith` is the whole point: the request
       goes to the network as though no worker were installed, which is what
       iOS needs to play it in a home-screen app. A track that is not kept was
       only ever being proxied here anyway — nothing was read from the cache
       and nothing was written to it — so the worker was adding a failure mode
       and nothing else.

       A worker that has only just started may not have read the cache yet.
       Passing that one request through is right online, and offline the media
       element asks again a moment later, by which time the set is there. */
    if (!keptUrls || !keptUrls.has(request.url)) return;

    event.respondWith(
      (async () => {
        const kept = await keptAudio(request);
        /* Held a moment ago and gone now — evicted between the read and the
           request. The network still has it. */
        return kept ?? fetch(request);
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

  /* The textures and the icons. Cache first, because they are the backdrop and
     waiting on the network to draw it is worse than drawing last deploy's copy;
     the version in the cache name is what eventually retires that copy. */
  if (DRESSING.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        const hit = await cache.match(request, { ignoreVary: true });
        if (hit) return hit;

        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(request, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          /* No signal and never seen. A missing texture layer is a flatter
             page, not a broken one, so this fails quietly rather than loudly. */
          return new Response(null, { status: 504 });
        }
      })(),
    );
    return;
  }

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
