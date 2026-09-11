import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule, PressedPlate } from "@/ui/devices";
import { SEED_CATALOG, SEED_SITE_TEXT } from "@/data/seed";
import { recordMeta } from "@/data/phrase";
import type { RecordState } from "@/data/types";
import styles from "./catalog.module.css";
import type_ from "@/ui/type.module.css";

/* The chip ink. Open is brass because it is the one thing that changed in the
   listener's favour; locked stays sage and says nothing. */
const STATE_TONE: Record<RecordState, string> = {
  Open: "var(--sh-brass-bright)",
  Locked: "var(--sh-ink-muted)",
  Draft: "var(--sh-warning)",
  Unlisted: "var(--sh-warning)",
};

export default function CatalogPage() {
  const records = SEED_CATALOG.filter((r) => r.published && r.listed);
  const siteText = SEED_SITE_TEXT;

  // The count is live; the tail is the owner's copy.
  const artists = `${records.length} ${records.length === 1 ? "artist" : "artists"}`;
  const footerLine = `${artists} · ${siteText.footer}`;

  return (
    <Backdrop>
      <section className={styles.page}>
        <KeyCap>{siteText.eyebrow}</KeyCap>
        <h1 className={type_.pageTitle}>{siteText.title}</h1>
        <PairedRule />
        <p className={`${type_.hand} ${styles.intro}`}>{siteText.intro}</p>

        <div className={styles.list}>
          {records.map((record) => {
            // Milestone 2 reads this from the per-record cookie. Until the
            // unlock endpoint exists, every record reads as locked — which is
            // the honest state, since none of them can actually be opened yet.
            const state: RecordState = "Locked";

            return (
              <Link
                key={record.slug}
                href={`/r/${record.slug}`}
                className={styles.row}
              >
                <span className={styles.rowBody}>
                  <span className={type_.signage}>{record.artistName}</span>
                  <span className={styles.rowAlbum}>{record.albumTitle}</span>
                  <span className={`${type_.meta} ${styles.rowMeta}`}>
                    {recordMeta(record.year, record.trackCount, record.totalSeconds)}
                  </span>
                </span>
                <span className={styles.rowAside}>
                  <PressedPlate tone={STATE_TONE[state]}>{state}</PressedPlate>
                  <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        {records.length === 0 && (
          <div className={styles.empty}>Nothing here yet. Plenty of time.</div>
        )}

        <div className={`${type_.metaSmall} ${styles.footer}`}>{footerLine}</div>

        <div className={styles.doorRow}>
          <Link href="/admin" className={styles.door}>
            <Lock size={14} strokeWidth={1.5} aria-hidden="true" />
            Admin sign-in
          </Link>
        </div>
      </section>
    </Backdrop>
  );
}
