"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

import styles from "./offline.module.css";

/**
 * "Keep it on your device" — the button and the panel it opens.
 *
 * The button explains rather than downloads. That is the design's division and
 * it is the right one: what puts a track on the device is the bookmark on its
 * row, one deliberate tap per track, and what this panel is for is the half of
 * offline a web page cannot do for you — getting the site off the browser and
 * onto the home screen, where it opens without an address bar and a kept album
 * plays with the radio off.
 */
export function KeepToggle({
  open,
  onToggle,
  className = "",
}: {
  open: boolean;
  onToggle: () => void;
  /** Set by whatever row it sits in. The button owns its look, not its place. */
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.keepToggle} ${className}`}
      aria-expanded={open}
      aria-controls="offline-panel"
      onClick={onToggle}
    >
      Keep it on your device
    </button>
  );
}

export function OfflinePanel({ count, total }: { count: number; total: number }) {
  return (
    <div id="offline-panel" className={styles.panel}>
      <div className={styles.panelEyebrow}>Listening offline</div>
      <p className={styles.panelBody}>
        Open the share menu and choose <em>Add to home screen</em>. It opens like
        an app after that, and every track you&rsquo;ve kept plays without a
        signal.
      </p>
      {/* Both halves bend. The noun follows the total and the verb follows the
          count, so a record of one and a device holding one both read as
          English: "1 of 12 tracks is", "1 of 1 track is", "3 of 12 tracks are".
          The old line said "1 of 12 tracks are", which reads as a template
          rather than as something anybody wrote. */}
      <div className={styles.panelCount}>
        {count === 0
          ? "Nothing kept yet. Plenty of time."
          : `${count} of ${total} ${total === 1 ? "track" : "tracks"} ` +
            `${count === 1 ? "is" : "are"} on this device.`}
      </div>
    </div>
  );
}

/**
 * The per-track bookmark.
 *
 * Brass when the track is here, muted when it is not — the design's only
 * two-state icon, and the one place brass carries meaning rather than
 * decoration. It never glows: the amber play button is the single lit element
 * on the screen and nothing joins it.
 */
export function BookmarkButton({
  title,
  kept,
  busy,
  onToggle,
}: {
  title: string;
  kept: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const label = kept ? "Kept on this device" : `Keep ${title} on this device`;

  return (
    <button
      type="button"
      className={`${styles.bookmark} ${kept ? styles.bookmarkKept : ""}`}
      aria-label={label}
      aria-pressed={kept}
      title={label}
      disabled={busy}
      onClick={onToggle}
    >
      {kept ? (
        <BookmarkCheck size={18} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Bookmark size={18} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
