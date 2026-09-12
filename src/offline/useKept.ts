"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ListenFormat, TrackAssetSizes } from "@/data/types";
import {
  dropTrack,
  keepTrack,
  offlineSupported,
  planFormat,
  readKept,
  type KeptMap,
} from "./kept";

/**
 * The offline state of one record, as the device actually has it.
 *
 * Re-read from the cache after every change rather than tracked alongside it.
 * The browser can evict a cache between one tap and the next, and a bookmark
 * that disagrees with the device is worse than no bookmark at all — it promises
 * music for a journey where there will be no way to get it.
 */
export function useKept(slug: string, trackIds: string[], sizes: TrackAssetSizes) {
  const [supported, setSupported] = useState(false);
  const [kept, setKept] = useState<KeptMap>({});
  const [busy, setBusy] = useState<string | null>(null);

  /* Chosen once for the record, then held. Deciding per track would let an
     album end up half lossless and half not, which is the one outcome nobody
     would have chosen on purpose. */
  const preferred = useRef<ListenFormat>("flac");

  const ids = trackIds.join(",");

  useEffect(() => {
    if (!offlineSupported()) return;
    let live = true;

    setSupported(true);
    void readKept(slug).then((map) => {
      if (live) setKept(map);
    });
    void planFormat(sizes, ids ? ids.split(",") : []).then((format) => {
      if (live) preferred.current = format;
    });

    return () => {
      live = false;
    };
    // `sizes` is server-rendered and changes only when `ids` does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, ids]);

  /**
   * Keep or drop one track. Returns the line to say about it, so the toast
   * stays the caller's business and this stays about the device.
   */
  const toggle = useCallback(
    async (trackId: string, title: string): Promise<string> => {
      if (busy) return "";
      setBusy(trackId);

      try {
        if (kept[trackId]) {
          await dropTrack(slug, trackId);
          setKept(await readKept(slug));
          return `Took ${title} back off this device.`;
        }

        const result = await keepTrack(slug, trackId, sizes, preferred.current);
        setKept(await readKept(slug));

        if (!result.ok) return result.error;

        if (result.downgraded) {
          // The rest of the album follows it down rather than each track
          // discovering the same wall on its own.
          preferred.current = result.format;
          return `Kept ${title} as an MP3 — there wasn't room for the lossless one.`;
        }
        return `Kept ${title} — it'll play without a signal.`;
      } finally {
        setBusy(null);
      }
    },
    [busy, kept, sizes, slug],
  );

  const count = Object.keys(kept).length;

  return { supported, kept, busy, toggle, count };
}
