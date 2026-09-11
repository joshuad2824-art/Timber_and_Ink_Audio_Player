import { NextResponse } from "next/server";

import { listCatalog, getSiteText } from "@/data/catalog";

export const dynamic = "force-dynamic";

/**
 * The public catalog: published and listed records only, with no phrases and
 * no track data. Safe to hand to anyone with the link.
 */
export async function GET() {
  const [records, siteText] = await Promise.all([listCatalog(), getSiteText()]);

  return NextResponse.json(
    { records, siteText },
    { headers: { "cache-control": "no-store" } },
  );
}
