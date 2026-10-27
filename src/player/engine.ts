import type { Track } from "@/data/types";

export type RepeatMode = "off" | "all" | "one";

/**
 * What is wrong with the current track, if anything.
 *
 * These were one boolean, and conflating them told a lie: a track whose file
 * would not load, and a browser refusing to start audio without a gesture,
 * both read as "Buffering" — a word that promises the music is on its way.
 * `null` is the ordinary case, including a refused autoplay, where the
 * transport reading as stopped is the whole truth.
 */
export type Trouble = null | "buffering" | "unplayable";

export type PlayerSnapshot = {
  index: number;
  playing: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  crossfade: boolean;
  trouble: Trouble;
  /** Where the record goes when this track ends, or -1 if it stops there. */
  upNext: number;
  /**
   * False where the platform owns the level and the page cannot touch it —
   * every iPhone and iPad. There the bar has no volume to offer and a
   * crossfade has no fade in it, so neither is shown.
   */
  volumeControl: boolean;
};

/** What the lock screen and the car stereo are told about the record. */
export type RecordMeta = {
  artist: string;
  album: string;
  coverUrl?: string;
};

/** One line of the engine's own account of what it did, for `#log`. */
export type DiagnosticEntry = {
  at: number;
  event: string;
  index: number;
  detail?: string;
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
/** Enough of a history to cover three tracks crossing on a locked phone. */
const DIAGNOSTIC_LIMIT = 300;

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

let silenceUrl: string | null = null;

/**
 * The gap between two tracks, as a file: three seconds of 8kHz mono zeroes.
 *
 * The silence used to be a paused element and a three-second timer, and that
 * is the version a locked iPhone cannot keep. With nothing playing, the phone
 * has no reason to keep the page awake, so the timer that was meant to start
 * the next track fired whenever the screen next came on. Silence that plays is
 * still playback: the element never stops, the page stays alive, and the next
 * track starts on the element's own `ended` rather than on a clock that may
 * not be running.
 *
 * Built here rather than shipped as a file so it needs no network, no cache
 * entry and no service worker to be there offline. 48KB, made once.
 */
function silence(): string {
  if (silenceUrl) return silenceUrl;
  const rate = 8000;
  const data = rate * GAP_SECONDS * 2;
  const bytes = new Uint8Array(44 + data);
  const view = new DataView(bytes.buffer);
  const ascii = (at: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[at + i] = s.charCodeAt(i);
  };
  ascii(0, "RIFF");
  view.setUint32(4, 36 + data, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, "data");
  view.setUint32(40, data, true);

  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  silenceUrl = `data:audio/wav;base64,${btoa(binary)}`;
  return silenceUrl;
}

/**
 * Whether this element's volume can be set from the page at all.
 *
 * On iOS it cannot: the property reads 1 whatever is written to it, because
 * the level belongs to the buttons on the side of the phone. Asked by writing
 * and reading back rather than by sniffing the user agent, so an iPad that
 * calls itself a Mac gets the right answer too.
 */
function canSetVolume(el: HTMLAudioElement): boolean {
  try {
    el.volume = 0.5;
    const ok = Math.abs(el.volume - 0.5) < 0.01;
    el.volume = 1;
    return ok;
  } catch {
    return false;
  }
}

function mediaSession(): MediaSession | null {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return null;
  return navigator.mediaSession;
}

/**
 * The lock screen is one per page, and so is whoever answers it.
 *
 * Each engine registers its handlers when it starts playing and clears them
 * when it is torn down — but only if it is still the one registered. Leaving
 * one record for another mounts the new engine before the old one is gone,
 * and the old one's cleanup used to be free to wipe the new one's controls.
 */
let sessionOwner: PlayerEngine | null = null;

/**
 * Every action this player answers, and the two it deliberately does not.
 *
 * `seekbackward` and `seekforward` are the ten-second skips a podcast wants.
 * Registered, they compete with previous and next for the same two buttons on
 * a lock screen, and on a phone the platform is free to show the skips instead
 * of the tracks. An album player wants the tracks, so the skips are cleared
 * rather than offered. Scrubbing stays: `seekto` is the progress bar, which
 * has a place of its own.
 */
const ANSWERED = ["play", "pause", "previoustrack", "nexttrack", "seekto"] as const;
const DECLINED = ["seekbackward", "seekforward"] as const;

/**
 * The audio engine.
 *
 * Two elements, not one. A single element cannot overlap the end of one track
 * with the start of the next, so crossfade would be impossible. The two swap
 * roles on a crossfade: whichever is audible is `live`, the other is `idle`
 * and is where the incoming track starts.
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
 * Every advance that matters is driven by the media element's own events, not
 * by a timer. A timer is the first thing a locked phone stops running; an
 * element that is playing is the one thing it keeps. The timers left — the
 * tick, the ramps — only decorate: a frozen one leaves a fade coarse, never a
 * record stopped.
 *
 * Every `play()` is answered late, and sometimes after something else has
 * happened. Each transport action takes a new revision, and a promise that
 * comes back for an old one is told it has been overtaken rather than allowed
 * to write over whatever the listener did since.
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
  /** Unhooks every listener the pair was given, in one call. */
  private wiring: AbortController | null = null;

  private liveIndex: 0 | 1 = 0;
  private tracks: Track[] = [];
  private slug = "";
  private format: "flac" | "mp3" = "flac";

  private index = 0;
  /** Confirmed: the element said yes. Not merely asked. */
  private playing = false;
  /**
   * What the listener asked for most recently. Kept apart from `playing`
   * because the two disagree for as long as a `play()` is outstanding, and a
   * late answer has to know whether anybody still wants it.
   */
  private wantPlaying = false;
  private position = 0;
  private shuffle = false;
  private repeat: RepeatMode = "off";
  private volume = 0.85;
  private crossfadeEnabled = false;
  private trouble: Trouble = null;
  private meta: RecordMeta = { artist: "", album: "" };
  /** Assumed until an element has been asked. */
  private volumeControl = true;

  /** Bumped by every action that overrules whatever was in flight. */
  private rev = 0;

  /**
   * The shuffle order: a permutation of the track ids, or null when playing in
   * sequence.
   *
   * Built once when shuffle is switched on rather than drawn fresh at every
   * advance. Rolling a die per track meant the record could never end — there
   * was always another index to go to — and it could play the same song twice
   * before it had played half of them. A permutation ends where an album ends,
   * and every track comes round exactly once.
   *
   * Held for as long as shuffle is on, so repeat-all replays the same order.
   * That is the predictable reading: the listener shuffled the record once and
   * it stayed shuffled, rather than the running order changing underneath them
   * on the second pass.
   *
   * Ids, not indices, so a queue that is reordered under it still means the
   * same songs in the same order.
   */
  private order: string[] | null = null;

  /** Non-null only while a crossfade is actually ramping. */
  private fade: { from: 0 | 1; to: 0 | 1; startedAt: number; toIndex: number } | null =
    null;

  /**
   * Set from the moment a crossfade asks the incoming track to start until it
   * answers. Without it every tick in that window asked again — and every ask
   * reset the incoming file to zero, so on a slow connection the next track
   * was restarted four times a second and never got going.
   */
  private pendingFade: number | null = null;
  private fadeSeq = 0;

  /**
   * The file a crossfade was refused for, so it is not asked again.
   *
   * On an iPhone the second element has never had a tap, and an element that
   * has not had one may not start by itself. One refusal is enough to know:
   * the track then ends plainly and the record advances on the element the
   * listener did start.
   */
  private fadeRefused: string | null = null;

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

  /** True while the live element is playing the silence between two tracks. */
  private inGap = false;

  /**
   * The element still playing the silence, on a loop, while the next track's
   * file arrives on the other one. Null the rest of the time.
   *
   * The silence used to end on the dot and the same element went off to fetch
   * the next track — and a lossless file comes through a function that reads
   * the whole blob before it sends a byte, so that is seconds with nothing
   * playing. On a locked iPhone, seconds with nothing playing is a page the
   * phone suspends: the lock screen went on counting through a song nobody
   * could hear, and it started from the top when the phone was unlocked. The
   * silence now holds the page open until the next track is actually sounding.
   */
  private keeper: HTMLAudioElement | null = null;

  /**
   * Elements that have been started inside a tap, and so may start on their
   * own later. iOS will not let an element play unprompted until it has; the
   * handover at the end of the silence moves to the other element, so both
   * need one. See `bless`.
   */
  private blessed = new WeakSet<HTMLAudioElement>();

  /** True once the current track's tail ramp has been started, so it is started once. */
  private fadingOut = false;

  /**
   * Which file each element currently holds.
   *
   * The URL rather than the track's index, because the index is only a place
   * in today's queue. Compared by index, a queue reordered under a playing
   * record read as unchanged — slot 0 was "loaded" — and the element went on
   * playing the song that used to be first.
   */
  private loaded: [string | null, string | null] = [null, null];

  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(s: PlayerSnapshot) => void>();
  private log: DiagnosticEntry[] = [];

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

    const wiring = new AbortController();
    const on = { signal: wiring.signal };
    const pair: [HTMLAudioElement, HTMLAudioElement] = [new Audio(), new Audio()];
    for (const el of pair) {
      el.preload = "none";
      /* No crossOrigin. The audio route is same-origin, so the unlock cookie
         rides along automatically; setting it would force a CORS code path for
         a request that never crosses an origin. */
      el.addEventListener("ended", () => this.onEnded(el), on);
      el.addEventListener("pause", () => this.onPause(el), on);
      /* Only the audible element can stall. The idle one is where the next
         track starts and where a retired source gets dropped, and the drop
         itself fires `error` — which, taken at face value, left the bar
         reading "Buffering" over a track that was playing perfectly well. */
      el.addEventListener("waiting", () => this.troubleFrom(el, "buffering"), on);
      el.addEventListener("playing", () => this.troubleFrom(el, null), on);
      el.addEventListener("canplay", () => this.troubleFrom(el, null), on);
      el.addEventListener("error", () => this.onError(el), on);
      /* The element's own clock, which keeps running in places the page's
         timers do not. A ramp left behind by a throttled timer catches up here,
         so a fade-in can arrive late but never strand a track at silence. */
      el.addEventListener(
        "timeupdate",
        () => {
          if (this.ramp?.el === el) this.advanceRamp();
        },
        on,
      );
    }
    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        () => this.note("visibility", document.visibilityState),
        on,
      );
    }

    this.volumeControl = canSetVolume(pair[0]);
    this.wiring = wiring;
    this.pair = pair;
    return pair;
  }

  // ── wiring ────────────────────────────────────────────────────────────────

  /**
   * Find out what this browser lets the page do, before anything is played.
   *
   * Called once the component is in the browser, so the bar can drop the
   * controls an iPhone would ignore on first paint rather than on first tap.
   */
  prepare() {
    const before = this.volumeControl;
    this.els();
    if (this.volumeControl !== before) this.emit();
  }

  load(slug: string, tracks: Track[], format: "flac" | "mp3", meta: RecordMeta) {
    const changed = this.slug !== slug || this.format !== format;
    const hadRecord = this.slug !== "";
    const currentId = this.tracks[this.index]?.id;

    this.slug = slug;
    this.tracks = tracks;
    this.format = format;
    this.meta = meta;

    if (changed) {
      // Anything already on an element, or on its way to one, belongs to the
      // old record or encoding.
      this.cancelGap();
      this.cancelFade();
      this.cancelRamp();
      if (hadRecord) {
        this.stopHere();
        this.index = 0;
        this.position = 0;
      }
      this.loaded = [null, null];
      this.setTrouble(null);
    } else if (currentId !== undefined) {
      /* The same record with a different list — reordered, or a track added or
         taken away. What is playing stays what is playing; only its place in
         the list moves. If it is gone altogether, it stops rather than going
         on as a song the bar no longer names. */
      const at = tracks.findIndex((t) => t.id === currentId);
      if (at >= 0) {
        this.index = at;
      } else {
        this.cancelGap();
        this.cancelFade();
        this.stopHere();
        this.index = Math.max(0, Math.min(this.index, tracks.length - 1));
        this.position = 0;
      }
    }

    if (this.order && !this.orderFits(this.order)) this.order = null;
    this.emit();
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
      duration: this.duration(),
      shuffle: this.shuffle,
      repeat: this.repeat,
      volume: this.volume,
      crossfade: this.crossfadeEnabled,
      trouble: this.trouble,
      upNext: this.advanceTarget(),
      volumeControl: this.volumeControl,
    };
  }

  /** What the engine has done lately, oldest first. Never leaves the device. */
  diagnostics(): DiagnosticEntry[] {
    return [...this.log];
  }

  private emit() {
    const s = this.snapshot();
    for (const fn of this.listeners) fn(s);
  }

  /**
   * Write down one thing that happened.
   *
   * The index and the event, and the element's own state where it explains
   * something. Never a URL: the audio path carries the record's slug, and this
   * is shown on screen to whoever opens `#log`.
   */
  private note(event: string, detail?: string) {
    this.log.push({ at: Date.now(), event, index: this.index, detail });
    if (this.log.length > DIAGNOSTIC_LIMIT) this.log.shift();
  }

  private live(): HTMLAudioElement {
    return this.els()[this.liveIndex];
  }

  private srcFor(i: number): string {
    const track = this.tracks[i];
    if (!track) return "";
    return `/api/records/${this.slug}/tracks/${track.id}/audio?format=${this.format}`;
  }

  /** True when the live element holds the current track, and not the silence. */
  private holdsCurrent(): boolean {
    return this.pair !== null && this.loaded[this.liveIndex] === this.srcFor(this.index);
  }

  /**
   * How long the current track actually is.
   *
   * The element's own duration wherever it has one, because that is what
   * decides when `ended` fires and how far a seek can go: a stored length that
   * disagrees with the file either strands the last seconds out of reach of the
   * scrubber or lets it drag past the end. The stored length stands in until
   * metadata lands, and during the silence, when the element holds nothing of
   * this track yet.
   */
  private duration(): number {
    const stored = this.tracks[this.index]?.seconds ?? 0;
    if (!this.holdsCurrent()) return stored;
    const d = this.pair![this.liveIndex].duration;
    return Number.isFinite(d) && d > 0 ? d : stored;
  }

  // ── transport ─────────────────────────────────────────────────────────────

  async playTrack(i: number) {
    if (i < 0 || i >= this.tracks.length) return;

    this.cancelFade();
    this.cancelGap();
    this.bless();

    const restarting = i === this.index;
    this.index = i;
    this.fadeRefused = null;
    this.setTrouble(null);

    const el = this.live();
    const src = this.srcFor(i);
    if (this.loaded[this.liveIndex] !== src) {
      el.src = src;
      this.loaded[this.liveIndex] = src;
      el.currentTime = 0;
      this.position = 0;
    } else if (restarting && !this.playing) {
      // Same track, already loaded, currently stopped — resume where it sat.
      try {
        el.currentTime = this.position;
      } catch {
        /* not seekable yet; it will start from wherever it is */
      }
    } else if (restarting) {
      /* Same track, already playing. Asked for again, it starts again — the
         only reading of a deliberate tap that is not "dip the volume to zero
         and come back to exactly where you were", which is what doing nothing
         here looked like. */
      this.position = 0;
      try {
        el.currentTime = 0;
      } catch {
        /* not seekable yet; it will start from wherever it is */
      }
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
    const betweenTracks = this.inGap;
    this.cancelGap();
    this.bless();

    const src = this.srcFor(this.index);
    if (!src) return;
    const el = this.live();
    if (this.loaded[this.liveIndex] !== src) {
      el.src = src;
      this.loaded[this.liveIndex] = src;
      try {
        el.currentTime = this.position;
      } catch {
        /* not seekable yet; it starts from the top */
      }
    }
    await this.start(betweenTracks ? FADE_IN_SECONDS : CUE_FADE_SECONDS);
  }

  /**
   * Start the live element, ramping up rather than arriving at full volume.
   *
   * Even a tap on a track row gets a ramp. A third of a second is short enough
   * that the tap still feels answered and long enough that the first sample is
   * not a click; a track arriving out of the silence gets the longer one.
   *
   * `el.play()` is called before the first await, on purpose. Called from an
   * `ended` handler on a locked phone, that is the moment the browser still
   * counts as the element carrying on; anything deferred past it is a new
   * start the platform may refuse.
   */
  private async start(fadeSeconds = CUE_FADE_SECONDS) {
    const el = this.live();
    const rev = ++this.rev;
    const keeper = this.keeper;
    this.wantPlaying = true;
    this.blessed.add(el);
    // This element is ours now, including whatever a ramp in flight was going
    // to do with it — a pause that is about to be overruled by playing.
    this.cancelRamp(false);
    this.fadingOut = false;
    const ramped = this.volumeControl && fadeSeconds > 0;
    el.volume = ramped ? 0 : this.volume;
    // The lock screen's buttons go in before the wait, not after it. A
    // listener reaching for them while the first track buffers should find
    // them there.
    this.claimSession();
    this.note("play requested");

    try {
      await el.play();
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "Error";
      if (rev !== this.rev) {
        this.note("play overtaken", name);
        return;
      }
      this.note("play refused", name);
      this.stopKeeper();
      if (keeper && name === "NotAllowedError" && this.pair) {
        /* The other element was never started inside a tap, and this phone
           wants one. Go back to the element that has been playing all along:
           it is allowed, and a track that starts late beats one that does not
           start. */
        this.handBack(keeper);
        return;
      }
      /* Three different refusals wearing one exception.

         `NotAllowedError` is the browser declining to start audio without a
         gesture, and `AbortError` is a load interrupted from outside. In
         neither is anything wrong with the file: the transport reads as
         stopped, which is exactly what has happened, and the next tap will
         work. Saying "Buffering" there was a lie that sent the listener off to
         check their signal. Anything else — a missing file, a codec this
         browser will not decode — is the track genuinely not playable, and
         the bar says so. */
      const harmless = name === "NotAllowedError" || name === "AbortError";
      if (this.volumeControl) el.volume = this.volume;
      this.playing = false;
      this.wantPlaying = false;
      this.stopTicking();
      this.setTrouble(harmless ? null : "unplayable");
      this.emit();
      this.publishMediaSession();
      return;
    }

    if (rev !== this.rev) {
      /* Overtaken while it was starting: by another track, a pause, a page
         that has gone. Whatever overtook it owns the transport now. If what
         the listener wants is silence, make sure this element is not the one
         thing still making a sound. */
      this.note("play overtaken");
      if (!this.wantPlaying) el.pause();
      return;
    }

    this.stopKeeper();
    this.playing = true;
    this.setTrouble(null);
    this.startTicking();
    if (ramped) this.rampTo(el, this.volume, fadeSeconds * 1000);
    this.note("playing", `t=${el.currentTime.toFixed(1)}`);
    this.emit();
    this.publishMediaSession();
  }

  pause() {
    this.wantPlaying = false;
    this.rev++;
    this.stopKeeper();
    this.cancelFade();
    this.note("paused");

    if (this.inGap) {
      // Caught in the silence. The next track is already the current one, so
      // stopping here leaves it ready to start rather than snapping back to
      // the one that just finished.
      this.cancelGap();
      if (this.pair) this.live().pause();
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
      if (this.volumeControl) el.volume = this.volume;
    });
    this.emit();
    this.publishMediaSession();
  }

  /**
   * Previous restarts the track if more than 3 seconds in, else steps back.
   *
   * Paused, it stays paused — see `next`.
   */
  async previous() {
    if (this.position > 3) {
      this.seek(0);
      return;
    }
    const to = this.previousIndex();
    if (to < 0) return;
    if (!this.playing) this.cue(to);
    else await this.playTrack(to);
  }

  /**
   * The next track.
   *
   * Paused, it moves to the next track and stays paused. A pause is a decision
   * the listener made and a skip is not a reversal of it — and on headphones
   * in a pocket, a double-tap that started music out of nowhere would be the
   * worse surprise. The bar, the keyboard and the lock screen all come through
   * here, so they all agree. A tap on a track row is the explicit "play this".
   */
  async next() {
    const i = this.nextIndex();
    if (!this.playing) {
      if (i >= 0) this.cue(i);
      return;
    }
    if (i < 0) {
      this.pause();
      return;
    }
    await this.playTrack(i);
  }

  /** Make a track current, at the top, without starting it. */
  private cue(i: number) {
    this.cancelFade();
    this.cancelGap();
    this.index = i;
    this.position = 0;
    this.fadingOut = false;
    this.fadeRefused = null;
    this.setTrouble(null);
    /* The file goes on the element when play is pressed. The one exception is
       a cue back onto the file the element already holds — a one-track record
       stepping back to itself — which has to be rewound, because play will not
       reload what is already there. */
    if (this.holdsCurrent()) {
      try {
        this.live().currentTime = 0;
      } catch {
        /* not seekable yet; it is near the top anyway */
      }
    }
    this.note("cued");
    this.emit();
    this.publishMediaSession();
  }

  seek(seconds: number) {
    const clamped = Math.max(0, Math.min(this.duration(), seconds));

    /* A seek invalidates anything in flight: the listener has moved away from
       the point the fade was timed against, and touching the bar during the
       silence means the same as pressing play — start the cued track, here. */
    const betweenTracks = this.inGap;
    this.cancelGap();
    this.cancelFade();
    this.cancelRamp();
    this.fadingOut = false;

    this.position = clamped;
    const el = this.live();

    if (betweenTracks) {
      const src = this.srcFor(this.index);
      el.src = src;
      this.loaded[this.liveIndex] = src;
      try {
        el.currentTime = clamped;
      } catch {
        /* not seekable yet; it starts from the top */
      }
      void this.start(FADE_IN_SECONDS);
      return;
    }

    if (this.holdsCurrent()) {
      try {
        el.currentTime = clamped;
      } catch {
        /* not seekable yet; the tick will catch up once metadata lands */
      }
    }

    // Seeking backwards out of a tail ramp has to undo it, or the rest of the
    // track plays at whatever level the ramp had reached.
    if (!this.fade && this.volumeControl) el.volume = this.volume;
    this.emit();
    this.publishPosition();
  }

  /** Stop where things are, without a ramp. For a record or track going away. */
  private stopHere() {
    this.rev++;
    this.wantPlaying = false;
    this.stopKeeper();
    this.cancelRamp(false);
    if (this.pair) {
      const el = this.live();
      el.pause();
      if (this.volumeControl) el.volume = this.volume;
    }
    this.playing = false;
    this.stopTicking();
  }

  // ── modes ─────────────────────────────────────────────────────────────────

  setShuffle(on: boolean) {
    this.shuffle = on;
    this.order = on ? this.buildOrder() : null;
    this.emit();
  }

  /**
   * A fresh running order, with whatever is playing at the front of it.
   *
   * Current track first because shuffling is not a request to skip the song
   * you are listening to. Fisher-Yates over the rest, which is the only common
   * shuffle that draws every permutation with equal probability — sorting by a
   * random comparator, the usual shortcut, does not.
   */
  private buildOrder(): string[] {
    const current = this.tracks[this.index]?.id;
    const rest = this.tracks.map((t) => t.id).filter((id) => id !== current);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return current === undefined ? rest : [current, ...rest];
  }

  /** True when an order still names exactly the tracks in the queue. */
  private orderFits(order: string[]): boolean {
    if (order.length !== this.tracks.length) return false;
    const ids = new Set(order);
    return this.tracks.every((t) => ids.has(t.id));
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

  /**
   * Whether the next seam is a crossfade.
   *
   * Not where the platform will not let the page set a volume: there two
   * tracks would simply play over each other at full level for four seconds,
   * which is not a fade of any kind. A preference saved on such a device
   * before the switch was hidden there is ignored rather than obeyed.
   */
  private crossfading(): boolean {
    return this.crossfadeEnabled && this.volumeControl && this.repeat !== "one";
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
    // The silence between two tracks is its own file, and the bar holds the
    // next track at zero while it plays. Nothing here applies.
    if (this.inGap) return;

    const track = this.tracks[this.index];
    if (!track) return;

    const el = this.live();
    const duration = this.duration();
    this.position = el.currentTime;

    if (this.fade) {
      this.advanceFade();
      return;
    }

    const remaining = duration - this.position;

    if (this.crossfading()) {
      const cf = CROSSFADE_SECONDS;
      if (
        duration > cf &&
        remaining <= cf &&
        this.fadeRefused !== this.loaded[this.liveIndex]
      ) {
        void this.beginFade();
      }
    } else if (
      !this.fadingOut &&
      this.volumeControl &&
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
    this.publishPosition();
  }

  // ── crossfade ─────────────────────────────────────────────────────────────

  private async beginFade() {
    if (this.fade || this.pendingFade !== null) return;
    const to = this.nextIndex();
    if (to < 0) return;

    // The crossfade owns both volumes from here; nothing else may be moving.
    this.cancelRamp();
    this.fadingOut = false;
    this.live().volume = this.volume;

    const from = this.liveIndex;
    const idle = (1 - from) as 0 | 1;
    const el = this.els()[idle];
    const token = ++this.fadeSeq;
    this.pendingFade = token;

    const src = this.srcFor(to);
    el.src = src;
    this.loaded[idle] = src;
    el.currentTime = 0;
    el.volume = 0;
    this.note("crossfade requested");

    try {
      await el.play();
    } catch (err) {
      if (this.pendingFade !== token) return;
      this.pendingFade = null;
      this.fadeRefused = this.loaded[from];
      this.releaseSource(el, idle);
      this.note("crossfade refused", err instanceof DOMException ? err.name : "Error");
      return; // the current track ends plainly, and the record advances from there
    }

    if (this.pendingFade !== token) {
      /* Called off while it was starting — a pause, a seek, a track picked by
         hand. `cancelFade` has already let go of the file; the one thing left
         is to keep the element quiet now that its play has come through. */
      if (this.pendingFade === null && !this.fade) el.pause();
      return;
    }

    this.pendingFade = null;
    this.fade = { from, to: idle, startedAt: performance.now(), toIndex: to };
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

    // Roles swap before the old element is stopped, so the pause that stopping
    // it fires is read as the retired track's, not as the record pausing.
    this.liveIndex = to;
    this.index = toIndex;
    const old = this.els()[from];
    old.pause();
    this.releaseSource(old, from);

    this.els()[to].volume = this.volume;
    this.position = this.els()[to].currentTime;
    this.note("crossfade finished");

    this.emit();
    this.publishMediaSession();
  }

  /** Call off a crossfade, whether it is ramping or still waiting to start. */
  private cancelFade() {
    if (this.pendingFade !== null) {
      this.pendingFade = null;
      const idle = (1 - this.liveIndex) as 0 | 1;
      const el = this.els()[idle];
      el.pause();
      this.releaseSource(el, idle);
    }
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
   * the next track becomes the current one immediately, cued at zero. So the
   * bar says what is coming, the lock screen agrees, and pressing pause stops
   * on the cued track instead of snapping back to the finished one.
   *
   * The silence is played, not waited out — see `silence()` — and it is
   * played on the element the listener started, not the idle one. iOS only
   * lets an element play unprompted once that element has had a tap, so
   * handing the advance to the other one is how a record quietly stops at the
   * end of track one on an iPhone. The pair is still there for crossfade,
   * which has to overlap and so has no choice.
   */
  private beginGap(to: number) {
    this.cancelRamp();
    this.fadingOut = false;

    const el = this.live();
    this.index = to;
    this.position = 0;
    this.inGap = true;

    const rev = ++this.rev;
    const gap = silence();
    el.src = gap;
    this.loaded[this.liveIndex] = gap;
    this.note("silence");
    el.play().catch((err) => {
      if (rev !== this.rev || !this.inGap) return;
      /* The silence would not play. Sitting in a pause that nothing is going
         to end is the one wrong answer, so the next track goes on now. */
      this.note("silence refused", err instanceof DOMException ? err.name : "Error");
      this.endGap();
    });

    /* The next file starts arriving on the other element while the silence
       plays, so three seconds of it are spent fetching rather than waiting. A
       phone that will not buffer before play is asked still loses nothing:
       the silence holds on until the track sounds, see `endGap`. */
    this.cancelFade();
    const slot = (1 - this.liveIndex) as 0 | 1;
    const next = this.els()[slot];
    const src = this.srcFor(to);
    if (this.loaded[slot] !== src) {
      next.preload = "auto";
      next.src = src;
      this.loaded[slot] = src;
    }

    this.emit();
    this.publishMediaSession();
  }

  /**
   * The silence is over: the cued track goes on, on the other element, and
   * the silence keeps playing underneath until it does.
   *
   * Two elements rather than one so that something is always playing. On one
   * element the silence had to stop before the track could be fetched, and a
   * locked phone suspends a page in that pause. The silence loops — `loop`,
   * not a timer — and `start` stops it the moment the track is sounding, or
   * refused. So the gap is three seconds on a quick connection and as long as
   * the file takes on a slow one, and never a gap the phone can fall into.
   */
  private endGap() {
    this.inGap = false;
    const keeper = this.live();
    const slot = (1 - this.liveIndex) as 0 | 1;
    const el = this.els()[slot];
    const src = this.srcFor(this.index);
    if (this.loaded[slot] !== src) {
      el.src = src;
      this.loaded[slot] = src;
    }
    try {
      el.currentTime = this.position;
    } catch {
      /* not seekable yet; it starts from the top */
    }

    keeper.loop = true;
    this.keeper = keeper;
    // It has just ended; asked again it starts from the top. Called before
    // the track's own play, so the phone never sees a moment with neither.
    keeper.play().catch(() => {
      /* the track's own answer decides what happens next */
    });

    this.liveIndex = slot;
    this.note("handover");
    void this.start(FADE_IN_SECONDS);
  }

  /** The track is sounding, or will not: let the silence go. */
  private stopKeeper() {
    const k = this.keeper;
    if (!k) return;
    this.keeper = null;
    k.loop = false;
    k.pause();
  }

  /**
   * The other element refused to start. Put the track on the one that has
   * been playing the silence instead, which the phone already allows.
   */
  private handBack(keeper: HTMLAudioElement) {
    const pair = this.els();
    const slot = (pair[0] === keeper ? 0 : 1) as 0 | 1;
    const other = pair[1 - slot];
    other.pause();
    this.liveIndex = slot;
    const src = this.srcFor(this.index);
    keeper.src = src;
    this.loaded[slot] = src;
    this.loaded[(1 - slot) as 0 | 1] = null;
    this.note("handed back");
    void this.start(FADE_IN_SECONDS);
  }

  /**
   * Leave the silence. Whatever called this replaces or pauses the element,
   * so the silence itself is left to them — but a silence still holding the
   * page open for a track that is no longer coming is stopped here.
   */
  private cancelGap() {
    this.inGap = false;
    this.stopKeeper();
  }

  /**
   * Start the idle element on the silence, inside the listener's tap, so it
   * may start by itself later.
   *
   * iOS lets an element play without a gesture only once it has played with
   * one. The handover at the end of each silence starts the track on the
   * element that was idle, so on the first tap both get started: the live one
   * on the track, this one on a moment of nothing that is paused as soon as it
   * begins. Done once per element; a crossfade in progress owns the idle one
   * and is left alone.
   */
  private bless() {
    if (this.fade || this.pendingFade !== null) return;
    const slot = (1 - this.liveIndex) as 0 | 1;
    const idle = this.els()[slot];
    if (this.blessed.has(idle)) return;
    this.blessed.add(idle);

    const gap = silence();
    idle.src = gap;
    this.loaded[slot] = gap;
    idle.play().then(
      () => {
        // Only if nothing has claimed it since.
        if (this.loaded[slot] === gap && slot !== this.liveIndex) idle.pause();
      },
      () => {
        /* refused: the handover will find out, and hand back */
      },
    );
  }

  // ── volume ramps ──────────────────────────────────────────────────────────

  /**
   * Walk one element's volume to a target over `ms`.
   *
   * Timed against the wall clock rather than counted in steps, so a background
   * tab that throttles the timer still arrives, just coarsely — and the
   * element's `timeupdate` pushes it along too, for a timer that has stopped
   * altogether. A ramp that stopped halfway would leave a track playing at half
   * volume, or silent.
   *
   * Where the platform will not let the page set a volume there is nothing to
   * walk, so the ramp ends at once and whatever it was on its way to do — a
   * pause, usually — happens now rather than after a fade nobody can hear.
   */
  private rampTo(el: HTMLAudioElement, to: number, ms: number, done?: () => void) {
    this.cancelRamp(false);

    const from = el.volume;
    const target = Math.max(0, Math.min(1, to));
    if (!this.volumeControl || ms <= 0 || Math.abs(target - from) < 0.005) {
      if (this.volumeControl) el.volume = target;
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

  // ── what the elements report ──────────────────────────────────────────────

  private onEnded(el: HTMLAudioElement) {
    // During a fade the outgoing element ends on its own; that is the ramp
    // completing, not the record advancing.
    if (this.fade && el === this.els()[this.fade.from]) return;
    // Likewise an element that is no longer the audible one. A crossfade that
    // has already swapped roles leaves the retired track to finish in silence,
    // and reading that as an advance skips a song.
    if (el !== this.live()) return;

    if (this.inGap) {
      this.note("silence ended");
      this.endGap();
      return;
    }

    this.note("ended", `t=${el.currentTime.toFixed(1)}`);
    const to = this.advanceTarget();
    if (to < 0) {
      // The record is over. Put the level back in case a tail ramp took it
      // down on the way here — repeat-all switched off mid-fade, say — so the
      // next press of play is not answered with silence.
      if (this.volumeControl) el.volume = this.volume;
      this.playing = false;
      this.wantPlaying = false;
      this.position = this.duration();
      this.stopTicking();
      this.emit();
      this.publishMediaSession();
      return;
    }

    /* Crossfade on means the tracks overlap and there is no silence to sit in.
       Arriving here with it on means the ramp never got going — a track shorter
       than the window, or a next file that would not start — so advance plainly
       rather than inventing a pause the listener switched off. */
    if (this.crossfading()) {
      void this.playTrack(to);
      return;
    }

    this.beginGap(to);
  }

  /**
   * The element stopped and nobody here asked it to.
   *
   * A phone call, Siri, a headset pulled out, another app taking the audio.
   * The transport has to say so: left alone it went on showing a pause button
   * and telling the lock screen it was playing, over a record that had
   * stopped. It does not try to resume — the listener presses play when they
   * are ready, which is what a stop they did not choose deserves.
   *
   * Everything the engine pauses itself is filtered out first: a track's own
   * end fires `pause` just before `ended`, a fade-out pauses after `playing`
   * has already gone false, and a source swapped on a playing element has been
   * told to play again before this event is delivered.
   */
  private onPause(el: HTMLAudioElement) {
    if (!this.pair || el !== this.pair[this.liveIndex]) return;
    if (!el.paused || el.ended) return;
    if (!this.playing) return;

    this.note("paused from outside", `t=${el.currentTime.toFixed(1)}`);
    this.wantPlaying = false;
    this.rev++;
    this.stopKeeper();
    this.cancelFade();
    this.cancelRamp(false);
    if (!this.inGap) this.position = el.currentTime;
    this.cancelGap();
    if (this.volumeControl) el.volume = this.volume;
    this.playing = false;
    this.stopTicking();
    this.emit();
    this.publishMediaSession();
  }

  private onError(el: HTMLAudioElement) {
    if (!this.pair || el !== this.pair[this.liveIndex]) return;
    this.note("error", `code=${el.error?.code ?? "?"}`);

    if (this.inGap) {
      // The silence failed, which is no reason to stop the record.
      this.endGap();
      return;
    }

    this.troubleFrom(el, "unplayable");
    if (this.playing && el.paused) {
      this.playing = false;
      this.wantPlaying = false;
      this.stopTicking();
      this.emit();
      this.publishMediaSession();
    }
  }

  private troubleFrom(el: HTMLAudioElement, v: Trouble) {
    if (!this.pair || el !== this.pair[this.liveIndex]) return;
    if (v === "buffering") this.note("waiting");
    /* Buffering must never overwrite a track that has already failed: a dead
       element fires `waiting` on the way to giving up, and the last word in
       would have been the reassuring one. */
    if (v === "buffering" && this.trouble === "unplayable") return;
    this.setTrouble(v);
  }

  /**
   * Where the record goes when this track ends, or -1 if it stops there.
   *
   * Repeat-one is an advance to the same index rather than a special case that
   * restarts the element, so the one song loops through the same ramp down,
   * silence and ramp up as any other pair of tracks.
   */
  private advanceTarget(): number {
    if (this.tracks.length === 0) return -1;
    if (this.repeat === "one") return this.index;
    return this.nextIndex();
  }

  /**
   * The next index, or -1 if the record stops here.
   *
   * Asked repeatedly and speculatively: `tick` calls it on every
   * quarter-second of a track's last seconds, and every snapshot asks it for
   * the bar's "Up next". So it has to answer the same way every time and do no
   * work on the second ask — which rules out what used to be here, a fresh
   * random index per call, and rules out reshuffling on the wrap. The one
   * thing it does write is the order itself, once, if shuffle is on and
   * nothing has built one yet.
   */
  private nextIndex(): number {
    const n = this.tracks.length;
    if (n === 0) return -1;

    const order = this.shuffle ? this.currentOrder() : null;
    if (order) {
      const at = order.indexOf(this.tracks[this.index]?.id ?? "");
      // Not in the order — the queue changed under us. Start it again.
      const pick =
        at < 0
          ? order[0]
          : at + 1 < order.length
            ? order[at + 1]
            : this.repeat === "all"
              ? order[0]
              : undefined;
      return pick === undefined ? -1 : this.tracks.findIndex((t) => t.id === pick);
    }

    const i = this.index + 1;
    if (i >= n) return this.repeat === "all" ? 0 : -1;
    return i;
  }

  /** The shuffle order, built on the first ask if the queue arrived after it. */
  private currentOrder(): string[] {
    if (!this.order || !this.orderFits(this.order)) this.order = this.buildOrder();
    return this.order;
  }

  /** The index before this one, which shuffle makes a question about order. */
  private previousIndex(): number {
    const n = this.tracks.length;
    if (n === 0) return -1;

    const order = this.shuffle ? this.currentOrder() : null;
    if (order) {
      const at = order.indexOf(this.tracks[this.index]?.id ?? "");
      const pick = at <= 0 ? order[order.length - 1] : order[at - 1];
      return this.tracks.findIndex((t) => t.id === pick);
    }

    return (this.index - 1 + n) % n;
  }

  // ── lock screen ───────────────────────────────────────────────────────────

  /**
   * Put this engine's handlers on the lock screen.
   *
   * Once per ownership, not on every publish — the handlers close over the
   * engine, not over a track, so there is nothing to refresh. Each action in
   * its own try: they used to share one with the metadata, so a browser that
   * threw on any of them, or on `MediaMetadata` itself, silently lost every
   * button after it, previous and next included.
   */
  private claimSession() {
    const session = mediaSession();
    if (!session || sessionOwner === this) return;
    sessionOwner = this;

    const handlers: Record<(typeof ANSWERED)[number], MediaSessionActionHandler> = {
      play: () => void this.play(),
      pause: () => this.pause(),
      previoustrack: () => void this.previous(),
      nexttrack: () => void this.next(),
      seekto: (details) => {
        if (typeof details.seekTime === "number") this.seek(details.seekTime);
      },
    };
    for (const action of ANSWERED) {
      try {
        session.setActionHandler(action, handlers[action]);
      } catch {
        this.note("lock screen has no", action);
      }
    }
    for (const action of DECLINED) {
      try {
        session.setActionHandler(action, null);
      } catch {
        /* not an action this browser knows, which is the same answer */
      }
    }
  }

  /** Hand the lock screen back, if it is still ours to hand back. */
  private releaseSession() {
    const session = mediaSession();
    if (!session || sessionOwner !== this) return;
    sessionOwner = null;
    for (const action of ANSWERED) {
      try {
        session.setActionHandler(action, null);
      } catch {
        /* never registered */
      }
    }
    try {
      session.metadata = null;
    } catch {
      /* nothing to clear */
    }
    try {
      session.playbackState = "none";
    } catch {
      /* nothing to clear */
    }
  }

  private publishMediaSession() {
    const session = mediaSession();
    if (!session || sessionOwner !== this) return;
    const track = this.tracks[this.index];
    if (!track) return;

    try {
      /* The artist and the record, not just the song. On a lock screen or a
         car stereo this metadata is the only thing identifying what is
         playing, and a bare title there reads as an untitled file rather than
         as a track off a record somebody sent you. The sleeve comes along for
         the same reason — the artwork slot is the largest thing on that
         screen, and left empty it draws a grey box.

         `sizes` is a guess by necessity: the cover is scaled to a 1400px long
         edge on upload but is not square, and the platform only uses this to
         pick between candidates. One entry means there is nothing to pick. */
      session.metadata = new MediaMetadata({
        title: track.title,
        artist: this.meta.artist,
        album: this.meta.album,
        artwork: this.meta.coverUrl
          ? [{ src: this.meta.coverUrl, sizes: "1400x1400", type: "image/jpeg" }]
          : [],
      });
    } catch {
      this.note("lock screen refused metadata");
    }

    try {
      session.playbackState = this.playing ? "playing" : "paused";
    } catch {
      /* the platform keeps its own idea of this */
    }

    this.publishPosition();
  }

  /**
   * Keep the lock screen's progress bar honest.
   *
   * Separate from the metadata because it is published far more often — every
   * tick, rather than every track change — and because a duration of zero or a
   * position past the end throws rather than being ignored, which would take
   * the whole tick down with it.
   */
  private publishPosition() {
    const session = mediaSession();
    if (!session || sessionOwner !== this) return;
    if (typeof session.setPositionState !== "function") return;

    /* Between tracks there is no position to give. Published as zero at full
       speed, the lock screen counts it up by itself — which is how it showed
       a minute into a song that had not started. Cleared, it shows none. */
    if (this.inGap || this.keeper) {
      try {
        session.setPositionState();
      } catch {
        /* nothing to clear */
      }
      return;
    }

    const duration = this.duration();
    if (!Number.isFinite(duration) || duration <= 0) return;

    try {
      session.setPositionState({
        duration,
        position: Math.max(0, Math.min(duration, this.position)),
        playbackRate: 1,
      });
    } catch {
      /* a position the platform would not take; the bar simply does not move */
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

  private setTrouble(v: Trouble) {
    if (this.trouble === v) return;
    this.trouble = v;
    this.emit();
  }

  /**
   * Tear down: silence, unhook, and give the lock screen back.
   *
   * The engine survives it. React's strict mode runs every cleanup once on
   * mount and then sets the component up again around the same engine, so a
   * teardown that left it unusable would leave the dev build with no sound.
   * The next call that wants an element builds a fresh pair; everything that
   * was in flight has been overtaken, and the revision says so.
   */
  destroy() {
    this.rev++;
    this.wantPlaying = false;
    this.playing = false;
    this.stopKeeper();
    this.stopTicking();
    this.cancelGap();
    this.cancelRamp(false);
    this.pendingFade = null;
    this.fade = null;
    this.releaseSession();

    this.wiring?.abort();
    this.wiring = null;
    // Only what was actually built. Reaching through the accessor here would
    // create two elements for the sole purpose of tearing them down.
    for (const el of this.pair ?? []) {
      el.pause();
      /* `removeAttribute`, not `src = ""` — the empty string resolves against
         the page, so every teardown sent the element off to fetch the HTML
         document and read it as audio. The same trap releaseSource documents. */
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
        /* nothing to reset */
      }
    }
    this.pair = null;
    this.blessed = new WeakSet();
    this.liveIndex = 0;
    this.loaded = [null, null];
    this.listeners.clear();
  }
}

