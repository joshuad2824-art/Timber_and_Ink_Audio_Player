"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

import { prepareCover } from "./image";
import styles from "./cover.module.css";

/**
 * The cover art mount, which is also the control that fills it.
 *
 * A <label> wrapping a file input rather than a button that clicks one, because
 * that is what makes the whole 200px square a tap target on a phone — and on a
 * phone the picker a bare `accept="image/*"` opens is the one the owner wants:
 * Photo Library, Take Photo, Choose File. No permission prompt, no plugin, no
 * asking the browser for the camera. Dropping a file still works on a desktop,
 * where a drop is the natural gesture and a tap is not.
 *
 * What is shown is the stored image cropped exactly as the album screen crops
 * it — square, centred — so the owner is looking at the sleeve a listener will
 * see rather than at their original framing.
 */
export function CoverPicker({
  recordId,
  coverUrl,
  onChange,
  say,
}: {
  recordId: string;
  coverUrl?: string;
  /** Called after the server has it, so the editor can re-read the record. */
  onChange: () => Promise<void> | void;
  say: (line: string) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function accept(file: File | undefined) {
    if (!file || busy) return;

    if (!file.type.startsWith("image/")) {
      say("That isn't an image. A JPEG, a PNG or a WebP.");
      return;
    }

    setBusy(true);
    try {
      // Scaled and re-encoded here, so what goes up is a few hundred kilobytes
      // rather than the twelve megabytes a phone camera writes.
      const prepared = await prepareCover(file);

      const res = await fetch(`/api/admin/records/${recordId}/cover`, {
        method: "PUT",
        headers: { "content-type": prepared.mime },
        body: prepared.bytes as unknown as BodyInit,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        say(
          typeof body?.error === "string"
            ? body.error
            : "Something went wrong on my end, not with the picture.",
        );
        return;
      }

      await onChange();
      say("That's the cover now.");
    } catch (err) {
      say(err instanceof Error ? err.message : "I couldn't read that image.");
    } finally {
      setBusy(false);
      // Cleared so picking the same file twice still fires a change.
      if (input.current) input.current.value = "";
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/records/${recordId}/cover`, { method: "DELETE" });
      await onChange();
      say("Cover off. The mount is empty again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.column}>
      <label
        className={[styles.mount, over ? styles.mountOver : "", busy ? styles.mountBusy : ""]
          .filter(Boolean)
          .join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void accept(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={input}
          type="file"
          className={styles.input}
          accept="image/*"
          disabled={busy}
          onChange={(e) => void accept(e.target.files?.[0])}
        />

        {coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className={styles.preview} src={coverUrl} alt="The cover as it stands" />
        ) : (
          <span className={styles.empty}>
            <ImagePlus size={22} strokeWidth={1.5} aria-hidden="true" />
            <span className={styles.label}>Cover art</span>
            <span className={styles.hint}>Tap to choose a photo or a file</span>
          </span>
        )}

        {/* Sits over the image once there is one, so the mount keeps saying
            what it is for without the picture having to move out of the way. */}
        {coverUrl && <span className={styles.replace}>{busy ? "Working" : "Replace it"}</span>}
      </label>

      {coverUrl && (
        <button type="button" className={styles.remove} disabled={busy} onClick={() => void remove()}>
          Take the cover off
        </button>
      )}
    </div>
  );
}
