import "server-only";

import { NextResponse } from "next/server";

import { isAdmin } from "./admin";

/**
 * The single authorization check for every admin route.
 *
 * One function rather than a check per handler, because "every admin endpoint
 * is authorized server-side" is only true if it is impossible to add a handler
 * and forget. Each route's first line is `const denied = await requireAdmin();
 * if (denied) return denied;` — a shape that is conspicuous by its absence in
 * review.
 *
 * Answers 404 rather than 401: the desk should not confirm its own existence to
 * someone who cannot open it.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ ok: false }, { status: 404 });
}
