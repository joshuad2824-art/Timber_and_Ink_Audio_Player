import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { KeyCap, PairedRule, PressedPlate } from "@/ui/devices";
import { isUnlocked, listCatalog, getSiteText } from "@/data/catalog";
import { isAdmin } from "@/data/admin";
import { AdminBar } from "@/chrome/AdminBar";
import { recordMeta } from "@/data/phrase";
import type { RecordState } from "@/data/types";
import styles from "./catalog.module.css";
import type_ from "@/ui/type.module.css";

/* Read fresh every time: a record the listener just unlocked has to read as
   Open the moment they come back to the catalog. */
export const dynamic = "force-dynamic";

/* The chip ink. Open is brass because it is the one thing that changed in the
   listener's favour; locked stays sage and says nothing. */
const STATE_TONE: Record<RecordState, string> = {
  Open: "var(--sh-brass-bright)",
  Locked: "var(--sh-ink-muted)",
  Draft: "var(--sh-warning)",
  Unlisted: "var(--sh-warning)",
};

export default async function CatalogPage() {
  const [records, siteText, admin] = await Promise.all([
    listCatalog(),
    getSiteText(),
    isAdmin(),
  ]);

  const states = await Promise.all(
    records.map(async (r): Promise<RecordState> => {
      // Draft and Unlisted are states only the owner can be in a position to
      // see, so they are checked first — a listener never reaches this branch
      // because those records are not in their list at all.
      if (admin && !r.published) return "Draft";
      if (admin && !r.listed) return "Unlisted";
      return (await isUnlocked(r.slug)) ? "Open" : "Locked";
    }),
  );

  const drafts = records.filter((r) => !r.published).length;

  // The count is live; the tail is the owner's copy.
  const artists = `${records.length} ${records.length === 1 ? "artist" : "artists"}`;
  const footerLine = `${artists} · ${siteText.footer}`;

  return (
    <Backdrop>
      {admin && (
        <AdminBar note={drafts === 1 ? "1 in drafts" : `${drafts} in drafts`} />
      )}
      <section className={styles.page}>
        <KeyCap>{siteText.eyebrow}</KeyCap>
        <h1 className={type_.pageTitle}>{siteText.title}</h1>
        <PairedRule />
        <p className={`${type_.hand} ${styles.intro}`}>{siteText.intro}</p>

        <div className={styles.list}>
          {records.map((record, i) => (
            <Link key={record.slug} href={`/r/${record.slug}`} className={styles.row}>
              <span className={styles.rowBody}>
                <span className={type_.signage}>{record.artistName}</span>
                <span className={styles.rowAlbum}>{record.albumTitle}</span>
                <span className={`${type_.meta} ${styles.rowMeta}`}>
                  {recordMeta(record.year, record.trackCount, record.totalSeconds)}
                </span>
              </span>
              <span className={styles.rowAside}>
                <PressedPlate tone={STATE_TONE[states[i]]}>{states[i]}</PressedPlate>
                <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </Link>
          ))}
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
