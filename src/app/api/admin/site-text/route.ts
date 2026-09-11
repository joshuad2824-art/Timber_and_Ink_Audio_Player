import { NextResponse } from "next/server";

import { updateSiteText } from "@/data/admin";
import { getSiteText } from "@/data/catalog";
import { requireAdmin } from "@/data/guard";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const current = await getSiteText();

  await updateSiteText({
    eyebrow: typeof body?.eyebrow === "string" ? body.eyebrow.slice(0, 120) : current.eyebrow,
    title: typeof body?.title === "string" ? body.title.slice(0, 120) : current.title,
    intro: typeof body?.intro === "string" ? body.intro.slice(0, 2000) : current.intro,
    footer: typeof body?.footer === "string" ? body.footer.slice(0, 200) : current.footer,
  });

  return NextResponse.json({ ok: true });
}
