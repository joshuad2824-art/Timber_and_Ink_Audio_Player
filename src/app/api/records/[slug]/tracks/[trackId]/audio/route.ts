import { getTrackAsset } from "@/data/catalog";
import { readAudio, type AudioFormat } from "@/data/storage";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TRACK_ID = /^[A-Za-z0-9_-]{1,64}$/;
const FORMATS: AudioFormat[] = ["flac", "mp3"];

/**
 * One track's audio.
 *
 * Range support is not an optimisation here — it is what makes seeking work at
 * all. Browsers request a byte range when you drag the scrub bar, and an
 * endpoint that answers 200-with-everything forces the element to refetch the
 * whole track to move the playhead.
 *
 * `wav` is deliberately not servable. The master is archival; streaming it
 * would cost 1.7x the bytes of the FLAC for audio that decodes identically.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; trackId: string }> },
) {
  const { slug, trackId } = await params;
  if (!SLUG.test(slug) || !TRACK_ID.test(trackId)) {
    return new Response("Not found", { status: 404 });
  }

  const requested = new URL(request.url).searchParams.get("format") ?? "flac";
  const format = FORMATS.find((f) => f === requested);
  if (!format) return new Response("Not found", { status: 404 });

  // Checks the unlock cookie, that the track belongs to this record, and that
  // it is not hidden. A locked record answers exactly like a missing one.
  const asset = await getTrackAsset(slug, trackId, format);
  if (!asset) return new Response("Not found", { status: 404 });

  const bytes = await readAudio(asset.blobKey);
  if (!bytes) return new Response("Not found", { status: 404 });

  const total = bytes.byteLength;
  const range = request.headers.get("range");

  const common: Record<string, string> = {
    "content-type": asset.mimeType,
    "accept-ranges": "bytes",
    // Private: this is one listener's authorized copy and must never be held by
    // a shared cache. immutable because a track's bytes never change in place —
    // a re-upload writes a new key.
    "cache-control": "private, max-age=31536000, immutable",
  };

  if (!range) {
    return new Response(bytes as unknown as BodyInit, {
      status: 200,
      headers: { ...common, "content-length": String(total) },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) {
    return new Response(null, {
      status: 416,
      headers: { ...common, "content-range": `bytes */${total}` },
    });
  }

  const [, rawStart, rawEnd] = match;
  let start: number;
  let end: number;

  if (rawStart === "") {
    // A suffix range — "bytes=-1024" means the last 1024 bytes. Some players
    // use it to read trailing metadata before deciding to stream.
    const len = Number(rawEnd);
    if (!Number.isFinite(len) || len <= 0) {
      return new Response(null, {
        status: 416,
        headers: { ...common, "content-range": `bytes */${total}` },
      });
    }
    start = Math.max(0, total - len);
    end = total - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? total - 1 : Number(rawEnd);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return new Response(null, {
      status: 416,
      headers: { ...common, "content-range": `bytes */${total}` },
    });
  }

  end = Math.min(end, total - 1);
  const slice = bytes.subarray(start, end + 1);

  return new Response(slice as unknown as BodyInit, {
    status: 206,
    headers: {
      ...common,
      "content-length": String(slice.byteLength),
      "content-range": `bytes ${start}-${end}/${total}`,
    },
  });
}
