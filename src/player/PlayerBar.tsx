"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

import { formatDuration } from "@/data/phrase";
import type { PlayerEngine, PlayerSnapshot } from "./engine";
import styles from "./PlayerBar.module.css";
import type_ from "@/ui/type.module.css";

/**
 * The fixed player bar.
 *
 * Reads the engine through snapshots rather than owning any playback state, so
 * a re-render can never interrupt a ramp or reset a volume.
 */
export function PlayerBar({
  engine,
  titles,
}: {
  engine: PlayerEngine;
  titles: string[];
}) {
  const [state, setState] = useState<PlayerSnapshot>(() => engine.snapshot());
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const scrubRef = useRef<HTMLDivElement>(null);

  useEffect(() => engine.subscribe(setState), [engine]);

  // While dragging, the bar follows the finger rather than the audio clock —
  // otherwise the playhead fights the drag every 250ms.
  const shown = dragPosition ?? state.position;
  const progress = state.duration > 0 ? Math.min(1, shown / state.duration) : 0;

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const el = scrubRef.current;
      if (!el || state.duration <= 0) return 0;
      const rect = el.getBoundingClientRect();
      const gutter = (rect.width - el.clientWidth) / 2;
      const usable = el.clientWidth || rect.width;
      const x = clientX - rect.left - gutter;
      const ratio = Math.max(0, Math.min(1, x / usable));
      return ratio * state.duration;
    },
    [state.duration],
  );

  /* Pointer capture is what makes the drag survive leaving the 4px track. A
     click-only bar feels broken the moment a thumb wanders, which on a phone is
     always. */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.duration <= 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPosition(seekFromPointer(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPosition === null) return;
    setDragPosition(seekFromPointer(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPosition === null) return;
    const target = seekFromPointer(e.clientX);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setDragPosition(null);
    engine.seek(target);
  };

  const title = titles[state.index] ?? "";
  const hasAudio = titles.length > 0;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div
          ref={scrubRef}
          className={styles.scrub}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(state.duration)}
          aria-valuenow={Math.round(shown)}
          aria-valuetext={`${formatDuration(shown)} of ${formatDuration(state.duration)}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") engine.seek(state.position + 5);
            else if (e.key === "ArrowLeft") engine.seek(state.position - 5);
            else return;
            e.preventDefault();
          }}
        >
          <div className={styles.scrubTrack}>
            <div className={styles.scrubFill} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className={styles.nowRow}>
          <div className={styles.nowTitle}>{title}</div>
          <div
            className={`${type_.meta} ${styles.time} ${state.stalled ? styles.stalled : ""}`}
          >
            {state.stalled
              ? "Buffering"
              : `${formatDuration(shown)} / ${formatDuration(state.duration)}`}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.control} ${state.shuffle ? styles.engaged : ""}`}
            aria-label="Shuffle"
            aria-pressed={state.shuffle}
            disabled={!hasAudio}
            onClick={() => engine.setShuffle(!state.shuffle)}
          >
            <Shuffle size={18} strokeWidth={state.shuffle ? 2 : 1.5} />
          </button>

          <button
            type="button"
            className={styles.control}
            aria-label="Previous"
            disabled={!hasAudio}
            onClick={() => void engine.previous()}
          >
            <SkipBack size={20} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className={styles.play}
            aria-label={state.playing ? "Pause" : "Play"}
            disabled={!hasAudio}
            onClick={() => void engine.toggle()}
          >
            {state.playing ? (
              <Pause size={22} strokeWidth={1.5} fill="currentColor" />
            ) : (
              <Play size={22} strokeWidth={1.5} fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            className={styles.control}
            aria-label="Next"
            disabled={!hasAudio}
            onClick={() => void engine.next()}
          >
            <SkipForward size={20} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className={`${styles.control} ${state.repeat !== "off" ? styles.engaged : ""}`}
            aria-label={
              state.repeat === "one"
                ? "Repeat one"
                : state.repeat === "all"
                  ? "Repeat all"
                  : "Repeat off"
            }
            disabled={!hasAudio}
            onClick={() => engine.cycleRepeat()}
          >
            {state.repeat === "one" ? (
              <Repeat1 size={18} strokeWidth={2} />
            ) : (
              <Repeat size={18} strokeWidth={state.repeat === "all" ? 2 : 1.5} />
            )}
          </button>

          <div className={styles.volumeWrap}>
            <button
              type="button"
              className={styles.control}
              aria-label="Volume"
              aria-expanded={volumeOpen}
              onClick={() => setVolumeOpen((v) => !v)}
            >
              <Volume2 size={18} strokeWidth={1.5} />
            </button>

            {volumeOpen && (
              <div className={styles.volumePopover}>
                <input
                  className={styles.volumeSlider}
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(state.volume * 100)}
                  aria-label="Volume level"
                  onChange={(e) => engine.setVolume(Number(e.target.value) / 100)}
                />
                <span className={`${type_.meta} ${styles.volumeValue}`}>
                  {Math.round(state.volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
