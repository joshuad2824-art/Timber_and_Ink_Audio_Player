import type { ListenFormat, TrackAssetSizes } from "@/data/types";

/**
 * Which tracks are on this device.
 *
 * Every answer here is read out of the Cache API. Nothing is remembered in
 * localStorage, and that is the whole design: a browser evicts caches when a
 * device runs short of room, and it does not ask first. A bookmark drawn from
 * a note we kept would go on saying a track is here long after the browser
 * threw it away — a promise of music without a signal, broken at exactly the
 * moment there is no signal to fall back on. So the cache is the record, and
 * the count is a measurement rather than a claim.
 */

/* Shared with public/sw.js, which cannot import from here — it is served as a
   plain script from the origin root. If either name changes, change it there. */
const AUDIO_CACHE = "shadow-harbor-audio";
const PAGES_CACHE = "shadow-harbor-pages-v1";
const COVER_CACHE = "shadow-harbor-covers";

/** The one URL shape for a track's bytes. Format is part of the cache key. */
export function audioUrl(slug: string, trackId: string, format: ListenFormat): string {
  return `/api/records/${slug}/tracks/${trackId}/audio?format=${format}`;
}

/**
 * Whether keeping anything is possible at all.
 *
 * The Cache API needs a secure context, so this is false over plain http on
 * anything but localhost, and false in some private windows. Where it is false
 * the offline controls do not render — an inert bookmark button would be worse
 * than none.
 */
export function offlineSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "caches" in window &&
    window.isSecureContext === true
  );
}

/** What a track is kept as, keyed by track id. Absent means not kept. */
export type KeptMap = Record<string, ListenFormat>;

/**
 * Read the kept set for one record.
 *
 * Asks the cache for its keys once and filters, rather than probing each
 * track: one round trip instead of two per track, and it also catches a track
 * the owner has since deleted, whose bytes are still taking up room.
 */
export async function readKept(slug: string): Promise<KeptMap> {
  if (!offlineSupported()) return {};

  const cache = await caches.open(AUDIO_CACHE);
  const keys = await cache.keys();
  const prefix = `/api/records/${slug}/tracks/`;
  const out: KeptMap = {};

  for (const request of keys) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(prefix)) continue;

    const rest = url.pathname.slice(prefix.length);
    const cut = rest.indexOf("/");
    if (cut <= 0) continue;

    const trackId = rest.slice(0, cut);
    const format = url.searchParams.get("format");
    if (format !== "flac" && format !== "mp3") continue;

    // If both encodings somehow ended up on the device, the lossless one is
    // what the listener has.
    if (out[trackId] !== "flac") out[trackId] = format;
  }

  return out;
}

/** How much room this origin has left, or null where nothing will say. */
async function headroomBytes(): Promise<number | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  try {
    const { quota, usage } = await navigator.storage.estimate();
    if (typeof quota !== "number" || quota <= 0) return null;
    return Math.max(0, quota - (usage ?? 0));
  } catch {
    return null;
  }
}

/**
 * Which encoding to keep a whole album in.
 *
 * Lossless is the intent and the default. The exception is a device that plainly
 * cannot hold it: a 42-minute album in FLAC is about 420 MB, and where the
 * browser will not promise that much room the honest thing is to keep the MP3
 * rather than hand somebody a bookmark that lies.
 *
 * The margin is deliberate. Filling storage to its stated limit gets the whole
 * origin evicted on many browsers — including, on some, the pages themselves —
 * so the album has to fit inside two thirds of what is free, not all of it.
 */
export async function planFormat(
  sizes: TrackAssetSizes,
  trackIds: string[],
): Promise<ListenFormat> {
  const flacTotal = totalBytes(sizes, trackIds, "flac");
  const everyTrackHasFlac = trackIds.every((id) => sizes[id]?.flac);
  if (!everyTrackHasFlac || flacTotal === 0) return "mp3";

  const free = await headroomBytes();
  if (free === null) return "flac"; // Nothing said no; take the lossless one.

  return flacTotal <= free * 0.66 ? "flac" : "mp3";
}

/** The sum of one encoding across a set of tracks. Missing counts as zero. */
export function totalBytes(
  sizes: TrackAssetSizes,
  trackIds: string[],
  format: ListenFormat,
): number {
  let total = 0;
  for (const id of trackIds) total += sizes[id]?.[format] ?? 0;
  return total;
}

export type KeepResult =
  | { ok: true; format: ListenFormat; downgraded: boolean }
  | { ok: false; error: string };

/**
 * Put one track on this device.
 *
 * The fetch deliberately carries no Range header, so what lands in the cache is
 * always one whole file under the plain URL. The service worker slices ranges
 * out of it on the way back; storing fragments would give it nothing to slice.
 *
 * A refused write falls back to the MP3 once rather than reporting failure. A
 * quota error on a lossless track is not "this didn't work", it is "not at that
 * size" — and the caller is told which it got, so the rest of the album can be
 * kept the same way instead of failing a track at a time.
 */
export async function keepTrack(
  slug: string,
  trackId: string,
  sizes: TrackAssetSizes,
  preferred: ListenFormat,
): Promise<KeepResult> {
  if (!offlineSupported()) {
    return { ok: false, error: "This browser won't keep files for later." };
  }

  const available = sizes[trackId] ?? {};
  const order: ListenFormat[] =
    preferred === "flac" && available.flac
      ? available.mp3
        ? ["flac", "mp3"]
        : ["flac"]
      : available.mp3
        ? ["mp3"]
        : available.flac
          ? ["flac"]
          : [];

  if (order.length === 0) {
    return { ok: false, error: "There's no file behind that track yet." };
  }

  const cache = await caches.open(AUDIO_CACHE);
  let lastError = "The download didn't finish.";

  for (const format of order) {
    const url = audioUrl(slug, trackId, format);
    try {
      /* credentials are same-origin by default, which is what the streaming
         route needs — it checks this record's unlock cookie on every byte. */
      const response = await fetch(url);
      if (!response.ok) {
        lastError =
          response.status === 404
            ? "There's no file behind that track yet."
            : "The server wouldn't send that one.";
        continue;
      }

      await cache.put(new Request(url), response);
      return { ok: true, format, downgraded: format !== preferred };
    } catch (err) {
      const quota =
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.name === "NotSupportedError");
      lastError = quota
        ? "There isn't room on this device for that."
        : "The download didn't finish.";
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Take a track back off the device — both encodings, whichever is here.
 *
 * Asking for the format would mean trusting what we last read, and eviction
 * happens between reads. Deleting both is one extra call and cannot leave bytes
 * behind that the bookmark no longer knows about.
 */
export async function dropTrack(slug: string, trackId: string): Promise<void> {
  if (!offlineSupported()) return;

  const cache = await caches.open(AUDIO_CACHE);
  await Promise.all(
    (["flac", "mp3"] as ListenFormat[]).map((format) =>
      cache.delete(new Request(audioUrl(slug, trackId, format))),
    ),
  );
}

/** A size for a line of copy. Megabytes, because that is the unit of a track. */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

/**
 * Forget everything this device holds for one record.
 *
 * Called by "Lock it back", which otherwise only drops a cookie. Without this
 * the gesture is a half-truth: the kept audio would still be on the device and
 * the worker would still serve it — it answers from the cache before it looks
 * at anything, and a file that is already here has no cookie left to check —
 * while the last-seen album page would still be there to be served offline,
 * track titles and all, on a record the listener has just closed.
 *
 * "Closed on this device" has to mean the device is empty of it.
 */
export async function forgetRecord(slug: string): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  try {
    const audio = await caches.open(AUDIO_CACHE);
    const prefix = `/api/records/${slug}/tracks/`;
    await Promise.all(
      (await audio.keys())
        .filter((request) => new URL(request.url).pathname.startsWith(prefix))
        .map((request) => audio.delete(request)),
    );

    /* The album page as it was last served. Matched by path rather than by a
       constructed Request, because what was stored is the navigation request
       the browser made, headers and all. */
    const pages = await caches.open(PAGES_CACHE);
    await Promise.all(
      (await pages.keys())
        .filter((request) => new URL(request.url).pathname === `/r/${slug}`)
        .map((request) => pages.delete(request)),
    );

    // And the sleeve. The worker keeps that one as a side effect of looking at
    // it, so it is here whether or not anything was ever deliberately kept.
    const covers = await caches.open(COVER_CACHE);
    await Promise.all(
      (await covers.keys())
        .filter((request) => new URL(request.url).pathname === `/api/records/${slug}/cover`)
        .map((request) => covers.delete(request)),
    );
  } catch {
    /* Nothing here is load-bearing for the lock itself, which is the cookie.
       A browser that refuses to open a cache has nothing cached to clear. */
  }
}
