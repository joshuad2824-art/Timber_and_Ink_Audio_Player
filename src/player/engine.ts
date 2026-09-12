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

/* A quarter-second tick is far too coarse for a volume ramp — four steps down a
   fade-out is audible as four steps — so ramps get their own faster timer. At
   40 steps a second the curve below is a curve rather than a staircase. */
const RAMP_MS = 25;
/** The breath between two tracks: real silence, so they never run together. */
const GAP_SECONDS = 3;
/** The tail of a track, ramped down inside its own last seconds. */
const FADE_OUT_SECONDS = 2;
/** The head of the next one, ramped up once the silence is over. */
const FADE_IN_SECONDS = 1.6;
/** Short enough that a tap still feels immediate, long enough to kill the click. */
const CUE_FADE_SECONDS = 0.4;

/**
 * Ease a ramp's progress so it leaves and arrives at a standstill.
 *
 * A raised cosine: flat at both ends, steepest in the middle. A straight line
 * changes volume at a constant rate, which means it starts and stops moving
 * abruptly even though the level itself never jumps — and that corner is the
 * part a listener hears as the fade beginning. Easing the ends hides both the
 * moment a track starts to go and the moment the next one finishes arriving.
 */
function eased(k: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * k);
}

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
 * There are two ways across the seam between tracks and the Crossfade switch
 * picks one. Off, which is the default, the outgoing track ramps down through
 * its own last seconds, three seconds of silence follow, and the next one ramps
 * up — a record puts a gap between songs and so does this. On, they overlap on
 * a linear ramp and there is no silence at all. Either way nothing starts or
 * stops at full volume, and no ramp starts or stops at a constant rate either,
 * which is the whole point: a cut is the one transition that sounds like a
 * machine, and a straight line is the one fade you can hear begin.
 *
 * Deliberately not a React hook. Playback has to survive re-renders untouched —
 * a state change mid-crossfade must not restart a ramp or reset a volume — so
 * the engine owns the elements and React subscribes to snapshots of it.
 */
export class PlayerEngine {
  /**
   * The two elements, or null until something needs them.
   *
   * Not built in the constructor. The component that owns the engine is a
   * client component, and Next renders client components on the server too —
   * so the constructor runs in a place where `Audio` does not exist. Doing it
   * there threw `ReferenceError: Audio is not defined` and turned a direct
   * visit to an already-unlocked record into a 500: the gate worked, because
   * arriving through it re-renders on the client, and then the bookmark that
   * record's own copy tells you to keep was broken.
   */
  private pair: [HTMLAudioElement, HTMLAudioElement] | null = null;

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

  /** Non-null only while a single element's volume is actually ramping. */
  private ramp: {
    el: HTMLAudioElement;
    from: number;
    to: number;
    startedAt: number;
    ms: number;
    /** What the ramp was on its way to do — pause the element, usually. */
    done?: () => void;
  } | null = null;

  private rampTimer: ReturnType<typeof setInterval> | null = null;

  /** Set only while the silence between two tracks is running. */
  private gapTimer: ReturnType<typeof setTimeout> | null = null;

  /** True once the current track's tail ramp has been started, so it is started once. */
  private fadingOut = false;

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
    // Reads localStorage inside a try, so this is safe off a browser.
    this.restorePreferences();
  }

  /**
   * The element pair, built on first use.
   *
   * Everything that touches an element goes through here, which puts the DOM
   * work on the first call that actually wants the DOM — and every such call
   * comes from an event handler or an effect, both of which only ever run in a
   * browser.
   */
  private els(): [HTMLAudioElement, HTMLAudioElement] {
    if (this.pair) return this.pair;

    const pair: [HTMLAudioElement, HTMLAudioElement] = [new Audio(), new Audio()];
    for (const el of pair) {
      el.preload = "none";
      /* No crossOrigin. The audio route is same-origin, so the unlock cookie
         rides along automatically; setting it would force a CORS code path for
         a request that never crosses an origin. */
      el.addEventListener("ended", () => this.onEnded(el));
      /* Only the audible element can stall. The idle one is where the next
         track preloads and where a retired source gets dropped, and the drop
         itself fires `error` — which, taken at face value, left the bar
         reading "Buffering" over a track that was playing perfectly well. */
      el.addEventListener("waiting", () => this.stallFrom(el, true));
      el.addEventListener("playing", () => this.stallFrom(el, false));
      el.addEventListener("canplay", () => this.stallFrom(el, false));
      el.addEventListener("error", () => this.stallFrom(el, true));
    }

    this.pair = pair;
    return pair;
  }

  // ── wiring ────────────────────────────────────────────────────────────────

  load(slug: string, tracks: Track[], format: "flac" | "mp3") {
    const changed = this.slug !== slug || this.format !== format;
    this.slug = slug;
    this.tracks = tracks;
    this.format = format;
    // Anything already on an element, or on its way to one, belongs to the old
    // record or encoding.
    if (changed) {
      this.cancelGap();
      this.cancelFade();
      this.cancelRamp();
      this.loaded = [null, null];
    }
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
    return this.els()[this.liveIndex];
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
    this.cancelGap();

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
    // Pressing play during the silence means "now", not "in two seconds" — so
    // the gap ends here, and the track gets the fade it was going to get.
    const betweenTracks = this.gapTimer !== null;
    this.cancelGap();

    const el = this.live();
    if (this.loaded[this.liveIndex] !== this.index) {
      el.src = this.srcFor(this.index);
      this.loaded[this.liveIndex] = this.index;
      el.currentTime = this.position;
    }
    await this.start(betweenTracks ? FADE_IN_SECONDS : CUE_FADE_SECONDS);
  }

  /**
   * Start the live element, ramping up rather than arriving at full volume.
   *
   * Even a tap on a track row gets a ramp. A third of a second is short enough
   * that the tap still feels answered and long enough that the first sample is
   * not a click; a track arriving out of the silence gets the longer one.
   */
  private async start(fadeSeconds = CUE_FADE_SECONDS) {
    const el = this.live();
    // This element is ours now, including whatever a ramp in flight was going
    // to do with it — a pause that is about to be overruled by playing.
    this.cancelRamp(false);
    this.fadingOut = false;
    el.volume = 0;
    try {
      await el.play();
      this.playing = true;
      this.setStalled(false);
      this.startTicking();
      this.rampTo(el, this.volume, fadeSeconds * 1000);
    } catch {
      // Autoplay refusal, or a track with no file behind it. Either way the
      // transport should read as stopped rather than pretend to be running,
      // and the element is left at the real level for the next attempt.
      el.volume = this.volume;
      this.playing = false;
      this.setStalled(true);
    }
    this.emit();
    this.publishMediaSession();
  }

  pause() {
    this.cancelFade();

    if (this.gapTimer !== null) {
      // Caught in the silence. The next track is already cued on the live
      // element, so stopping here leaves it ready to start rather than
      // snapping back to the one that just finished.
      this.cancelGap();
      this.live().pause();
      this.playing = false;
      this.stopTicking();
      this.emit();
      this.publishMediaSession();
      return;
    }

    const el = this.live();
    // The transport reads as stopped at once, because the tap has to be
    // answered; the sound gets the same short ramp down that play gets up.
    this.playing = false;
    this.stopTicking();
    this.rampTo(el, 0, CUE_FADE_SECONDS * 1000, () => {
      el.pause();
      el.volume = this.volume;
    });
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

    /* A seek invalidates anything in flight: the listener has moved away from
       the point the fade was timed against, and touching the bar during the
       silence means the same as pressing play — start the cued track, here. */
    const betweenTracks = this.gapTimer !== null;
    this.cancelGap();
    this.cancelFade();
    this.cancelRamp();
    this.fadingOut = false;

    this.position = clamped;
    const el = this.live();
    if (el.src) {
      try {
        el.currentTime = clamped;
      } catch {
        /* not seekable yet; the tick will catch up once metadata lands */
      }
    }

    if (betweenTracks) {
      void this.start(FADE_IN_SECONDS);
      return;
    }

    // Seeking backwards out of a tail ramp has to undo it, or the rest of the
    // track plays at whatever level the ramp had reached.
    if (!this.fade) el.volume = this.volume;
    this.emit();
  }

  // ── modes ─────────────────────────────────────────────────────────────────

  setShuffle(on: boolean) {
    this.shuffle = on;
    this.emit();
  }

  /**
   * One button, three states, in that order: the whole album, then the one
   * song, then off again. The bar swaps to the `repeat-1` glyph on the second
   * press, so the three states are told apart without a label.
   */
  cycleRepeat() {
    this.repeat = this.repeat === "off" ? "all" : this.repeat === "all" ? "one" : "off";
    this.emit();
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    // Mid-ramp the ramp owns the element's volume; writing here would jump the
    // level. A ramp on its way up gets the new target instead, so a nudge of
    // the slider during a fade-in lands where the listener put it. A fade-out
    // is on its way to silence and stays on its way to silence.
    if (this.ramp) {
      if (this.ramp.to > 0) this.ramp.to = this.volume;
    } else if (!this.fade) {
      this.live().volume = this.volume;
    }
    this.persist(VOLUME_KEY, String(this.volume));
    this.emit();
  }

  setCrossfade(on: boolean) {
    this.crossfadeEnabled = on;
    if (on) {
      // A tail already on its way down belongs to the transition that was just
      // switched off. Put the level back and let the crossfade have the seam.
      if (this.fadingOut) {
        this.cancelRamp();
        this.fadingOut = false;
        if (!this.fade) this.live().volume = this.volume;
      }
    } else {
      this.cancelFade();
    }
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
    // The silence between two tracks runs on its own timer, with the live
    // element cued at zero waiting for it. Nothing here applies.
    if (this.gapTimer !== null) return;

    const track = this.tracks[this.index];
    if (!track) return;

    const el = this.live();
    const duration = this.liveDuration(track);
    this.position = el.currentTime;

    if (this.fade) {
      this.advanceFade();
      return;
    }

    const remaining = duration - this.position;

    if (this.crossfadeEnabled && this.repeat !== "one") {
      const cf = CROSSFADE_SECONDS;
      if (duration > cf && remaining <= cf) void this.beginFade();
    } else if (
      !this.fadingOut &&
      // A track with no room for two ramps gets neither.
      duration > FADE_OUT_SECONDS * 2 &&
      remaining <= FADE_OUT_SECONDS &&
      this.advanceTarget() >= 0
    ) {
      /* The tail, ramped down inside the track's own last seconds and timed to
         reach silence exactly as the file ends — so what follows reads as the
         gap between two songs rather than a cut. The last track of a record is
         left alone: an ending that was mastered to end is not one to fade. */
      this.fadingOut = true;
      this.rampTo(el, 0, Math.max(200, remaining * 1000));
    }

    this.emit();
  }

  // ── crossfade ─────────────────────────────────────────────────────────────

  private async beginFade() {
    const to = this.nextIndex();
    if (to < 0) return;

    // The crossfade owns both volumes from here; nothing else may be moving.
    this.cancelRamp();
    this.fadingOut = false;

    const idle = (1 - this.liveIndex) as 0 | 1;
    const el = this.els()[idle];
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
    this.els()[from].volume = this.volume * (1 - k);
    this.els()[to].volume = this.volume * k;

    if (k >= 1) this.finishFade();
    else this.emit();
  }

  private finishFade() {
    if (!this.fade) return;
    const { from, to, toIndex } = this.fade;
    this.fade = null;

    const old = this.els()[from];
    old.pause();
    this.releaseSource(old, from);

    this.liveIndex = to;
    this.index = toIndex;
    this.els()[to].volume = this.volume;
    this.position = this.els()[to].currentTime;

    this.emit();
    this.publishMediaSession();
  }

  private cancelFade() {
    if (!this.fade) return;
    const { to } = this.fade;
    const incoming = this.els()[to];
    incoming.pause();
    this.releaseSource(incoming, to);
    this.fade = null;
    this.live().volume = this.volume;
  }

  // ── the gap between tracks ────────────────────────────────────────────────

  /**
   * Three seconds of silence, then the next track fades in.
   *
   * The handover happens at the start of the silence rather than the end of it:
   * the next track becomes the current one immediately, cued at zero with its
   * volume at zero and its file already loading. So the bar says what is
   * coming, the lock screen agrees, pressing pause stops on the cued track
   * instead of snapping back to the finished one, and the three seconds are
   * spent buffering, which is most of why the first second of the next track
   * does not stall.
   *
   * It stays on the element the listener started, not the idle one. iOS only
   * lets an element play unprompted once that element has had a tap, so handing
   * the advance to the other one is how a record quietly stops at the end of
   * track one on an iPhone. The pair is still there for crossfade, which has to
   * overlap and so has no choice.
   */
  private beginGap(to: number) {
    this.cancelRamp();
    this.fadingOut = false;

    const el = this.live();
    el.pause();
    el.volume = 0;

    // Already loaded when repeat-one comes back round to the same file.
    if (this.loaded[this.liveIndex] !== to) {
      // Against the `none` the pair is built with: the silence is only worth
      // anything if the next track spends it arriving.
      el.preload = "auto";
      el.src = this.srcFor(to);
      this.loaded[this.liveIndex] = to;
    }
    try {
      el.currentTime = 0;
    } catch {
      /* no metadata yet; it is at zero anyway, and endGap asks again */
    }

    this.index = to;
    this.position = 0;
    this.playing = true; // between tracks is still running, just not sounding
    this.gapTimer = setTimeout(() => void this.endGap(), GAP_SECONDS * 1000);

    this.emit();
    this.publishMediaSession();
  }

  private async endGap() {
    this.gapTimer = null;
    try {
      this.live().currentTime = this.position;
    } catch {
      /* not seekable yet; start() plays from wherever it is */
    }
    await this.start(FADE_IN_SECONDS);
  }

  private cancelGap() {
    if (this.gapTimer === null) return;
    clearTimeout(this.gapTimer);
    this.gapTimer = null;
  }

  // ── volume ramps ──────────────────────────────────────────────────────────

  /**
   * Walk one element's volume to a target over `ms`.
   *
   * Timed against the wall clock rather than counted in steps, so a background
   * tab that throttles the timer still arrives, just coarsely. A ramp that
   * stopped halfway would leave a track playing at half volume, or silent.
   */
  private rampTo(el: HTMLAudioElement, to: number, ms: number, done?: () => void) {
    this.cancelRamp(false);

    const from = el.volume;
    const target = Math.max(0, Math.min(1, to));
    if (ms <= 0 || Math.abs(target - from) < 0.005) {
      el.volume = target;
      done?.();
      return;
    }

    this.ramp = { el, from, to: target, startedAt: performance.now(), ms, done };
    this.rampTimer = setInterval(() => this.advanceRamp(), RAMP_MS);
  }

  private advanceRamp() {
    const r = this.ramp;
    if (!r) {
      this.stopRampTimer();
      return;
    }

    const k = Math.min(1, (performance.now() - r.startedAt) / r.ms);
    r.el.volume = Math.max(0, Math.min(1, r.from + (r.to - r.from) * eased(k)));
    if (k < 1) return;

    this.ramp = null;
    this.stopRampTimer();
    r.done?.();
  }

  /**
   * Drop a ramp in flight, leaving the volume where it reached.
   *
   * `settle` still runs what the ramp was on its way to do. A fade-out that
   * ends in a pause has to pause even when something interrupts it, or a seek
   * mid-ramp leaves an element playing that the listener stopped. Only `start`,
   * which is taking the element over to play it, drops that.
   */
  private cancelRamp(settle = true) {
    const r = this.ramp;
    if (!r) return;
    this.ramp = null;
    this.stopRampTimer();
    if (settle) r.done?.();
  }

  private stopRampTimer() {
    if (!this.rampTimer) return;
    clearInterval(this.rampTimer);
    this.rampTimer = null;
  }

  /**
   * Let go of an element's file.
   *
   * `removeAttribute`, not `src = ""` — an empty string resolves against the
   * page, so the element goes off to load an HTML document as audio and reports
   * the obvious error.
   */
  private releaseSource(el: HTMLAudioElement, slot: 0 | 1) {
    el.removeAttribute("src");
    el.preload = "none";
    this.loaded[slot] = null;
    try {
      el.load();
    } catch {
      /* nothing to reset */
    }
  }

  // ── track ends ────────────────────────────────────────────────────────────

  private onEnded(el: HTMLAudioElement) {
    // During a fade the outgoing element ends on its own; that is the ramp
    // completing, not the record advancing.
    if (this.fade && el === this.els()[this.fade.from]) return;
    // Likewise an element that is no longer the audible one. A crossfade that
    // has already swapped roles leaves the retired track to finish in silence,
    // and reading that as an advance skips a song.
    if (el !== this.live()) return;
    // A gap is already counting down towards the next track.
    if (this.gapTimer !== null) return;

    const to = this.advanceTarget();
    if (to < 0) {
      // The record is over. Put the level back in case a tail ramp took it
      // down on the way here — repeat-all switched off mid-fade, say — so the
      // next press of play is not answered with silence.
      el.volume = this.volume;
      this.playing = false;
      this.position = this.tracks[this.index]?.seconds ?? 0;
      this.stopTicking();
      this.emit();
      this.publishMediaSession();
      return;
    }

    /* Crossfade on means the tracks overlap and there is no silence to sit in.
       Arriving here with it on means the ramp never got going — a track shorter
       than the window, or a next file that would not start — so advance plainly
       rather than inventing a pause the listener switched off. */
    if (this.crossfadeEnabled && this.repeat !== "one") {
      void this.playTrack(to);
      return;
    }

    this.beginGap(to);
  }

  /**
   * Where the record goes when this track ends, or -1 if it stops there.
   *
   * Repeat-one is an advance to the same index rather than a special case that
   * restarts the element, so the one song loops through the same ramp down,
   * silence and ramp up as any other pair of tracks.
   */
  private advanceTarget(): number {
    if (this.repeat === "one") return this.index;
    return this.nextIndex();
  }

  /**
   * How long the playing file actually is.
   *
   * The element's own duration wherever it has one, because that is what
   * decides when `ended` fires: a ramp timed against a stored length that
   * disagrees reaches silence early, or gets cut off partway down. The stored
   * length stands in until metadata lands, and stays what the bar displays.
   */
  private liveDuration(track: Track): number {
    const d = this.live().duration;
    if (Number.isFinite(d) && d > 0) return d;
    return track.seconds || 0;
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

  private stallFrom(el: HTMLAudioElement, v: boolean) {
    if (el !== this.live()) return;
    this.setStalled(v);
  }

  private setStalled(v: boolean) {
    if (this.stalled === v) return;
    this.stalled = v;
    this.emit();
  }

  destroy() {
    this.stopTicking();
    this.cancelGap();
    this.cancelRamp(false);
    // Only what was actually built. Reaching through the accessor here would
    // create two elements for the sole purpose of tearing them down.
    for (const el of this.pair ?? []) {
      el.pause();
      el.src = "";
    }
    this.loaded = [null, null];
    this.listeners.clear();
  }
}
