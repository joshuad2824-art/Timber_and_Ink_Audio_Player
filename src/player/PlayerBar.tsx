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
  const trackRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => engine.subscribe(setState), [engine]);

  /* The volume popover closes the way every popover closes: a tap outside it,
     or Escape. Without either it could only be dismissed by finding the
     speaker icon again, and it sits over the transport while you look.

     `pointerdown` rather than `click`, so it goes on the press rather than
     waiting for the release, and capture so a handler inside some other
     control cannot stop it from arriving. Focus goes back to the button on
     Escape, because a keyboard user who dismisses this has nowhere to be
     otherwise. */
  useEffect(() => {
    if (!volumeOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      if (volumeRef.current?.contains(e.target as Node)) return;
      setVolumeOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setVolumeOpen(false);
      volumeRef.current?.querySelector("button")?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [volumeOpen]);

  // While dragging, the bar follows the finger rather than the audio clock —
  // otherwise the playhead fights the drag every 250ms.
  const shown = dragPosition ?? state.position;
  const progress = state.duration > 0 ? Math.min(1, shown / state.duration) : 0;

  /* Measured off the visible track rather than off the hit area around it.
     The hit area carries the screen's side gutters as padding, and those are
     no longer the same on both sides — the landscape notch inset is added to
     one of them — so the old trick of halving the difference between the two
     widths put every seek out by a few pixels on a phone held sideways. The
     track's own rect is the thing the listener is actually aiming at. */
  const seekFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || state.duration <= 0) return 0;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return 0;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
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
            else if (e.key === "Home") engine.seek(0);
            else if (e.key === "End") engine.seek(state.duration);
            else return;
            e.preventDefault();
          }}
        >
          <div ref={trackRef} className={styles.scrubTrack}>
            <div className={styles.scrubFill} style={{ width: `${progress * 100}%` }} />
            {/* The playhead. Cream, never lit — the amber button is the one
                glowing thing in this view. It marks where a drag has hold of,
                which a 4px line with no mark on it never did. */}
            <div className={styles.scrubThumb} style={{ left: `${progress * 100}%` }} />
          </div>
        </div>

        <div className={styles.nowRow}>
          <div className={styles.nowTitle}>{title}</div>
          {/* Three different things, in one slot. A track on its way reads as
              buffering; a track that will not load says so instead of promising
              music that is not coming; everything else is the clock. */}
          <div
            className={`${type_.meta} ${styles.time} ${state.trouble ? styles.trouble : ""}`}
          >
            {state.trouble === "buffering"
              ? "Buffering"
              : state.trouble === "unplayable"
                ? "Won't load"
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

          <div className={styles.volumeWrap} ref={volumeRef}>
            <button
              type="button"
              className={styles.control}
              aria-label="Volume"
              aria-expanded={volumeOpen}
              disabled={!hasAudio}
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
