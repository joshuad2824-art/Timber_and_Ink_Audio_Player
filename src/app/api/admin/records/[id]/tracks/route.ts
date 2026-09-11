import { NextResponse } from "next/server";

import { createTrack } from "@/data/admin";
import { requireAdmin } from "@/data/guard";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const trackId = await createTrack(id);
  return NextResponse.json({ ok: true, id: trackId });
}
