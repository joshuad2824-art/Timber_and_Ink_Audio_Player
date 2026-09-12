import { NextResponse } from "next/server";

import {
  deleteRecord,
  getAdminRecord,
  moveRecord,
  patchRecord,
  setRecordPhrase,
  toSlug,
  uniqueSlug,
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
    if (current && !current.published) {
      /* Made free before it is written. `slug` is UNIQUE, so two drafts named
         the same thing used to collide here — and a rejected write, uncaught,
         reached the editor as a title that simply sprang back to what it had
         been with nothing said. Naming a second record after the first is an
         ordinary thing to want. */
      patch.slug = await uniqueSlug(toSlug(body.albumTitle), id);
    }
  }
  if (typeof body?.intro === "string") patch.intro = body.intro.slice(0, 4000);
  if (typeof body?.published === "boolean") patch.published = body.published;
  if (typeof body?.listed === "boolean") patch.listed = body.listed;
  if (body?.year !== undefined) {
    const year = parseDuration(String(body.year));
    /* A year that will not parse used to be dropped on the floor: the field
       reverted on the next reload and the owner was left to guess whether the
       save had happened. It is worth one sentence. */
    if (year === null || year <= 1900 || year >= 2200) {
      return NextResponse.json(
        { ok: false, error: "I need a year there — four digits, like 1994." },
        { status: 400 },
      );
    }
    patch.year = year;
  }

  try {
    if (Object.keys(patch).length > 0) await patchRecord(id, patch);
  } catch {
    /* Anything the database refused. The owner's words are still on their
       screen; only the row is behind, and saying so is the difference between
       trying again and not knowing there is anything to try again. */
    return NextResponse.json(
      { ok: false, error: "That didn't save. It's still here — try again." },
      { status: 500 },
    );
  }

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
