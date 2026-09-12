import "server-only";

import { getStore } from "@netlify/blobs";

/**
 * Media storage — audio, and cover art.
 *
 * On Netlify this is Blobs. Locally it is a directory, because the audio path —
 * range requests, seeking, crossfade pre-loading — is the part of this app most
 * likely to break in ways that only show up when real bytes move, and that is
 * not worth discovering in production.
 *
 * Keys are opaque and never appear in a page. Every byte is served through a
 * route that checks the record's unlock cookie, so there is no public path to
 * guess at.
 *
 * Two stores, not one. Covers are small, are replaced often, and are the only
 * thing here a listener sees before the music loads; keeping them apart means
 * a cover can be re-uploaded, or the whole lot cleared, without going anywhere
 * near tens of gigabytes of masters.
 */

export type AudioFormat = "flac" | "mp3" | "wav";

export const MIME: Record<AudioFormat, string> = {
  flac: "audio/flac",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

const AUDIO_STORE = "shadow-harbor-audio";
const COVER_STORE = "shadow-harbor-covers";

/** The image types the upload route will accept, and nothing else. */
export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMime = (typeof IMAGE_MIME)[number];

const IMAGE_EXT: Record<ImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function usingLocalStore(): boolean {
  return Boolean(process.env.SHADOW_HARBOR_LOCAL_AUDIO);
}

/* ── the two stores, over one implementation ──────────────────────────────── */

function localPath(store: string, key: string): Promise<string> {
  return import("node:path").then(({ join }) =>
    join(process.env.SHADOW_HARBOR_LOCAL_AUDIO!, store, key),
  );
}

async function get(store: string, key: string): Promise<Uint8Array | null> {
  if (usingLocalStore()) {
    const { readFile } = await import("node:fs/promises");
    try {
      return new Uint8Array(await readFile(await localPath(store, key)));
    } catch {
      return null;
    }
  }

  const data = await getStore(store).get(key, { type: "arrayBuffer" });
  return data ? new Uint8Array(data as ArrayBuffer) : null;
}

async function put(store: string, key: string, body: Uint8Array): Promise<void> {
  if (usingLocalStore()) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    const path = await localPath(store, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return;
  }

  await getStore(store).set(key, body.buffer as ArrayBuffer);
}

async function del(store: string, key: string): Promise<void> {
  if (usingLocalStore()) {
    const { rm } = await import("node:fs/promises");
    await rm(await localPath(store, key), { force: true });
    return;
  }

  await getStore(store).delete(key);
}

/** Where a track's encoding lives. Slug and track id are already constrained. */
export function audioKey(
  slug: string,
  trackId: string,
  format: AudioFormat,
): string {
  return `${slug}/${trackId}.${format}`;
}

/**
 * Read one stored object whole.
 *
 * Whole, rather than a ranged read, because neither Blobs nor a plain file
 * gives us a partial fetch here — the range is applied after. For a lossless
 * track that means tens of megabytes through the function per request, which is
 * the cost of Blobs having no signed URLs. It is the single most expensive
 * thing this app does; if listening volume ever makes that bite, this is the
 * function to change.
 */
export function readAudio(key: string): Promise<Uint8Array | null> {
  return get(AUDIO_STORE, key);
}

/**
 * Read one slice of a stored track, moving as few bytes as it can.
 *
 * This is the hot path of the whole site and it used to be the wasteful one.
 * An <audio> element does not fetch a track, it fetches byte ranges of one —
 * a few hundred kilobytes at a time while playing, and a fresh range every
 * time the scrub bar moves. `readAudio` answered each of those by pulling the
 * entire file out of storage and into the function's memory to hand back a
 * slice of it, so a forty-megabyte lossless track cost forty megabytes per
 * request no matter how little of it was wanted. A record played from end to
 * end moved it dozens of times over.
 *
 * Neither Blobs nor a plain file offers a ranged read here, so the range is
 * still applied on this side — but against a stream rather than a buffer, and
 * the stream is cancelled the moment the slice is full. Cancelling closes the
 * underlying response, so everything after the range is never transferred at
 * all. Playback is a walk forwards through the file, which means the common
 * case now moves roughly what it asks for.
 *
 * What is still paid is the head: a seek to the last minute of a track has to
 * read past everything before it. Fixing that means storing the audio in
 * addressable pieces rather than one object, which is a change to how uploads
 * are written, not to how they are read.
 *
 * Locally the file is on disk and a positional read is exact, with no skipping
 * at all.
 */
export async function readAudioRange(
  key: string,
  start: number,
  /** Inclusive, as an HTTP range is. */
  end: number,
): Promise<Uint8Array | null> {
  const length = end - start + 1;
  if (length <= 0) return new Uint8Array(0);

  if (usingLocalStore()) {
    const { open } = await import("node:fs/promises");
    let handle;
    try {
      handle = await open(await localPath(AUDIO_STORE, key), "r");
    } catch {
      return null;
    }
    try {
      const out = new Uint8Array(length);
      const { bytesRead } = await handle.read(out, 0, length, start);
      return out.subarray(0, bytesRead);
    } finally {
      await handle.close().catch(() => {});
    }
  }

  const stream = (await getStore(AUDIO_STORE).get(key, { type: "stream" })) as
    | ReadableStream<Uint8Array>
    | null;
  if (!stream) return null;

  const reader = stream.getReader();
  const out = new Uint8Array(length);
  let skipped = 0;
  let filled = 0;

  try {
    while (filled < length) {
      const { done, value } = await reader.read();
      if (done || !value) break;

      let chunk: Uint8Array = value;
      if (skipped < start) {
        const drop = Math.min(start - skipped, chunk.byteLength);
        skipped += drop;
        chunk = chunk.subarray(drop);
        if (chunk.byteLength === 0) continue;
      }

      const take = Math.min(length - filled, chunk.byteLength);
      out.set(chunk.subarray(0, take), filled);
      filled += take;
    }
  } finally {
    // The point of the exercise: this is what stops the tail being sent.
    await reader.cancel().catch(() => {});
  }

  return out.subarray(0, filled);
}

export function writeAudio(key: string, body: Uint8Array): Promise<void> {
  return put(AUDIO_STORE, key, body);
}

export function deleteAudio(key: string): Promise<void> {
  return del(AUDIO_STORE, key);
}

/* ── cover art ────────────────────────────────────────────────────────────── */

/**
 * Where a record's cover lives.
 *
 * The random middle is what makes replacing a cover safe. Blobs is eventually
 * consistent, so overwriting one key can serve the old image for a while after
 * the new one is stored — and a cover is the thing an owner replaces because
 * they did not like the first one. A new key every time means the bytes behind
 * a URL never change; the row points somewhere else instead.
 */
export function coverKey(slug: string, mime: ImageMime): string {
  const token = Math.random().toString(36).slice(2, 10);
  return `${slug}/${token}.${IMAGE_EXT[mime]}`;
}

export function readCover(key: string): Promise<Uint8Array | null> {
  return get(COVER_STORE, key);
}

export function writeCover(key: string, body: Uint8Array): Promise<void> {
  return put(COVER_STORE, key, body);
}

export function deleteCover(key: string): Promise<void> {
  return del(COVER_STORE, key);
}
