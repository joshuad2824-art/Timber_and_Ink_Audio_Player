import { NextResponse } from "next/server";

import {
  deleteRecord,
  getAdminRecord,
  moveRecord,
  patchRecord,
  setRecordPhrase,
  toSlug,
} from "@/data/admin";
import { requireAdmin } from "@/data/guard";
import { parseDuration } from "@/data/phrase";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const record = await getAdminRecord(id);
  if (!record) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body?.move === "up" || body?.move === "down") {
    await moveRecord(id, body.move === "up" ? -1 : 1);
    return NextResponse.json({ ok: true });
  }

  // The phrase is write-only: it can be replaced but never read back, because
  // only its hash was ever stored.
  if (typeof body?.phrase === "string") {
    await setRecordPhrase(id, body.phrase);
  }

  const patch: Parameters<typeof patchRecord>[1] = {};
  if (typeof body?.artistName === "string") patch.artistName = body.artistName.slice(0, 200);
  if (typeof body?.albumTitle === "string") {
    patch.albumTitle = body.albumTitle.slice(0, 200);
    // The slug follows the album title only while a record is still a draft.
    // Once published it is a link someone may already hold, and quietly moving
    // it would break every invitation already sent.
    const current = await getAdminRecord(id);
    if (current && !current.published) patch.slug = toSlug(body.albumTitle);
  }
  if (typeof body?.intro === "string") patch.intro = body.intro.slice(0, 4000);
  if (typeof body?.published === "boolean") patch.published = body.published;
  if (typeof body?.listed === "boolean") patch.listed = body.listed;
  if (body?.year !== undefined) {
    const year = parseDuration(String(body.year));
    if (year !== null && year > 1900 && year < 2200) patch.year = year;
  }

  if (Object.keys(patch).length > 0) await patchRecord(id, patch);

  const record = await getAdminRecord(id);
  return NextResponse.json({ ok: true, record });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await deleteRecord(id);
  return NextResponse.json({ ok: true });
}
