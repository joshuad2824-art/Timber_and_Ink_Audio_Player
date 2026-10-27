/**
 * Stand-ins for the browser, for the engine's tests.
 *
 * The engine only ever touches four things a browser provides: `Audio`, the
 * timers, `performance.now`, and `navigator.mediaSession`. Each is replaced
 * here by something a test can hold still and step by hand, which is the only
 * way to ask what happens when a timer never fires (a locked phone) or a
 * `play()` promise settles late and out of order (a slow network).
 *
 * None of this simulates iOS. It reproduces the engine's own logic under
 * conditions a phone can produce; whether a phone does produce them is a
 * question for a phone.
 */

type Timer = { id: number; at: number; every: number | null; fn: () => void };

export class FakeClock {
  now = 0;
  private timers: Timer[] = [];
  private nextId = 1;

  setTimeout = (fn: () => void, ms = 0) => this.add(fn, ms, null);
  setInterval = (fn: () => void, ms = 0) => this.add(fn, ms, Math.max(1, ms));
  clearTimeout = (id?: number) => {
    this.timers = this.timers.filter((t) => t.id !== id);
  };
  clearInterval = this.clearTimeout;

  private add(fn: () => void, ms: number, every: number | null) {
    const id = this.nextId++;
    this.timers.push({ id, at: this.now + Math.max(0, ms), every, fn });
    return id;
  }

  get pending() {
    return this.timers.length;
  }

  /** Move time on, running every timer that falls due, in order. */
  async advance(ms: number) {
    const end = this.now + ms;
    for (;;) {
      await flush();
      const due = this.timers
        .filter((t) => t.at <= end)
        .sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) break;
      this.now = due.at;
      if (due.every === null) this.clearTimeout(due.id);
      else due.at += due.every;
      due.fn();
    }
    this.now = end;
    await flush();
  }

  /** Move time on without running anything: a page whose timers are frozen. */
  jump(ms: number) {
    this.now += ms;
  }
}

/** Let every queued promise callback run. */
export async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

type Deferred = {
  resolve: () => void;
  reject: (name?: string) => void;
  settled: boolean;
};

/**
 * An audio element with nothing behind it.
 *
 * `play()` resolves on its own unless `deferPlay` is set, in which case each
 * call is held in `plays` for the test to settle in whatever order it likes.
 * `finish()` is a track reaching its natural end, with the `pause` the spec
 * fires just before `ended`.
 */
export class FakeAudio extends EventTarget {
  static all: FakeAudio[] = [];
  /** iOS: the property reads 1 and writing it does nothing. */
  static volumeLocked = false;
  static deferPlay = false;

  srcHistory: string[] = [];
  playCalls = 0;
  plays: Deferred[] = [];
  paused = true;
  ended = false;
  currentTime = 0;
  duration = NaN;
  preload = "auto";
  private _src = "";
  private _volume = 1;

  constructor() {
    super();
    FakeAudio.all.push(this);
  }

  get src() {
    return this._src;
  }
  set src(v: string) {
    this._src = v;
    this.srcHistory.push(v);
    this.ended = false;
    this.currentTime = 0;
    this.duration = NaN;
  }

  get volume() {
    return FakeAudio.volumeLocked ? 1 : this._volume;
  }
  set volume(v: number) {
    if (v < 0 || v > 1) throw new RangeError(`volume ${v}`);
    if (!FakeAudio.volumeLocked) this._volume = v;
  }

  removeAttribute(name: string) {
    if (name === "src") this._src = "";
  }

  load() {}

  play(): Promise<void> {
    this.playCalls++;
    this.paused = false;
    this.ended = false;
    return new Promise<void>((resolve, reject) => {
      const d: Deferred = {
        settled: false,
        resolve: () => {
          if (d.settled) return;
          d.settled = true;
          resolve();
          this.fire("playing");
        },
        reject: (name = "NotSupportedError") => {
          if (d.settled) return;
          d.settled = true;
          this.paused = true;
          reject(new DOMException("refused", name));
        },
      };
      this.plays.push(d);
      if (!FakeAudio.deferPlay) d.resolve();
    });
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.fire("pause");
  }

  /** Report a length, as `loadedmetadata` would. */
  setDuration(seconds: number) {
    this.duration = seconds;
  }

  /** The file plays out to its last sample. */
  finish() {
    if (Number.isFinite(this.duration)) this.currentTime = this.duration;
    this.paused = true;
    this.ended = true;
    this.fire("pause");
    this.fire("ended");
  }

  fire(name: string) {
    this.dispatchEvent(new Event(name));
  }
}

export class FakeMediaSession {
  handlers = new Map<string, ((d: never) => void) | null>();
  metadata: unknown = null;
  playbackState = "none";
  positions: { duration: number; position: number }[] = [];
  /** Actions this browser does not know, which throw when registered. */
  unsupported = new Set<string>();

  setActionHandler(action: string, fn: ((d: never) => void) | null) {
    if (this.unsupported.has(action)) {
      throw new TypeError(`The provided value '${action}' is not a valid enum value`);
    }
    this.handlers.set(action, fn);
  }

  setPositionState(s: { duration: number; position: number }) {
    this.positions.push(s);
  }

  /** Press a lock-screen button, as the platform would. */
  press(action: string, details: Record<string, unknown> = {}) {
    const fn = this.handlers.get(action);
    if (!fn) throw new Error(`no handler for ${action}`);
    fn(details as never);
  }
}

export type Env = {
  clock: FakeClock;
  session: FakeMediaSession;
  doc: { visibilityState: "visible" | "hidden" } & EventTarget;
  restore: () => void;
  /** Make the MediaMetadata constructor throw, as an old browser might. */
  breakMetadata: (broken: boolean) => void;
};

/** Swap the browser in. Call `restore` when the test is done. */
export function install(): Env {
  const g = globalThis as Record<string, unknown>;
  const saved = new Map<string, PropertyDescriptor | undefined>();
  const put = (key: string, value: unknown) => {
    if (!saved.has(key)) saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  };

  const clock = new FakeClock();
  const session = new FakeMediaSession();
  const doc = Object.assign(new EventTarget(), {
    visibilityState: "visible" as "visible" | "hidden",
  });
  let metadataBroken = false;

  FakeAudio.all = [];
  FakeAudio.volumeLocked = false;
  FakeAudio.deferPlay = false;

  put("Audio", FakeAudio);
  put("setTimeout", clock.setTimeout);
  put("setInterval", clock.setInterval);
  put("clearTimeout", clock.clearTimeout);
  put("clearInterval", clock.clearInterval);
  put("performance", { now: () => clock.now });
  put("navigator", { mediaSession: session });
  put("document", doc);
  put(
    "MediaMetadata",
    class {
      constructor(init: unknown) {
        if (metadataBroken) throw new TypeError("MediaMetadata is not a constructor");
        Object.assign(this, init);
      }
    },
  );

  return {
    clock,
    session,
    doc,
    breakMetadata: (b) => {
      metadataBroken = b;
    },
    restore: () => {
      for (const [key, desc] of saved) {
        if (desc) Object.defineProperty(globalThis, key, desc);
        else delete g[key];
      }
    },
  };
}
