import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getPhraseHash } from "@/data/catalog";
import { unlockCookieName, signUnlock, verifyPhrase } from "@/data/crypto";
import { normalizePhrase, PHRASE_EMPTY, PHRASE_WRONG } from "@/data/phrase";
import { checkRate, clearFailures, clientIp, recordFailure } from "@/data/ratelimit";

export const dynamic = "force-dynamic";

/** How long a record stays open on a device once the phrase has been accepted. */
const UNLOCK_DAYS = 180;

/* The slug reaches the cookie's Path, so it is checked here as well as by the
   database's own constraint — a bad slug must never get far enough to widen a
   cookie's scope, even if it somehow got stored. */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Check a phrase and, if it is right, open this one record on this one device.
 *
 * The response body never says more than the listener needs. A missing record,
 * a draft, a record with no phrase set, and a wrong phrase all answer with the
 * same line — otherwise the gate becomes an oracle for which records exist.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG.test(slug)) {
    return NextResponse.json({ ok: false, error: PHRASE_WRONG }, { status: 401 });
  }

  let phrase = "";
  try {
    const body = await request.json();
    phrase = typeof body?.phrase === "string" ? body.phrase : "";
  } catch {
    phrase = "";
  }

  const normalized = normalizePhrase(phrase);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: PHRASE_EMPTY }, { status: 400 });
  }

  const ip = clientIp(await headers());

  // Checked before the hash comparison, so a blocked IP does no scrypt work.
  const verdict = await checkRate(ip);
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many tries. Give it a few minutes." },
      { status: 429, headers: { "retry-after": String(verdict.retryAfterSeconds) } },
    );
  }

  const { hash } = await getPhraseHash(slug);

  // verifyPhrase returns false for a null hash, so a record with no phrase set
  // and a record that does not exist take the same path as a wrong guess.
  const ok = await verifyPhrase(normalized, hash);

  if (!ok) {
    await recordFailure(ip, slug);
    return NextResponse.json({ ok: false, error: PHRASE_WRONG }, { status: 401 });
  }

  await clearFailures(ip);

  const expiresAt = Date.now() + UNLOCK_DAYS * 24 * 60 * 60 * 1000;
  const response = NextResponse.json({ ok: true });

  /* Scoped per record by name and by signature — this cookie opens exactly one
     record and proves nothing about any other. The Path stays "/" deliberately:
     the catalog has to know which records are already open to draw their state
     chips, and it is served from "/". Narrowing the Path to /r/<slug> hides the
     cookie from the catalog and the chips can then only ever read "Locked".

     Nothing is given up by that. The cookie is httpOnly so no script can read
     it, and verifyUnlock checks the slug inside the signature, so carrying it
     to another route conveys no authority there. */
  response.cookies.set(unlockCookieName(slug), signUnlock(slug, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_DAYS * 24 * 60 * 60,
  });

  return response;
}
