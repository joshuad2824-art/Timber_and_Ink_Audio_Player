import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";

import { credentialVersion, deskClaimed, setAdminPassword } from "@/data/admin";
import { adminCookieName, secretReady, signAdminSession } from "@/data/crypto";
import { checkRate, clearFailures, clientIp, recordFailure } from "@/data/ratelimit";

export const dynamic = "force-dynamic";

const SESSION_DAYS = 14;
const MIN_PASSWORD = 12;

/**
 * Claim the desk — once, on a site that has never had an owner.
 *
 * No password is seeded anywhere, so there is no default to forget to change.
 * The trade is that an unclaimed desk is briefly claimable by whoever finds it
 * first, which is why this also demands a setup token that only exists in the
 * project's environment variables. The owner reads it from Netlify; it never
 * travels through a chat log, an email, or this repository.
 *
 * Once claimed this route is closed for good — changing the password afterwards
 * happens from inside the desk, where it is already authorized.
 */
export async function POST(request: Request) {
  if (await deskClaimed()) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const expected = process.env.SHADOW_HARBOR_SETUP_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "No setup token is configured for this site." },
      { status: 503 },
    );
  }

  /* Checked before the password is written, not after. Signing the session is
     the last step, and if it is going to fail for want of a secret it has to
     fail before the credential exists — otherwise the desk ends up claimed by
     a password that can never sign in, and the only way back is the database. */
  if (!secretReady()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This site has no signing secret set, so I can't open a session. " +
          "Set SHADOW_HARBOR_SECRET (32+ characters) and try again.",
      },
      { status: 503 },
    );
  }

  let token = "";
  let password = "";
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    /* handled below */
  }

  const ip = clientIp(await headers());
  const verdict = await checkRate(ip, "admin");
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many tries. Give it a few minutes." },
      { status: 429, headers: { "retry-after": String(verdict.retryAfterSeconds) } },
    );
  }

  const given = Buffer.from(token, "utf8");
  const want = Buffer.from(expected, "utf8");
  const tokenOk = given.length === want.length && timingSafeEqual(given, want);

  if (!tokenOk) {
    await recordFailure(ip, "__claim__", "admin");
    return NextResponse.json({ ok: false, error: "That isn't the token." }, { status: 401 });
  }

  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: `Make it at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  await setAdminPassword(password);
  await clearFailures(ip, "__claim__", "admin");

  const version = await credentialVersion();
  if (version === null) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), signAdminSession(expiresAt, version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
