"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { forgetRecord } from "@/offline/kept";
import album from "./album.module.css";

/**
 * Closes this one record on this device and goes back to the catalog. Only
 * this record — the phrase for another one is untouched.
 *
 * Two things have to happen, not one. The cookie goes, which is what stops the
 * server sending this record's tracks again; and whatever the device is holding
 * of it goes too — the kept audio, which the worker would otherwise keep
 * playing with no cookie left to check, and the last-seen album page, which it
 * would otherwise keep serving offline.
 *
 * Order matters and so does failure. The cookie is the lock; the cache is what
 * the lock would otherwise leave behind. If the first cannot be dropped —
 * offline, most likely, which is exactly when somebody hands their phone to
 * someone else — then nothing has been closed, and the button has to say so
 * rather than greying for a moment and leaving the record open. Clearing the
 * device first and then failing to drop the cookie would be the worst of both:
 * the music gone, the record still open.
 */
export function LockItBack({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [nudge, setNudge] = useState("");

  async function lock() {
    if (busy) return;
    setBusy(true);
    setNudge("");

    try {
      const res = await fetch(`/api/records/${slug}/lock`, { method: "POST" });
      if (!res.ok) {
        setNudge("I couldn't close it. Try again in a moment.");
        setBusy(false);
        return;
      }
    } catch {
      setNudge("I couldn't reach the server, so it's still open here.");
      setBusy(false);
      return;
    }

    await forgetRecord(slug);
    /* `busy` stays true from here. The record is closed and the catalog is on
       its way; re-enabling the button first would offer a second press of a
       thing that has already happened. */
    router.push("/");
    router.refresh();
  }

  return (
    <div className={album.lockBackSlot}>
      <button
        type="button"
        className={album.lockBack}
        disabled={busy}
        onClick={() => void lock()}
      >
        Lock it back
      </button>
      {nudge && (
        <div className={album.lockBackNudge} role="alert">
          {nudge}
        </div>
      )}
    </div>
  );
}
