import { NextResponse } from "next/server";

import { deleteTrack, moveTrack, patchTrack } from "@/data/admin";
import { requireAdmin } from "@/data/guard";
import { parseDuration } from "@/data/phrase";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, trackId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body?.move === "up" || body?.move === "down") {
    await moveTrack(id, trackId, body.move === "up" ? -1 : 1);
    return NextResponse.json({ ok: true });
  }

  const patch: Parameters<typeof patchTrack>[2] = {};
  if (typeof body?.title === "string") patch.title = body.title.slice(0, 300);
  if (typeof body?.hidden === "boolean") patch.hidden = body.hidden;
  if (typeof body?.length === "string") {
    // Accepts m:ss or a raw second count, because the owner types whichever is
    // at hand. Anything else leaves the stored value alone rather than zeroing
    // a real duration over a typo.
    const seconds = parseDuration(body.length);
    if (seconds !== null && seconds >= 0) patch.seconds = seconds;
  }

  if (Object.keys(patch).length > 0) await patchTrack(id, trackId, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id, trackId } = await params;
  await deleteTrack(id, trackId);
  return NextResponse.json({ ok: true });
}
