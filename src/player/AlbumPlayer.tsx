"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDuration } from "@/data/phrase";
import type { Track, TrackAssetSizes } from "@/data/types";
import { PairedRule } from "@/ui/devices";
import { Switch } from "@/ui/Switch";
import { ToastSlot, useToast } from "@/chrome/Toast";
import { BookmarkButton, KeepToggle, OfflinePanel } from "@/offline/OfflinePanel";
import { useKept } from "@/offline/useKept";
import { PlayerEngine, type PlayerSnapshot } from "./engine";
import { PlayerBar } from "./PlayerBar";
import album from "@/app/r/[slug]/album.module.css";
import type_ from "@/ui/type.module.css";

/**
 * Everything from the options row down: the record's own two controls, the
 * track list, the player bar, and the offline state that ties the first to the
 * third.
 *
 * The "The tracks" heading lives here rather than on the server page because
 * the offline panel opens between the heading and the list, and a rule that
 * sometimes has a panel under it and sometimes does not is one element, not
 * two halves in two files.
 *
 * Tracks with no audio behind them are still listed — the record exists before
 * its files do — but they cannot be started or kept, and they say so rather
 * than failing silently when tapped.
 */
export function AlbumPlayer({
  slug,
  tracks,
  formats,
  artistName,
  albumTitle,
  coverUrl,
}: {
  slug: string;
  tracks: Track[];
  /** Which encodings each track has, and what they weigh. */
  formats: TrackAssetSizes;
  /* Who made it and what it is called. Not shown here — the page above has
     already said both — but the lock screen has not, and a bare song title
     there reads as a loose file rather than as a track off a record. */
  artistName: string;
  albumTitle: string;
  coverUrl?: string;
}) {
  /* A track is playable when it has the streaming encoding. The MP3 exists for
     downloads and as the fallback for a device with no room for lossless; it is
     not what the player reaches for. */
  const playable = useMemo(
    () => new Set(Object.keys(formats).filter((id) => formats[id]?.flac)),
    [formats],
  );

  // Only tracks with audio go to the engine, so "next" never lands on silence.
  const queue = useMemo(
    () => tracks.filter((t) => playable.has(t.id)),
    [tracks, playable],
  );

  const [engine] = useState(() => new PlayerEngine());
  const [state, setState] = useState<PlayerSnapshot>(() => engine.snapshot());
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, say] = useToast();

  const queueIds = useMemo(() => queue.map((t) => t.id), [queue]);
  const offline = useKept(slug, queueIds, formats);

  useEffect(() => engine.subscribe(setState), [engine]);
  useEffect(() => () => engine.destroy(), [engine]);

  useEffect(() => {
    engine.load(slug, queue, "flac", {
      artist: artistName,
      album: albumTitle,
      coverUrl,
    });
  }, [engine, slug, queue, artistName, albumTitle, coverUrl]);

  const currentId = queue[state.index]?.id;

  return (
    <>
      {/* The two settings that belong to the record rather than to this moment
          of playback: where the album is kept, and how it moves between
          tracks. Neither belongs in the bar, which is about now. */}
      <div className={album.optionsRow}>
        {offline.supported && (
          <KeepToggle
            open={panelOpen}
            onToggle={() => setPanelOpen((o) => !o)}
            className={album.keepSlot}
          />
        )}
        <Switch
          label="Crossfade"
          checked={state.crossfade}
          onChange={(next) => engine.setCrossfade(next)}
        />
      </div>

      <PairedRule className={album.break} />
      <h2 className={`${type_.signageSmall} ${album.tracksHeading}`}>The tracks</h2>

      {offline.supported && panelOpen && (
        <OfflinePanel count={offline.count} total={queue.length} />
      )}

      <div className={album.tracks}>
        {tracks.map((track, i) => {
          const isPlayable = playable.has(track.id);
          const isCurrent = isPlayable && track.id === currentId;
          const isPlaying = isCurrent && state.playing;

          const play = () => {
            /* A row with no file behind it is listed but cannot start, and
               saying so is the point — tapping it and getting nothing at all
               reads as a broken row rather than as a record still being
               finished. */
            if (!isPlayable) {
              say("That one's not up yet. The sound is coming.");
              return;
            }
            // Clicking the playing row pauses it. That is how the design
            // reads, and it saves a trip to the bar for the common case.
            if (isPlaying) engine.pause();
            else void engine.playTrack(queue.findIndex((q) => q.id === track.id));
          };

          return (
            <div
              key={track.id}
              className={[
                album.track,
                isPlayable ? album.trackPlayable : album.trackSilent,
                isCurrent ? album.trackActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* The row and the bookmark are siblings, not nested. One button
                  inside another is not a thing a keyboard or a screen reader
                  can make sense of, and the bookmark has to be reachable
                  without starting the track. */}
              <div
                role="button"
                tabIndex={isPlayable ? 0 : -1}
                aria-disabled={!isPlayable}
                aria-current={isCurrent || undefined}
                className={album.trackBody}
                onClick={play}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  play();
                }}
              >
                <span className={`${type_.meta} ${album.trackNumber}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={album.trackTitle}>{track.title}</span>
                <span className={`${type_.meta} ${album.trackTime}`}>
                  {isPlayable ? formatDuration(track.seconds) : "—"}
                </span>
              </div>

              {offline.supported && isPlayable && (
                <BookmarkButton
                  title={track.title}
                  kept={Boolean(offline.kept[track.id])}
                  busy={offline.busy === track.id}
                  onToggle={() => {
                    void offline.toggle(track.id, track.title).then((line) => {
                      if (line) say(line);
                    });
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {queue.length === 0 && tracks.length > 0 && (
        <div className={album.noTracks}>
          The files for this one aren&rsquo;t up yet. The list is right; the sound
          is coming.
        </div>
      )}

      <ToastSlot message={toast} />

      <PlayerBar engine={engine} titles={queue.map((t) => t.title)} />
    </>
  );
}
