import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

/* scrypt cost. Access phrases are short and low-entropy by design — the owner
   sends them in a message and the listener types them once — so the work
   factor is doing real defensive work here, not just ceremony. ~100ms per
   attempt, which the gate can afford and a script cannot. */
const KEYLEN = 32;
const SALT_BYTES = 16;

/**
 * The signing secret for unlock cookies.
 *
 * Fails closed: with no secret configured in production this throws rather
 * than falling back to something guessable, because a predictable secret means
 * anyone can mint a cookie for any record and the gate becomes decoration.
 * The throw surfaces as a 500 on the unlock route, which is the correct
 * outcome — a broken gate is better than an open one.
 */
function secret(): Buffer {
  const configured = process.env.SHADOW_HARBOR_SECRET;
  if (configured && configured.length >= 32) return Buffer.from(configured, "utf8");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SHADOW_HARBOR_SECRET is missing or too short (needs 32+ chars). " +
        "Unlock cookies cannot be signed safely without it.",
    );
  }

  // Development only, and never reachable in production by the check above.
  return Buffer.from("shadow-harbor-development-secret-not-for-production", "utf8");
}

/**
 * Whether a usable signing secret is configured, without throwing.
 *
 * Routes that are going to mint a cookie check this first. Otherwise the
 * failure surfaces halfway through the work: the claim route wrote a password
 * and then threw on the way to signing a session, leaving a site claimed by a
 * credential nobody could use — which is exactly what happened in production
 * the first time this was deployed without the secret set.
 */
export function secretReady(): boolean {
  try {
    secret();
    return true;
  } catch {
    return false;
  }
}

/** Hash a phrase for storage. Salt is per-phrase and stored alongside. */
export async function hashPhrase(normalized: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(normalized, salt, KEYLEN);
  return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

/**
 * Verify a phrase against a stored hash.
 *
 * A null hash — a record with no phrase set — always fails. The desk allows an
 * empty phrase and the design says so explicitly ("Leaving it empty keeps
 * everyone out"), so this must never be the case that lets someone in.
 */
export async function verifyPhrase(
  normalized: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "base64");
    expected = Buffer.from(parts[2], "base64");
  } catch {
    return false;
  }
  if (expected.length !== KEYLEN) return false;

  const derived = await scrypt(normalized, salt, KEYLEN);
  return timingSafeEqual(derived, expected);
}

/**
 * Mint the value of a per-record unlock cookie.
 *
 * The cookie names the record it opens and carries an expiry, both covered by
 * the signature — so a listener cannot edit one cookie into a key for a
 * different record, or extend their own access.
 */
export function signUnlock(slug: string, expiresAt: number): string {
  const payload = `${slug}.${expiresAt}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

/**
 * Check an unlock cookie against the record it claims to open.
 *
 * Returns false on any mismatch: wrong record, expired, tampered, malformed.
 * The slug is compared too, so a valid cookie for one record proves nothing
 * about another.
 */
export function verifyUnlock(token: string | undefined, slug: string): boolean {
  if (!token) return false;

  const cut = token.lastIndexOf(".");
  if (cut <= 0) return false;

  const payload = token.slice(0, cut);
  const mac = token.slice(cut + 1);

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const given = Buffer.from(mac, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (given.length !== want.length) return false;
  if (!timingSafeEqual(given, want)) return false;

  // Only trust the payload's contents once the signature has checked out.
  const dot = payload.lastIndexOf(".");
  if (dot <= 0) return false;
  const signedSlug = payload.slice(0, dot);
  const expiresAt = Number(payload.slice(dot + 1));

  if (signedSlug !== slug) return false;
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

/** The cookie name for one record. Scoped per record, never one shared key. */
export function unlockCookieName(slug: string): string {
  return `sh_unlock_${slug.replace(/[^a-z0-9-]/gi, "")}`;
}

/* ── the desk ──────────────────────────────────────────────────────────────
   The admin session is the same construction as an unlock cookie, with one
   difference that matters: it carries the credential's updatedAt. Changing the
   password therefore invalidates every session signed before the change, so
   "change my password" actually means "sign everyone else out" rather than
   leaving an old cookie quietly working. */

const ADMIN_COOKIE = "sh_desk";

export function adminCookieName(): string {
  return ADMIN_COOKIE;
}

export function signAdminSession(expiresAt: number, credentialVersion: number): string {
  const payload = `desk.${credentialVersion}.${expiresAt}`;
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifyAdminSession(
  token: string | undefined,
  credentialVersion: number,
): boolean {
  if (!token) return false;

  const cut = token.lastIndexOf(".");
  if (cut <= 0) return false;

  const payload = token.slice(0, cut);
  const mac = token.slice(cut + 1);

  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const given = Buffer.from(mac, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (given.length !== want.length) return false;
  if (!timingSafeEqual(given, want)) return false;

  const parts = payload.split(".");
  if (parts.length !== 3 || parts[0] !== "desk") return false;

  const version = Number(parts[1]);
  const expiresAt = Number(parts[2]);
  if (!Number.isFinite(version) || !Number.isFinite(expiresAt)) return false;
  if (version !== credentialVersion) return false;
  if (Date.now() > expiresAt) return false;

  return true;
}
