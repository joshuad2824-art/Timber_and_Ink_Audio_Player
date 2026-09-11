import { NextResponse } from "next/server";

import { unlockCookieName } from "@/data/crypto";

export const dynamic = "force-dynamic";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Close one record on this device again — just this one; a phrase entered for
 * another record is untouched.
 *
 * Cleared on the same Path it was set on. Miss that and the browser keeps the
 * original cookie, the record silently stays open, and "Lock it back" becomes
 * a button that lies.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG.test(slug)) return NextResponse.json({ ok: true });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(unlockCookieName(slug), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
