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
 */
export function LockItBack({ slug }: { slug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={album.lockBack}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch(`/api/records/${slug}/lock`, { method: "POST" });
          await forgetRecord(slug);
          router.push("/");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      Lock it back
    </button>
  );
}
