import { NextResponse } from "next/server";

import { clearCover, setCover } from "@/data/admin";
import { db } from "@/data/db";
import { requireAdmin } from "@/data/guard";
import { coverKey, IMAGE_MIME, writeCover, type ImageMime } from "@/data/storage";

export const dynamic = "force-dynamic";

/**
 * A ceiling well under what a Netlify function will accept, because the desk
 * has already re-encoded the picture to fit the mat. Anything arriving larger
 * than this did not come through that path, and the honest answer is to say so
 * rather than to try.
 */
const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Is this actually the kind of file it says it is?
 *
 * The content type on the request is a claim, not evidence. The route stores it
 * and serves it straight back, so a declared type that does not match the bytes
 * would mean the site telling a browser something untrue about what it is being
 * handed. Four bytes of header settle it.
 */
function looksLike(mime: ImageMime, bytes: Uint8Array): boolean {
  const at = (i: number) => bytes[i] ?? -1;

  switch (mime) {
    case "image/jpeg":
      return at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff;
    case "image/png":
      return (
        at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47 &&
        at(4) === 0x0d && at(5) === 0x0a && at(6) === 0x1a && at(7) === 0x0a
      );
    case "image/webp":
      // "RIFF" .... "WEBP"
      return (
        at(0) === 0x52 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x46 &&
        at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50
      );
  }
}

/**
 * Put a cover on a record.
 *
 * One request, no chunking. A cover arrives at a few hundred kilobytes because
 * the desk has already scaled it down to what the mat will show — the whole
 * reason that happens in the browser is so this can be a single PUT rather than
 * the stitched-together affair the audio path has to be.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const declared = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  const mime = IMAGE_MIME.find((m) => m === declared);
  if (!mime) {
    return NextResponse.json(
      { ok: false, error: "That has to be a JPEG, a PNG, or a WebP." },
      { status: 415 },
    );
  }

  const rows = (await db().sql`
    SELECT slug FROM record WHERE id = ${id} LIMIT 1
  `) as unknown as Array<{ slug: string }>;
  const slug = rows[0]?.slug;
  if (!slug) return NextResponse.json({ ok: false }, { status: 404 });

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength === 0) {
    return NextResponse.json({ ok: false, error: "That file was empty." }, { status: 400 });
  }
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "That image is too large to take." },
      { status: 413 },
    );
  }
  if (!looksLike(mime, bytes)) {
    return NextResponse.json(
      { ok: false, error: "That file isn't the kind of image it claims to be." },
      { status: 400 },
    );
  }

  /* A new key every time, so nothing has to overwrite anything. Blobs is
     eventually consistent and a replaced cover is the commonest thing an owner
     does — writing to the same key would sometimes go on serving the picture
     they had just decided against. */
  const key = coverKey(slug, mime);
  await writeCover(key, bytes);

  const stored = await setCover(id, key, mime);
  if (!stored) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({ ok: true, bytes: bytes.byteLength });
}

/** Take the cover off again. The record keeps its empty mount. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await clearCover(id);
  return NextResponse.json({ ok: true });
}
