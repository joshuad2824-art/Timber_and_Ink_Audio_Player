import { NextResponse } from "next/server";

import { db } from "@/data/db";
import { requireAdmin } from "@/data/guard";
import { audioKey, deleteAudio, MIME, readAudio, writeAudio, type AudioFormat } from "@/data/storage";

export const dynamic = "force-dynamic";

const FORMATS: AudioFormat[] = ["flac", "mp3", "wav"];
const UPLOAD_ID = /^[A-Za-z0-9_-]{6,64}$/;

/** Chunks are held under this prefix until the upload is finished or abandoned. */
const partKey = (uploadId: string, index: number) => `.parts/${uploadId}/${index}`;

/**
 * Receive one slice of an encoded track.
 *
 * A Netlify function's request body caps at a few megabytes, and a lossless
 * track is tens. The desk therefore sends the file in pieces and this stores
 * each one under a temporary key; POST then stitches them together. Nothing is
 * visible to a listener until that happens, so a half-finished upload leaves
 * the record exactly as it was.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, trackId } = await params;
  const url = new URL(request.url);
  const uploadId = url.searchParams.get("upload") ?? "";
  const index = Number(url.searchParams.get("chunk"));

  if (!UPLOAD_ID.test(uploadId) || !Number.isInteger(index) || index < 0 || index > 4096) {
    return NextResponse.json({ ok: false, error: "Bad chunk." }, { status: 400 });
  }

  // The track must belong to this record, or an upload could be aimed anywhere.
  const rows = (await db().sql`
    SELECT 1 FROM track WHERE id = ${trackId} AND record_id = ${id} LIMIT 1
  `) as unknown as unknown[];
  if (rows.length === 0) return NextResponse.json({ ok: false }, { status: 404 });

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength === 0) {
    return NextResponse.json({ ok: false, error: "Empty chunk." }, { status: 400 });
  }

  await writeAudio(partKey(uploadId, index), body);
  return NextResponse.json({ ok: true, bytes: body.byteLength });
}

/**
 * Stitch the chunks into the finished object and record it.
 *
 * The parts are removed either way — on success because they have been
 * superseded, and on failure so an abandoned upload does not sit in storage
 * forever waiting for a sweep that nobody wrote.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, trackId } = await params;
  const body = await request.json().catch(() => ({}));

  const uploadId = typeof body?.upload === "string" ? body.upload : "";
  const chunks = Number(body?.chunks);
  const format = FORMATS.find((f) => f === body?.format);
  const seconds = Number(body?.seconds);

  if (!UPLOAD_ID.test(uploadId) || !Number.isInteger(chunks) || chunks < 1 || chunks > 4096) {
    return NextResponse.json({ ok: false, error: "Bad upload." }, { status: 400 });
  }
  if (!format) {
    return NextResponse.json({ ok: false, error: "Unknown format." }, { status: 400 });
  }

  const rows = (await db().sql`
    SELECT r.slug FROM track t JOIN record r ON r.id = t.record_id
     WHERE t.id = ${trackId} AND t.record_id = ${id} LIMIT 1
  `) as unknown as Array<{ slug: string }>;
  const slug = rows[0]?.slug;
  if (!slug) return NextResponse.json({ ok: false }, { status: 404 });

  const cleanup = async () => {
    for (let i = 0; i < chunks; i++) {
      await deleteAudio(partKey(uploadId, i)).catch(() => {});
    }
  };

  try {
    const parts: Uint8Array[] = [];
    let total = 0;
    for (let i = 0; i < chunks; i++) {
      const part = await readAudio(partKey(uploadId, i));
      if (!part) {
        await cleanup();
        return NextResponse.json(
          { ok: false, error: `Chunk ${i + 1} of ${chunks} never arrived.` },
          { status: 400 },
        );
      }
      parts.push(part);
      total += part.byteLength;
    }

    const joined = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      joined.set(part, offset);
      offset += part.byteLength;
    }

    const key = audioKey(slug, trackId, format);
    await writeAudio(key, joined);

    await db().sql`
      INSERT INTO track_asset (track_id, format, blob_key, bytes, mime_type)
           VALUES (${trackId}, ${format}, ${key}, ${total}, ${MIME[format]})
      ON CONFLICT (track_id, format) DO UPDATE
         SET blob_key = ${key}, bytes = ${total}, mime_type = ${MIME[format]},
             created_at = NOW()
    `;

    // The duration comes from the master the desk decoded, not from a guess.
    if (Number.isFinite(seconds) && seconds > 0) {
      await db().sql`
        UPDATE track SET seconds = ${Math.round(seconds)} WHERE id = ${trackId}
      `;
    }

    await cleanup();
    return NextResponse.json({ ok: true, bytes: total });
  } catch (e) {
    await cleanup();
    throw e;
  }
}
