import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { PairedRule, PhotoMat, PressedPlate } from "@/ui/devices";
import { formatDuration, recordMeta } from "@/data/phrase";
import type { RecordDetail } from "@/data/types";
import { LockItBack } from "./LockItBack";
import styles from "../../screens.module.css";
import album from "./album.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The album, once the phrase has been accepted.
 *
 * Server-rendered, so the track list arrives as markup rather than as data the
 * browser had to ask for. The player bar and audio land in milestone 3; what
 * is here is the record itself.
 */
export function Album({ record }: { record: RecordDetail }) {
  return (
    <Backdrop>
      <section className={styles.album}>
        <div className={album.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            All recordings
          </Link>
          <LockItBack slug={record.slug} />
        </div>

        <div className={type_.signage}>{record.artistName}</div>

        <div className={album.cover}>
          <PhotoMat
            alt={`Cover art for ${record.albumTitle}`}
            caption={
              <div className={album.matCaption}>
                <span className={album.matArtist}>{record.artistName}</span>
                <PressedPlate tone="var(--sh-ink-muted)">{record.year}</PressedPlate>
              </div>
            }
          />
        </div>

        <h1 className={`${type_.albumTitle} ${album.title}`}>{record.albumTitle}</h1>
        <div className={`${type_.meta} ${album.meta}`}>
          {recordMeta(record.year, record.trackCount, record.totalSeconds)}
        </div>

        {record.intro && <p className={type_.handWide}>{record.intro}</p>}

        <PairedRule className={album.break} />
        <h2 className={`${type_.signageSmall} ${album.tracksHeading}`}>The tracks</h2>

        <div className={album.tracks}>
          {record.tracks.map((track, i) => (
            <div key={track.id} className={album.track}>
              <span className={`${type_.meta} ${album.trackNumber}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={album.trackTitle}>{track.title}</span>
              <span className={`${type_.meta} ${album.trackTime}`}>
                {formatDuration(track.seconds)}
              </span>
            </div>
          ))}
        </div>

        {record.tracks.length === 0 && (
          <div className={album.noTracks}>Nothing on this one yet.</div>
        )}

        <div className={`${type_.metaSmall} ${album.footer}`}>
          {record.artistName} · {record.year}
        </div>
      </section>
    </Backdrop>
  );
}
