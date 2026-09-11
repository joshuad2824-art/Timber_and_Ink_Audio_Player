import type { Track } from "@/data/types";

export type RepeatMode = "off" | "all" | "one";

export type PlayerSnapshot = {
  index: number;
  playing: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  crossfade: boolean;
  stalled: boolean;
};

const TICK_MS = 250;
const CROSSFADE_SECONDS = 4;
const VOLUME_KEY = "shadowharbor.volume";
const CROSSFADE_KEY = "shadowharbor.crossfade";

/**
 * The audio engine.
 *
 * Two elements, not one. A single element cannot overlap the end of one track
 * with the start of the next, so crossfade would be impossible and even plain
 * gapless playback would hiccup while the next track buffers. The two swap
 * roles on every advance: whichever is audible is `live`, the other is `idle`
 * and is where the next track gets preloaded.
 *
 * Deliberately not a React hook. Playback has to survive re-renders untouched —
 * a state change mid-crossfade must not restart a ramp or reset a volume — so
 * the engine owns the elements and React subscribes to snapshots of it.
 */
export class PlayerEngine {
  private els: [HTMLAudioElement, HTMLAudioElement];
  private liveIndex: 0 | 1 = 0;
  private tracks: Track[] = [];
  private slug = "";
  private format: "flac" | "mp3" = "flac";

  private index = 0;
  private playing = false;
  private position = 0;
  private shuffle = false;
  private repeat: RepeatMode = "off";
  private volume = 0.85;
  private crossfadeEnabled = false;
  private stalled = false;

  /** Non-null only while a crossfade is actually ramping. */
  private fade: { from: 0 | 1; to: 0 | 1; startedAt: number; toIndex: number } | null =
    null;

  /**
   * Which track index each element currently holds a source for.
   *
   * Needed because "the engine's current index" and "what is actually loaded"
   * are not the same thing. The engine starts at index 0 with nothing loaded,
   * so deciding whether to set a src by comparing indices alone silently skips
   * the load for the very first track anyone clicks.
   */
  private loaded: [number | null, number | null] = [null, null];

  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(s: PlayerSnapshot) => void>();

  constructor() {
    this.els = [new Audio(), new Audio()];
    for (const el of this.els) {
      el.preload = "none";
      /* No crossOrigin. The audio route is same-origin, so the unlock cookie
         rides along automatically; setting it would force a CORS code path for
         a request that never crosses an origin. */
      el.addEventListener("ended", () => this.onEnded(el));
      el.addEventListener("waiting", () => this.setStalled(true));
      el.addEventListener("playing", () => this.setStalled(false));
      el.addEventListener("canplay", () => this.setStalled(false));
      el.addEventListener("error", () => this.setStalled(true));
    }

    this.restorePreferences();
  }

  // ── wiring ────────────────────────────────────────────────────────────────

  load(slug: string, tracks: Track[], format: "flac" | "mp3") {
    const changed = this.slug !== slug || this.format !== format;
    this.slug = slug;
    this.tracks = tracks;
    this.format = format;
    // Anything already on an element belongs to the old record or encoding.
    if (changed) this.loaded = [null, null];
  }

  subscribe(fn: (s: PlayerSnapshot) => void): () => void {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => {
      this.listeners.delete(fn);
    };
  }

  snapshot(): PlayerSnapshot {
    return {
      index: this.index,
      playing: this.playing,
      position: this.position,
      duration: this.tracks[this.index]?.seconds ?? 0,
      shuffle: this.shuffle,
      repeat: this.repeat,
      volume: this.volume,
      crossfade: this.crossfadeEnabled,
      stalled: this.stalled,
    };
  }

  private emit() {
    const s = this.snapshot();
    for (const fn of this.listeners) fn(s);
  }

  private live(): HTMLAudioElement {
    return this.els[this.liveIndex];
  }

  private srcFor(i: number): string {
    const track = this.tracks[i];
    if (!track) return "";
    return `/api/records/${this.slug}/tracks/${track.id}/audio?format=${this.format}`;
  }

  // ── transport ─────────────────────────────────────────────────────────────

  async playTrack(i: number) {
    if (i < 0 || i >= this.tracks.length) return;

    this.cancelFade();

    const restarting = i === this.index;
    this.index = i;

    const el = this.live();
    if (this.loaded[this.liveIndex] !== i) {
      el.src = this.srcFor(i);
      this.loaded[this.liveIndex] = i;
      el.currentTime = 0;
      this.position = 0;
    } else if (restarting && !this.playing) {
      // Same track, already loaded, currently stopped — resume where it sat.
      el.currentTime = this.position;
    }

    await this.start();
  }

  async toggle() {
    if (this.playing) this.pause();
    else await this.play();
  }

  async play() {
    const el = this.live();
    if (this.loaded[this.liveIndex] !== this.index) {
      el.src = this.srcFor(this.index);
      this.loaded[this.liveIndex] = this.index;
      el.currentTime = this.position;
    }
    await this.start();
  }

  private async start() {
    const el = this.live();
    el.volume = this.volume;
    try {
      await el.play();
      this.playing = true;
      this.setStalled(false);
      this.startTicking();
    } catch {
      // Autoplay refusal, or a track with no file behind it. Either way the
      // transport should read as stopped rather than pretend to be running.
      this.playing = false;
      this.setStalled(true);
    }
    this.emit();
    this.publishMediaSession();
  }

  pause() {
    this.cancelFade();
    this.live().pause();
    this.playing = false;
    this.stopTicking();
    this.emit();
    this.publishMediaSession();
  }

  /** Previous restarts the track if more than 3 seconds in, else steps back. */
  async previous() {
    if (this.position > 3) {
      this.seek(0);
      return;
    }
    const n = this.tracks.length;
    if (n === 0) return;
    await this.playTrack((this.index - 1 + n) % n);
  }

  async next() {
    const i = this.nextIndex();
    if (i < 0) {
      this.pause();
      return;
    }
    await this.playTrack(i);
  }

  seek(seconds: number) {
    const duration = this.tracks[this.index]?.seconds ?? 0;
    const clamped = Math.max(0, Math.min(duration, seconds));

    // A seek invalidates any ramp in flight: the listener has moved away from
    // the point the fade was timed against.
    this.cancelFade();

    this.position = clamped;
    const el = this.live();
    if (el.src) {
      try {
        el.currentTime = clamped;
      } catch {
        /* not seekable yet; the tick will catch up once metadata lands */
      }
    }
    this.emit();
  }

  // ── modes ─────────────────────────────────────────────────────────────────

  setShuffle(on: boolean) {
    this.shuffle = on;
    this.emit();
  }

  cycleRepeat() {
    this.repeat = this.repeat === "off" ? "all" : this.repeat === "all" ? "one" : "off";
    this.emit();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    // Mid-fade the ramp owns both elements' volumes; writing here would jump
    // the level. The next tick applies the new target to the ramp instead.
    if (!this.fade) this.live().volume = this.volume;
    this.persist(VOLUME_KEY, String(this.volume));
    this.emit();
  }

  setCrossfade(on: boolean) {
    this.crossfadeEnabled = on;
    if (!on) this.cancelFade();
    this.persist(CROSSFADE_KEY, on ? "1" : "0");
    this.emit();
  }

  // ── the clock ─────────────────────────────────────────────────────────────

  private startTicking() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private stopTicking() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private tick() {
    const track = this.tracks[this.index];
    if (!track) return;

    const el = this.live();
    const duration = track.seconds || el.duration || 0;
    this.position = el.currentTime;

    if (this.fade) {
      this.advanceFade();
      return;
    }

    const cf = CROSSFADE_SECONDS;
    if (
      this.crossfadeEnabled &&
      this.repeat !== "one" &&
      duration > cf &&
      duration - this.position <= cf
    ) {
      void this.beginFade();
    }

    this.emit();
  }

  // ── crossfade ─────────────────────────────────────────────────────────────

  private async beginFade() {
    const to = this.nextIndex();
    if (to < 0) return;

    const idle = (1 - this.liveIndex) as 0 | 1;
    const el = this.els[idle];
    el.src = this.srcFor(to);
    this.loaded[idle] = to;
    el.currentTime = 0;
    el.volume = 0;

    try {
      await el.play();
    } catch {
      return; // could not start the next one; let the current track just end
    }

    this.fade = {
      from: this.liveIndex,
      to: idle,
      startedAt: performance.now(),
      toIndex: to,
    };
  }

  private advanceFade() {
    if (!this.fade) return;
    const { from, to } = this.fade;
    const k = Math.min(1, (performance.now() - this.fade.startedAt) / (CROSSFADE_SECONDS * 1000));

    // Linear, as the design specifies. An equal-power curve would hold the
    // perceived loudness steadier, but the brief asks for a linear ramp.
    this.els[from].volume = this.volume * (1 - k);
    this.els[to].volume = this.volume * k;

    if (k >= 1) this.finishFade();
    else this.emit();
  }

  private finishFade() {
    if (!this.fade) return;
    const { from, to, toIndex } = this.fade;
    this.fade = null;

    const old = this.els[from];
    old.pause();
    old.src = "";
    this.loaded[from] = null;

    this.liveIndex = to;
    this.index = toIndex;
    this.els[to].volume = this.volume;
    this.position = this.els[to].currentTime;

    this.emit();
    this.publishMediaSession();
  }

  private cancelFade() {
    if (!this.fade) return;
    const { to } = this.fade;
    this.els[to].pause();
    this.els[to].src = "";
    this.loaded[to] = null;
    this.fade = null;
    this.live().volume = this.volume;
  }

  // ── track ends ────────────────────────────────────────────────────────────

  private onEnded(el: HTMLAudioElement) {
    // During a fade the outgoing element ends on its own; that is the ramp
    // completing, not the record advancing.
    if (this.fade && el === this.els[this.fade.from]) return;

    if (this.repeat === "one") {
      el.currentTime = 0;
      void el.play();
      this.position = 0;
      this.emit();
      return;
    }

    const i = this.nextIndex();
    if (i < 0) {
      this.playing = false;
      this.position = this.tracks[this.index]?.seconds ?? 0;
      this.stopTicking();
      this.emit();
      return;
    }
    void this.playTrack(i);
  }

  private nextIndex(): number {
    const n = this.tracks.length;
    if (n === 0) return -1;

    if (this.shuffle) {
      if (n === 1) return this.repeat === "all" ? 0 : -1;
      let i = this.index;
      while (i === this.index) i = Math.floor(Math.random() * n);
      return i;
    }

    const i = this.index + 1;
    if (i >= n) return this.repeat === "all" ? 0 : -1;
    return i;
  }

  // ── lock screen ───────────────────────────────────────────────────────────

  private publishMediaSession() {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const track = this.tracks[this.index];
    if (!track) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: track.title });
      navigator.mediaSession.playbackState = this.playing ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => void this.play());
      navigator.mediaSession.setActionHandler("pause", () => this.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => void this.previous());
      navigator.mediaSession.setActionHandler("nexttrack", () => void this.next());
    } catch {
      /* not supported on this browser */
    }
  }

  // ── preferences ───────────────────────────────────────────────────────────

  private restorePreferences() {
    try {
      const v = localStorage.getItem(VOLUME_KEY);
      if (v !== null) {
        const n = Number(v);
        if (Number.isFinite(n)) this.volume = Math.max(0, Math.min(1, n));
      }
      this.crossfadeEnabled = localStorage.getItem(CROSSFADE_KEY) === "1";
    } catch {
      /* storage blocked; defaults stand */
    }
  }

  private persist(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage blocked */
    }
  }

  private setStalled(v: boolean) {
    if (this.stalled === v) return;
    this.stalled = v;
    this.emit();
  }

  destroy() {
    this.stopTicking();
    for (const el of this.els) {
      el.pause();
      el.src = "";
    }
    this.loaded = [null, null];
    this.listeners.clear();
  }
}
