import "server-only";

import { cookies } from "next/headers";

import { db } from "./db";
import { isAdmin } from "./admin";
import { unlockCookieName, verifyUnlock } from "./crypto";
import type { AudioFormat } from "./storage";
import type { RecordDetail, RecordSummary, SiteText, Track } from "./types";

/* Every query in this file is shaped by one rule from the brief: a locked
   record's tracks and file keys must never reach the client. The enforcement
   is structural rather than remembered — the only function that returns tracks
   checks the cookie itself, so there is no way to call it unauthorized and no
   caller who can forget to.

   phrase_hash is never selected by anything here. It leaves the database only
   inside verifyPhrase, on the unlock path. */

type RecordRow = {
  slug: string;
  artist_name: string;
  album_title: string;
  year: number;
  intro: string;
  published: boolean;
  listed: boolean;
  cover_key: string | null;
  track_count: string | number;
  total_seconds: string | number | null;
};

function toSummary(row: RecordRow): RecordSummary {
  return {
    slug: row.slug,
    artistName: row.artist_name,
    albumTitle: row.album_title,
    year: row.year,
    trackCount: Number(row.track_count),
    totalSeconds: Number(row.total_seconds ?? 0),
    published: row.published,
    listed: row.listed,
    coverUrl: undefined,
  };
}

/**
 * The catalog. Published and listed only, with counts rolled up so the meta
 * line reads from live data.
 *
 * Hidden tracks are excluded from the count and the running time, because the
 * listener is being told what they would get, not what exists.
 */
export async function listCatalog(): Promise<RecordSummary[]> {
  // Signed in, the catalog shows everything — drafts and unlisted included —
  // so the owner sees their whole shelf rather than only the public half.
  const admin = await isAdmin();

  const rows = (await db().sql`
    SELECT r.slug, r.artist_name, r.album_title, r.year, r.intro,
           r.published, r.listed, r.cover_key,
           COUNT(t.id) FILTER (WHERE NOT t.hidden) AS track_count,
           COALESCE(SUM(t.seconds) FILTER (WHERE NOT t.hidden), 0) AS total_seconds
      FROM record r
      LEFT JOIN track t ON t.record_id = r.id
     WHERE (r.published AND r.listed) OR ${admin}
     GROUP BY r.id
     ORDER BY r.position, r.id
  `) as unknown as RecordRow[];

  return rows.map(toSummary);
}

/**
 * What the gate is allowed to know before a phrase is checked: enough to name
 * the record and say what the phrase opens. No tracks, no intro body, no keys.
 *
 * Drafts are invisible here. A draft is unreachable even with the correct
 * phrase, and returning null means the route 404s — so a 404 cannot be used to
 * work out that a draft exists.
 */
export async function getGateRecord(
  slug: string,
): Promise<Pick<RecordSummary, "slug" | "artistName" | "albumTitle" | "year"> | null> {
  const admin = await isAdmin();
  const rows = (await db().sql`
    SELECT slug, artist_name, album_title, year
      FROM record
     WHERE slug = ${slug} AND (published OR ${admin})
     LIMIT 1
  `) as unknown as RecordRow[];

  const row = rows[0];
  if (!row) return null;

  return {
    slug: row.slug,
    artistName: row.artist_name,
    albumTitle: row.album_title,
    year: row.year,
  };
}

/** True when this device holds a valid, unexpired cookie for this record. */
export async function isUnlocked(slug: string): Promise<boolean> {
  const jar = await cookies();
  return verifyUnlock(jar.get(unlockCookieName(slug))?.value, slug);
}

/**
 * Whether this request may read a record's contents.
 *
 * The owner is let through without a phrase — they set the phrases, and having
 * to type one to check their own work would be theatre. The bypass is written
 * once, here, rather than as an extra condition sprinkled through the queries,
 * so there is a single line to read when asking who can open what.
 */
async function canRead(slug: string): Promise<boolean> {
  if (await isUnlocked(slug)) return true;
  return isAdmin();
}

/**
 * The full record, tracks included — and the only function here that returns
 * them.
 *
 * It verifies the unlock cookie itself rather than trusting a caller to have
 * done it. Returns null for a locked record, a draft, or one that does not
 * exist, so every unauthorized case looks the same from outside.
 */
export async function getUnlockedRecord(slug: string): Promise<RecordDetail | null> {
  if (!(await canRead(slug))) return null;

  // The owner can look at a draft; nobody else can reach one at all.
  const admin = await isAdmin();

  const rows = (await db().sql`
    SELECT r.slug, r.artist_name, r.album_title, r.year, r.intro,
           r.published, r.listed, r.cover_key,
           COUNT(t.id) FILTER (WHERE NOT t.hidden) AS track_count,
           COALESCE(SUM(t.seconds) FILTER (WHERE NOT t.hidden), 0) AS total_seconds
      FROM record r
      LEFT JOIN track t ON t.record_id = r.id
     WHERE r.slug = ${slug} AND (r.published OR ${admin})
     GROUP BY r.id
     LIMIT 1
  `) as unknown as RecordRow[];

  const row = rows[0];
  if (!row) return null;

  /* audio_key is deliberately not selected. The player asks for a URL per
     track when it needs one (milestone 3); the storage key itself has no
     business in a page payload. */
  const trackRows = (await db().sql`
    SELECT t.id, t.title, t.seconds, t.hidden, t.position
      FROM track t
      JOIN record r ON r.id = t.record_id
     WHERE r.slug = ${slug} AND NOT t.hidden
     ORDER BY t.position, t.id
  `) as unknown as Array<{
    id: string;
    title: string;
    seconds: number;
    hidden: boolean;
    position: number;
  }>;

  const tracks: Track[] = trackRows.map((t) => ({
    id: t.id,
    title: t.title,
    seconds: Number(t.seconds),
    hidden: t.hidden,
    position: t.position,
  }));

  return { ...toSummary(row), intro: row.intro, tracks };
}

/** The phrase hash for a record, for the unlock route alone. */
export async function getPhraseHash(
  slug: string,
): Promise<{ found: boolean; hash: string | null }> {
  const rows = (await db().sql`
    SELECT phrase_hash FROM record
     WHERE slug = ${slug} AND published
     LIMIT 1
  `) as unknown as Array<{ phrase_hash: string | null }>;

  if (rows.length === 0) return { found: false, hash: null };
  return { found: true, hash: rows[0].phrase_hash };
}

export async function getSiteText(): Promise<SiteText> {
  const rows = (await db().sql`
    SELECT eyebrow, title, intro, footer FROM site_text WHERE id = 1 LIMIT 1
  `) as unknown as SiteText[];

  return (
    rows[0] ?? {
      eyebrow: "A small catalog",
      title: "Recordings",
      intro: "",
      footer: "more when they're ready",
    }
  );
}

/**
 * Resolve one track's stored encoding, for the audio route.
 *
 * Verifies the unlock cookie itself, exactly as getUnlockedRecord does, and
 * confirms the track actually belongs to the record in the URL — otherwise a
 * cookie for a record you were invited to would serve any track id on the site.
 * Hidden tracks are unreachable too.
 */
export async function getTrackAsset(
  slug: string,
  trackId: string,
  format: AudioFormat,
): Promise<{ blobKey: string; bytes: number; mimeType: string } | null> {
  if (!(await canRead(slug))) return null;

  const rows = (await db().sql`
    SELECT a.blob_key, a.bytes, a.mime_type
      FROM track_asset a
      JOIN track t  ON t.id = a.track_id
      JOIN record r ON r.id = t.record_id
     WHERE r.slug = ${slug}
       AND r.published
       AND t.id = ${trackId}
       AND NOT t.hidden
       AND a.format = ${format}
     LIMIT 1
  `) as unknown as Array<{ blob_key: string; bytes: string | number; mime_type: string }>;

  const row = rows[0];
  if (!row) return null;

  return {
    blobKey: row.blob_key,
    bytes: Number(row.bytes),
    mimeType: row.mime_type,
  };
}

/** Which encodings exist for each track of an unlocked record. */
export async function getAvailableFormats(
  slug: string,
): Promise<Record<string, AudioFormat[]>> {
  if (!(await canRead(slug))) return {};

  const rows = (await db().sql`
    SELECT a.track_id, a.format
      FROM track_asset a
      JOIN track t  ON t.id = a.track_id
      JOIN record r ON r.id = t.record_id
     WHERE r.slug = ${slug} AND r.published AND NOT t.hidden
  `) as unknown as Array<{ track_id: string; format: AudioFormat }>;

  const out: Record<string, AudioFormat[]> = {};
  for (const row of rows) {
    (out[row.track_id] ??= []).push(row.format);
  }
  return out;
}
