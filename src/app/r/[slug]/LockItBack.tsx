"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import album from "./album.module.css";

/**
 * Closes this one record on this device and goes back to the catalog. Only
 * this record — the phrase for another one is untouched.
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
