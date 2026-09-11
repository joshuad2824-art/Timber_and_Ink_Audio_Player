import "server-only";

import { db } from "./db";

/* Phrases are short and human-memorable, which is the point and also the
   weakness: "harbor light" is guessable given enough tries. Rate limiting is
   what turns a two-word phrase into something that holds up, so it is not
   optional decoration on the gate.

   Postgres backs this rather than a cache because counting attempts needs to
   be atomic and survive a cold start. A blob store with last-write-wins would
   quietly undercount under exactly the concurrency an attacker creates. */

const WINDOW_MS = 10 * 60 * 1000; // ten minutes

/**
 * Separate buckets, because the two doors protect different things.
 *
 * Sharing one would mean a listener fumbling a phrase on the home wifi counts
 * against the owner's own sign-in attempts — locking them out of their desk
 * from the next room. The desk is also stricter: there is exactly one correct
 * password and the person who knows it does not guess.
 */
export type RateScope = "record" | "admin";

const MAX_ATTEMPTS: Record<RateScope, number> = {
  record: 10,
  admin: 5,
};

export type RateVerdict = { allowed: boolean; retryAfterSeconds: number };

/**
 * Count this IP's recent failures and decide whether to let another attempt
 * through. Called before the phrase is checked, so a blocked IP never even
 * reaches the hash comparison.
 */
export async function checkRate(
  ip: string,
  scope: RateScope = "record",
): Promise<RateVerdict> {
  const since = new Date(Date.now() - WINDOW_MS);

  const rows = (await db().sql`
    SELECT COUNT(*) AS n
      FROM unlock_attempt
     WHERE ip = ${ip} AND scope = ${scope} AND attempted_at > ${since}
  `) as unknown as Array<{ n: string | number }>;

  const count = Number(rows[0]?.n ?? 0);
  if (count < MAX_ATTEMPTS[scope]) return { allowed: true, retryAfterSeconds: 0 };

  return { allowed: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) };
}

/**
 * Record a failed attempt, and opportunistically prune the window while we are
 * here — that keeps the table bounded without a scheduled job to forget about.
 *
 * Only failures are recorded. A listener who types their phrase correctly the
 * first time should never be a step closer to being locked out.
 */
export async function recordFailure(
  ip: string,
  slug: string,
  scope: RateScope = "record",
): Promise<void> {
  const cutoff = new Date(Date.now() - WINDOW_MS);

  await db().sql`
    INSERT INTO unlock_attempt (ip, slug, scope) VALUES (${ip}, ${slug}, ${scope})
  `;
  await db().sql`
    DELETE FROM unlock_attempt WHERE attempted_at < ${cutoff}
  `;
}

/** Clear an IP's failures after a success, so one good phrase resets the count. */
export async function clearFailures(
  ip: string,
  scope: RateScope = "record",
): Promise<void> {
  await db().sql`DELETE FROM unlock_attempt WHERE ip = ${ip} AND scope = ${scope}`;
}

/**
 * The client's address.
 *
 * Behind Netlify the socket address is always the edge, so the real client is
 * in x-nf-client-connection-ip (which Netlify sets and a client cannot forge)
 * or the leftmost x-forwarded-for entry. Falling back to a constant means that
 * if neither header arrives, everyone shares one bucket — the limit gets
 * stricter, never looser, which is the right way for this to fail.
 */
export function clientIp(headers: Headers): string {
  const netlify = headers.get("x-nf-client-connection-ip");
  if (netlify) return netlify;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
