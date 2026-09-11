"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDuration } from "@/data/phrase";
import type { Track } from "@/data/types";
import { PlayerEngine, type PlayerSnapshot } from "./engine";
import { PlayerBar } from "./PlayerBar";
import { Switch } from "@/ui/Switch";
import album from "@/app/r/[slug]/album.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The track list and the player bar, sharing one engine.
 *
 * Tracks with no audio behind them are still listed — the record exists before
 * its files do — but they cannot be started, and they say so rather than
 * failing silently when tapped.
 */
export function AlbumPlayer({
  slug,
  tracks,
  playable,
}: {
  slug: string;
  tracks: Track[];
  /** Track ids that actually have a streamable encoding stored. */
  playable: string[];
}) {
  const playableSet = useMemo(() => new Set(playable), [playable]);

  // Only tracks with audio go to the engine, so "next" never lands on silence.
  const queue = useMemo(
    () => tracks.filter((t) => playableSet.has(t.id)),
    [tracks, playableSet],
  );

  const [engine] = useState(() => new PlayerEngine());
  const [state, setState] = useState<PlayerSnapshot>(() => engine.snapshot());

  useEffect(() => engine.subscribe(setState), [engine]);
  useEffect(() => () => engine.destroy(), [engine]);

  useEffect(() => {
    engine.load(slug, queue, "flac");
  }, [engine, slug, queue]);

  const currentId = queue[state.index]?.id;

  return (
    <>
      {/* The one playback preference that belongs on the record rather than in
          the bar: it changes how the album plays through, not how this moment
          sounds. "Keep it on your device" joins it here in milestone 5. */}
      <div className={album.optionsRow}>
        <Switch
          label="Crossfade"
          checked={state.crossfade}
          onChange={(next) => engine.setCrossfade(next)}
        />
      </div>

      <div className={album.tracks}>
        {tracks.map((track, i) => {
          const isPlayable = playableSet.has(track.id);
          const isCurrent = isPlayable && track.id === currentId;
          const isPlaying = isCurrent && state.playing;

          return (
            <div
              key={track.id}
              role="button"
              tabIndex={isPlayable ? 0 : -1}
              aria-disabled={!isPlayable}
              aria-current={isCurrent || undefined}
              className={[
                album.track,
                isPlayable ? album.trackPlayable : album.trackSilent,
                isCurrent ? album.trackActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!isPlayable) return;
                // Clicking the playing row pauses it. That is how the design
                // reads, and it saves a trip to the bar for the common case.
                if (isPlaying) engine.pause();
                else void engine.playTrack(queue.findIndex((q) => q.id === track.id));
              }}
              onKeyDown={(e) => {
                if (!isPlayable) return;
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                if (isPlaying) engine.pause();
                else void engine.playTrack(queue.findIndex((q) => q.id === track.id));
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
          );
        })}
      </div>

      {queue.length === 0 && tracks.length > 0 && (
        <div className={album.noTracks}>
          The files for this one aren&rsquo;t up yet. The list is right; the sound
          is coming.
        </div>
      )}

      <PlayerBar engine={engine} titles={queue.map((t) => t.title)} />
    </>
  );
}
