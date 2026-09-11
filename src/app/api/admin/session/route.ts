import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { checkAdminPassword, credentialVersion } from "@/data/admin";
import { adminCookieName, signAdminSession } from "@/data/crypto";
import { KEY_WRONG } from "@/data/phrase";
import { checkRate, clearFailures, clientIp, recordFailure } from "@/data/ratelimit";

export const dynamic = "force-dynamic";

/** How long the desk stays open on a device. Shorter than a listener's unlock:
 *  this cookie can change what everyone else sees. */
const SESSION_DAYS = 14;

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  if (!password) {
    return NextResponse.json({ ok: false, error: KEY_WRONG }, { status: 401 });
  }

  const ip = clientIp(await headers());
  const verdict = await checkRate(ip, "admin");
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many tries. Give it a few minutes." },
      { status: 429, headers: { "retry-after": String(verdict.retryAfterSeconds) } },
    );
  }

  const ok = await checkAdminPassword(password);
  if (!ok) {
    await recordFailure(ip, "__desk__", "admin");
    return NextResponse.json({ ok: false, error: KEY_WRONG }, { status: 401 });
  }

  const version = await credentialVersion();
  if (version === null) {
    return NextResponse.json({ ok: false, error: KEY_WRONG }, { status: 401 });
  }

  await clearFailures(ip, "admin");

  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), signAdminSession(expiresAt, version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // strict, not lax: nothing should ever arrive at the desk by following a
    // link from somewhere else.
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
