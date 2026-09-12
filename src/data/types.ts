/** A track. `seconds` is authored, not derived — the owner can type `3:52` or
 *  `232` and both land here as a number. Uploaded files probe their own
 *  duration and fill the field in. */
export type Track = {
  id: string;
  title: string;
  seconds: number;
  hidden: boolean;
  position: number;
};

/**
 * What the catalog is allowed to know about a record. No phrase, no tracks, no
 * file keys — this shape is safe to send to anyone.
 *
 * `published` is the draft flag: false means unreachable even with the phrase.
 * `listed` is the unlisted flag: false means direct link only, hidden from the
 * catalog. Both must be true for a record to appear publicly.
 */
export type RecordSummary = {
  slug: string;
  artistName: string;
  albumTitle: string;
  year: number;
  trackCount: number;
  totalSeconds: number;
  published: boolean;
  listed: boolean;
  coverUrl?: string;
};

/**
 * The full record, with its tracks. This shape is only ever built after a
 * phrase check has succeeded — a locked record must never reach the client in
 * this form, not even with the tracks stripped out.
 */
export type RecordDetail = RecordSummary & {
  intro: string;
  tracks: Track[];
};

export type SiteText = {
  eyebrow: string;
  title: string;
  intro: string;
  /** The tail of the catalog footer. The count in front of it is live. */
  footer: string;
};

/** What the catalog row's chip says. Draft and Unlisted are admin-only. */
export type RecordState = "Open" | "Locked" | "Draft" | "Unlisted";

/**
 * The two encodings a listener is ever given. The WAV master is not one of
 * them: it is archival, and streaming it would cost 1.7x the bytes of the FLAC
 * for audio that decodes identically.
 */
export type ListenFormat = "flac" | "mp3";

/**
 * What each track's encodings weigh, in bytes, keyed by track id.
 *
 * Read from storage rather than estimated from duration. How well a track
 * compresses to FLAC depends on the music — a quiet record can come in at half
 * what a loud one does — and "Keep it on your device" has to quote a number
 * the device will really have to find room for.
 */
export type TrackAssetSizes = Record<string, Partial<Record<ListenFormat, number>>>;
