/**
 * Phrase normalization, shared by the gate and the desk.
 *
 * The same function has to run on both sides of the exchange: what the owner
 * types into the desk is what the listener has to be able to type at the gate.
 * If these ever diverge, a record quietly becomes unopenable.
 *
 * Trim, lowercase, collapse internal whitespace. Nothing else — no stripping
 * punctuation, no unicode folding. The phrases are short English pairs and the
 * listener is reading one off a message.
 */
export function normalizePhrase(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/** What the gate says back. The copy is final; match it verbatim. */
export const PHRASE_EMPTY = "I'll need the phrase first.";
export const PHRASE_WRONG = "That isn't it — try the phrase I sent you.";
export const KEY_WRONG = "That isn't the key.";

/** How long a toast sits in its slot before it goes. */
export const TOAST_MS = 4200;

/** Seconds to `m:ss`. */
export function formatDuration(seconds: number): string {
  const v = Math.max(0, Math.floor(seconds));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
}

/**
 * Accepts either `m:ss` or a raw second count, because the owner types
 * whichever is at hand. Returns null if it is neither.
 */
export function parseDuration(text: string): number | null {
  const trimmed = String(text).trim();
  const clock = trimmed.match(/^(\d+):([0-5]?\d)$/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const raw = Number(trimmed);
  return Number.isNaN(raw) ? null : Math.round(raw);
}

/** `2026 · 10 tracks · 42 min` — the meta line under an album title. */
export function recordMeta(
  year: number,
  trackCount: number,
  totalSeconds: number,
): string {
  const minutes = Math.round(totalSeconds / 60);
  const tracks = `${trackCount} ${trackCount === 1 ? "track" : "tracks"}`;
  return `${year} · ${tracks} · ${minutes} min`;
}
