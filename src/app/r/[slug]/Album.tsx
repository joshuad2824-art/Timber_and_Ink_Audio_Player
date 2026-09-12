import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Backdrop } from "@/chrome/Backdrop";
import { PhotoMat, PressedPlate } from "@/ui/devices";
import { recordMeta } from "@/data/phrase";
import type { RecordDetail, TrackAssetSizes } from "@/data/types";
import { AlbumPlayer } from "@/player/AlbumPlayer";
import { AdminBar } from "@/chrome/AdminBar";
import { LockItBack } from "./LockItBack";
import styles from "../../screens.module.css";
import album from "./album.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The album, once the phrase has been accepted.
 *
 * Server-rendered, so the track list arrives as markup rather than as data the
 * browser had to ask for. Everything from the options row down is the client's
 * — it needs the engine and the device's cache — and lives in AlbumPlayer.
 */
export function Album({
  record,
  formats,
  admin = false,
}: {
  record: RecordDetail;
  formats: TrackAssetSizes;
  admin?: boolean;
}) {
  return (
    <Backdrop>
      {admin && <AdminBar note="Phrases don't stop you here" />}
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
            src={record.coverUrl}
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

        <AlbumPlayer slug={record.slug} tracks={record.tracks} formats={formats} />

        <div className={`${type_.metaSmall} ${album.footer}`}>
          {record.artistName} · {record.year}
        </div>
      </section>
    </Backdrop>
  );
}
