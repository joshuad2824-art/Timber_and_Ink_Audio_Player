import type { RecordSummary, SiteText } from "./types";

/**
 * TEMPORARY — milestone 1 only.
 *
 * The shell needs something to lay out against before there is a database.
 * These are the prototype's three records with their track counts and running
 * times, and nothing else: no phrases, no track titles, no file keys. When
 * milestone 2 lands, this file is deleted and the catalog comes from
 * `/api/catalog` instead.
 *
 * Deliberately no phrase field anywhere in here. The prototype kept phrases in
 * the browser; that is the one thing we are not carrying forward, and the way
 * to not carry it forward is to never let it into the client bundle in the
 * first place.
 */
export const SEED_CATALOG: RecordSummary[] = [
  {
    slug: "shadow-harbor",
    artistName: "Shadow Harbor",
    albumTitle: "Everything I didn't say",
    year: 2026,
    trackCount: 10,
    totalSeconds: 2526,
    published: true,
    listed: true,
  },
  {
    slug: "pale-ledger",
    artistName: "Pale Ledger",
    albumTitle: "Slow county",
    year: 2025,
    trackCount: 7,
    totalSeconds: 1668,
    published: true,
    listed: true,
  },
  {
    slug: "north-pasture",
    artistName: "North Pasture",
    albumTitle: "Winter light, held",
    year: 2024,
    trackCount: 8,
    totalSeconds: 1924,
    published: true,
    listed: true,
  },
];

export const SEED_SITE_TEXT: SiteText = {
  eyebrow: "A small catalog",
  title: "Recordings",
  intro:
    "Every record here sits behind its own phrase. If I sent you one, it opens that artist and nothing else — no account, nothing to remember.",
  footer: "more when they're ready",
};
