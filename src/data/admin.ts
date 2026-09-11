import "server-only";

import { cookies } from "next/headers";

import { db } from "./db";
import {
  adminCookieName,
  hashPhrase,
  verifyAdminSession,
  verifyPhrase,
} from "./crypto";
import { normalizePhrase } from "./phrase";
import type { RecordSummary, SiteText } from "./types";

/* Everything the desk can do lives here, and every one of these functions is
   server-only. The routes above them check `requireAdmin` before calling in;
   these do not re-check, so nothing in this file may ever be imported by a
   client component. `server-only` makes that a build error rather than a
   convention. */

/**
 * The credential's version — its updatedAt as a millisecond stamp.
 *
 * Sessions are signed against it, so changing the password invalidates every
 * session issued before the change. Without this, a leaked cookie would keep
 * working after the owner had already reacted to the leak.
 */
export async function credentialVersion(): Promise<number | null> {
  const rows = (await db().sql`
    SELECT password_hash, updated_at FROM admin_credential WHERE id = 1 LIMIT 1
  `) as unknown as Array<{ password_hash: string; updated_at: string | Date }>;

  const row = rows[0];
  if (!row) return null;
  return new Date(row.updated_at).getTime();
}

/** Whether anyone has claimed the desk yet. */
export async function deskClaimed(): Promise<boolean> {
  return (await credentialVersion()) !== null;
}

/** True when this request carries a valid, unexpired desk session. */
export async function isAdmin(): Promise<boolean> {
  const version = await credentialVersion();
  if (version === null) return false;

  const jar = await cookies();
  return verifyAdminSession(jar.get(adminCookieName())?.value, version);
}

/** Verify a password against the stored credential. */
export async function checkAdminPassword(password: string): Promise<boolean> {
  const rows = (await db().sql`
    SELECT password_hash FROM admin_credential WHERE id = 1 LIMIT 1
  `) as unknown as Array<{ password_hash: string }>;

  const row = rows[0];
  if (!row) return false;
  return verifyPhrase(password, row.password_hash);
}

/**
 * Claim the desk, or change its password.
 *
 * Passwords are hashed with the same scrypt routine as access phrases but are
 * NOT normalized — lowercasing a password would throw away entropy the owner
 * chose deliberately. Only phrases get that treatment, because a listener is
 * reading one off a message and should not be punished for a capital letter.
 */
export async function setAdminPassword(password: string): Promise<void> {
  const hash = await hashPhrase(password);
  await db().sql`
    INSERT INTO admin_credential (id, password_hash, updated_at)
         VALUES (1, ${hash}, NOW())
    ON CONFLICT (id) DO UPDATE SET password_hash = ${hash}, updated_at = NOW()
  `;
}

// ── the catalog, as the desk sees it ────────────────────────────────────────

export type AdminRecord = RecordSummary & {
  id: string;
  intro: string;
  hasPhrase: boolean;
  position: number;
};

/**
 * Every record, drafts and unlisted included.
 *
 * `hasPhrase` rather than the phrase itself: the desk needs to show whether a
 * record is openable, not what opens it. The hash never leaves the database and
 * the plaintext was never in it, so a phrase genuinely cannot be recovered —
 * only replaced. That is the correct trade for a field the owner sets by hand.
 */
export async function listAllRecords(): Promise<AdminRecord[]> {
  const rows = (await db().sql`
    SELECT r.id, r.slug, r.artist_name, r.album_title, r.year, r.intro,
           r.published, r.listed, r.position,
           (r.phrase_hash IS NOT NULL) AS has_phrase,
           COUNT(t.id) FILTER (WHERE NOT t.hidden) AS track_count,
           COALESCE(SUM(t.seconds) FILTER (WHERE NOT t.hidden), 0) AS total_seconds
      FROM record r
      LEFT JOIN track t ON t.record_id = r.id
     GROUP BY r.id
     ORDER BY r.position, r.id
  `) as unknown as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    artistName: String(row.artist_name),
    albumTitle: String(row.album_title),
    year: Number(row.year),
    intro: String(row.intro ?? ""),
    published: Boolean(row.published),
    listed: Boolean(row.listed),
    hasPhrase: Boolean(row.has_phrase),
    position: Number(row.position),
    trackCount: Number(row.track_count),
    totalSeconds: Number(row.total_seconds ?? 0),
  }));
}

export type AdminTrack = {
  id: string;
  title: string;
  seconds: number;
  hidden: boolean;
  position: number;
  formats: string[];
};

export async function getAdminRecord(
  id: string,
): Promise<(AdminRecord & { tracks: AdminTrack[] }) | null> {
  const all = await listAllRecords();
  const record = all.find((r) => r.id === id);
  if (!record) return null;

  const rows = (await db().sql`
    SELECT t.id, t.title, t.seconds, t.hidden, t.position,
           COALESCE(
             (SELECT string_agg(a.format, ',' ORDER BY a.format)
                FROM track_asset a WHERE a.track_id = t.id),
             ''
           ) AS formats
      FROM track t
     WHERE t.record_id = ${id}
     ORDER BY t.position, t.id
  `) as unknown as Array<Record<string, unknown>>;

  return {
    ...record,
    tracks: rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      seconds: Number(row.seconds),
      hidden: Boolean(row.hidden),
      position: Number(row.position),
      formats: String(row.formats ?? "")
        .split(",")
        .filter(Boolean),
    })),
  };
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** A slug the URL and the cookie Path can both live with. */
export function toSlug(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `record-${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a draft. Drafts are invisible everywhere until published. */
export async function createRecord(): Promise<string> {
  const id = newId("rec");
  const year = new Date().getFullYear();

  const rows = (await db().sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next FROM record
  `) as unknown as Array<{ next: number }>;

  // Unique from the start, because slug is the primary key of the URL space and
  // two "untitled-record" drafts would collide on the very first save.
  const slug = `untitled-${Math.random().toString(36).slice(2, 8)}`;

  await db().sql`
    INSERT INTO record (id, slug, artist_name, album_title, year, intro,
                        published, listed, position)
         VALUES (${id}, ${slug}, 'New artist', 'Untitled record', ${year}, '',
                 FALSE, TRUE, ${Number(rows[0]?.next ?? 0)})
  `;
  return id;
}

export type RecordPatch = {
  artistName?: string;
  albumTitle?: string;
  year?: number;
  intro?: string;
  published?: boolean;
  listed?: boolean;
  slug?: string;
};

export async function patchRecord(id: string, patch: RecordPatch): Promise<void> {
  if (patch.artistName !== undefined) {
    await db().sql`UPDATE record SET artist_name = ${patch.artistName} WHERE id = ${id}`;
  }
  if (patch.albumTitle !== undefined) {
    await db().sql`UPDATE record SET album_title = ${patch.albumTitle} WHERE id = ${id}`;
  }
  if (patch.year !== undefined) {
    await db().sql`UPDATE record SET year = ${patch.year} WHERE id = ${id}`;
  }
  if (patch.intro !== undefined) {
    await db().sql`UPDATE record SET intro = ${patch.intro} WHERE id = ${id}`;
  }
  if (patch.published !== undefined) {
    await db().sql`UPDATE record SET published = ${patch.published} WHERE id = ${id}`;
  }
  if (patch.listed !== undefined) {
    await db().sql`UPDATE record SET listed = ${patch.listed} WHERE id = ${id}`;
  }
  if (patch.slug !== undefined) {
    await db().sql`UPDATE record SET slug = ${patch.slug} WHERE id = ${id}`;
  }
}

/**
 * Set or clear a record's access phrase.
 *
 * An empty phrase clears it to NULL, which keeps everyone out rather than
 * letting everyone in — the design says so in as many words, and verifyPhrase
 * refuses a null hash for exactly this reason.
 */
export async function setRecordPhrase(id: string, phrase: string): Promise<void> {
  const normalized = normalizePhrase(phrase);
  if (!normalized) {
    await db().sql`UPDATE record SET phrase_hash = NULL WHERE id = ${id}`;
    return;
  }
  const hash = await hashPhrase(normalized);
  await db().sql`UPDATE record SET phrase_hash = ${hash} WHERE id = ${id}`;
}

export async function deleteRecord(id: string): Promise<void> {
  // Tracks and their assets cascade; the blobs themselves are swept separately
  // so that a delete is never waiting on object storage to answer.
  await db().sql`DELETE FROM record WHERE id = ${id}`;
}

/**
 * Move a record or track one place up or down.
 *
 * Swaps the two positions in a transaction. Doing it as two bare updates would
 * leave both rows briefly holding the same position, and a concurrent read
 * would see a list with a duplicate and a gap.
 */
export async function moveRecord(id: string, direction: -1 | 1): Promise<void> {
  const client = await db().pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: mine } = await client.query(
      "SELECT position FROM record WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (mine.length === 0) {
      await client.query("ROLLBACK");
      return;
    }
    const position = Number(mine[0].position);

    const { rows: neighbour } = await client.query(
      direction < 0
        ? "SELECT id, position FROM record WHERE position < $1 ORDER BY position DESC LIMIT 1 FOR UPDATE"
        : "SELECT id, position FROM record WHERE position > $1 ORDER BY position ASC LIMIT 1 FOR UPDATE",
      [position],
    );
    if (neighbour.length === 0) {
      await client.query("ROLLBACK");
      return;
    }

    await client.query("UPDATE record SET position = $1 WHERE id = $2", [
      Number(neighbour[0].position),
      id,
    ]);
    await client.query("UPDATE record SET position = $1 WHERE id = $2", [
      position,
      neighbour[0].id,
    ]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function moveTrack(
  recordId: string,
  trackId: string,
  direction: -1 | 1,
): Promise<void> {
  const client = await db().pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: mine } = await client.query(
      "SELECT position FROM track WHERE id = $1 AND record_id = $2 FOR UPDATE",
      [trackId, recordId],
    );
    if (mine.length === 0) {
      await client.query("ROLLBACK");
      return;
    }
    const position = Number(mine[0].position);

    const { rows: neighbour } = await client.query(
      direction < 0
        ? "SELECT id, position FROM track WHERE record_id = $1 AND position < $2 ORDER BY position DESC LIMIT 1 FOR UPDATE"
        : "SELECT id, position FROM track WHERE record_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1 FOR UPDATE",
      [recordId, position],
    );
    if (neighbour.length === 0) {
      await client.query("ROLLBACK");
      return;
    }

    await client.query("UPDATE track SET position = $1 WHERE id = $2", [
      Number(neighbour[0].position),
      trackId,
    ]);
    await client.query("UPDATE track SET position = $1 WHERE id = $2", [
      position,
      neighbour[0].id,
    ]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function createTrack(recordId: string): Promise<string> {
  const id = newId("trk");
  const rows = (await db().sql`
    SELECT COALESCE(MAX(position), -1) + 1 AS next FROM track WHERE record_id = ${recordId}
  `) as unknown as Array<{ next: number }>;

  await db().sql`
    INSERT INTO track (id, record_id, title, seconds, hidden, position)
         VALUES (${id}, ${recordId}, 'Untitled', 0, FALSE, ${Number(rows[0]?.next ?? 0)})
  `;
  return id;
}

export async function patchTrack(
  recordId: string,
  trackId: string,
  patch: { title?: string; seconds?: number; hidden?: boolean },
): Promise<void> {
  if (patch.title !== undefined) {
    await db().sql`
      UPDATE track SET title = ${patch.title} WHERE id = ${trackId} AND record_id = ${recordId}
    `;
  }
  if (patch.seconds !== undefined) {
    await db().sql`
      UPDATE track SET seconds = ${patch.seconds} WHERE id = ${trackId} AND record_id = ${recordId}
    `;
  }
  if (patch.hidden !== undefined) {
    await db().sql`
      UPDATE track SET hidden = ${patch.hidden} WHERE id = ${trackId} AND record_id = ${recordId}
    `;
  }
}

export async function deleteTrack(recordId: string, trackId: string): Promise<void> {
  await db().sql`DELETE FROM track WHERE id = ${trackId} AND record_id = ${recordId}`;
}

export async function updateSiteText(text: SiteText): Promise<void> {
  await db().sql`
    INSERT INTO site_text (id, eyebrow, title, intro, footer)
         VALUES (1, ${text.eyebrow}, ${text.title}, ${text.intro}, ${text.footer})
    ON CONFLICT (id) DO UPDATE
       SET eyebrow = ${text.eyebrow}, title = ${text.title},
           intro = ${text.intro}, footer = ${text.footer}
  `;
}
