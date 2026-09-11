import { NextResponse } from "next/server";

import { createRecord, listAllRecords } from "@/data/admin";
import { requireAdmin } from "@/data/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json({ records: await listAllRecords() });
}

/** Start a draft. Nobody sees it until it is published. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = await createRecord();
  return NextResponse.json({ ok: true, id });
}
