import "server-only";

import { getStore } from "@netlify/blobs";

/**
 * Audio storage.
 *
 * On Netlify this is Blobs. Locally it is a directory, because the audio path —
 * range requests, seeking, crossfade pre-loading — is the part of this app most
 * likely to break in ways that only show up when real bytes move, and that is
 * not worth discovering in production.
 *
 * Keys are opaque and never appear in a page. Every byte is served through a
 * route that checks the record's unlock cookie, so there is no public path to
 * guess at.
 */

export type AudioFormat = "flac" | "mp3" | "wav";

export const MIME: Record<AudioFormat, string> = {
  flac: "audio/flac",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

const STORE = "shadow-harbor-audio";

function usingLocalStore(): boolean {
  return Boolean(process.env.SHADOW_HARBOR_LOCAL_AUDIO);
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
export async function readAudio(key: string): Promise<Uint8Array | null> {
  if (usingLocalStore()) {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    try {
      const buf = await readFile(join(process.env.SHADOW_HARBOR_LOCAL_AUDIO!, key));
      return new Uint8Array(buf);
    } catch {
      return null;
    }
  }

  const store = getStore(STORE);
  const data = await store.get(key, { type: "arrayBuffer" });
  return data ? new Uint8Array(data as ArrayBuffer) : null;
}

export async function writeAudio(key: string, body: Uint8Array): Promise<void> {
  if (usingLocalStore()) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname, join } = await import("node:path");
    const path = join(process.env.SHADOW_HARBOR_LOCAL_AUDIO!, key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
    return;
  }

  const store = getStore(STORE);
  await store.set(key, body.buffer as ArrayBuffer);
}

export async function deleteAudio(key: string): Promise<void> {
  if (usingLocalStore()) {
    const { rm } = await import("node:fs/promises");
    const { join } = await import("node:path");
    await rm(join(process.env.SHADOW_HARBOR_LOCAL_AUDIO!, key), { force: true });
    return;
  }

  const store = getStore(STORE);
  await store.delete(key);
}
