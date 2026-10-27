import { afterEach, beforeEach, describe, test } from "node:test";
import assert from "node:assert/strict";

import type { Track } from "@/data/types";
import { PlayerEngine } from "./engine.ts";
import { FakeAudio, flush, install, type Env } from "./fakes.test-support.ts";

const track = (id: string, seconds = 200): Track => ({
  id,
  title: `Track ${id}`,
  seconds,
  hidden: false,
  position: 0,
});

const ALBUM = [track("a"), track("b"), track("c")];
const META = { artist: "Joshua Davis", album: "Shadow Harbor" };

let env: Env;
let engine: PlayerEngine;

function fresh(tracks = ALBUM) {
  const e = new PlayerEngine();
  e.load("shadow-harbor", tracks, "flac", META);
  return e;
}

/** The element that is sounding, which is whichever one is not paused. */
function audible(): FakeAudio | undefined {
  return FakeAudio.all.find((el) => !el.paused);
}

const isTrack = (el: FakeAudio | undefined, id: string) =>
  Boolean(el?.src.includes(`/tracks/${id}/audio`));

/** The element playing a track, as opposed to the silence. */
const sounding = () => FakeAudio.all.find((e) => !e.paused && e.src.includes("/tracks/"));
/** The element playing the silence, if one is. */
const silent = () => FakeAudio.all.find((e) => !e.paused && e.src.startsWith("data:"));

/** Let the current track end, then the silence after it. */
async function crossSeam() {
  const track = sounding()!;
  track.setDuration(200);
  track.finish();
  await flush();
  const gap = silent()!;
  gap.setDuration(3);
  gap.finish();
  await flush();
}

beforeEach(() => {
  env = install();
  engine = fresh();
});

afterEach(() => {
  engine.destroy();
  env.restore();
});

// ── F1 · the seam between tracks must not wait on a timer ─────────────────

describe("advancing with crossfade off", () => {
  test("the element keeps sounding through the silence, so a locked phone keeps the page", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.setDuration(200);

    el.finish();
    await flush();

    assert.equal(engine.snapshot().index, 1, "the next track is current at once");
    assert.equal(engine.snapshot().playing, true);
    assert.equal(el.paused, false, "the live element is still playing, not waiting on a timer");
  });

  test("three tracks in a row advance on media events alone, with every timer frozen", async () => {
    await engine.playTrack(0);
    for (const id of ["b", "c"]) {
      await crossSeam();
      assert.ok(isTrack(sounding(), id), `track ${id} is playing without a timer firing`);
      assert.equal(silent(), undefined, "and the silence has stopped");
    }
    assert.equal(engine.snapshot().index, 2);
    assert.equal(FakeAudio.all.length, 2, "the same two elements throughout");
  });

  test("the next file starts arriving while the silence plays", async () => {
    await engine.playTrack(0);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    const next = FakeAudio.all.find((e) => e !== silent())!;
    assert.ok(isTrack(next, "b"));
    assert.equal(next.preload, "auto");
  });

  test("a slow next file keeps the silence playing until the track sounds", async () => {
    await engine.playTrack(0);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    const gap = silent()!;
    FakeAudio.deferPlay = true;
    gap.setDuration(3);
    gap.finish();
    await flush();

    assert.equal(gap.paused, false, "the silence goes on");
    assert.equal(gap.loop, true, "on a loop, not a timer");
    const next = FakeAudio.all.find((e) => e !== gap)!;
    assert.ok(isTrack(next, "b"));
    assert.equal(engine.snapshot().playing, true);

    next.plays.at(-1)!.resolve();
    await flush();
    assert.equal(gap.paused, true, "the silence stops once the track sounds");
    assert.equal(gap.loop, false);
  });

  test("an element the phone will not start hands the track back to the one that was playing", async () => {
    await engine.playTrack(0);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    const gap = silent()!;
    FakeAudio.deferPlay = true;
    gap.setDuration(3);
    gap.finish();
    await flush();
    const next = FakeAudio.all.find((e) => e !== gap)!;
    next.plays.at(-1)!.reject("NotAllowedError");
    await flush();

    assert.ok(isTrack(gap, "b"), "the track went to the element that was allowed");
    gap.plays.at(-1)!.resolve();
    await flush();
    assert.equal(engine.snapshot().playing, true);
    assert.equal(engine.snapshot().trouble, null);
  });

  test("pausing while the next file arrives stops the silence too", async () => {
    await engine.playTrack(0);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    const gap = silent()!;
    FakeAudio.deferPlay = true;
    gap.setDuration(3);
    gap.finish();
    await flush();

    engine.pause();
    await env.clock.advance(1000);
    assert.equal(gap.paused, true);
    assert.equal(engine.snapshot().playing, false);
  });

  test("the lock screen is given no running clock between tracks", async () => {
    await engine.playTrack(0);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    assert.equal(env.session.positions.at(-1), undefined, "position cleared in the silence");
  });

  test("the first tap also starts the other element, so it may start by itself later", async () => {
    await engine.playTrack(0);
    const other = FakeAudio.all.find((e) => !isTrack(e, "a"))!;
    assert.equal(other.playCalls, 1);
    assert.equal(other.paused, true, "and stops it at once");
  });

  test("the silence is three seconds of real audio, and the bar holds the next track at 0:00", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.setDuration(200);
    el.finish();
    await flush();

    assert.match(el.src, /^data:audio\/wav;base64,/);
    el.setDuration(3);
    el.currentTime = 1.5;
    await env.clock.advance(250);
    const s = engine.snapshot();
    assert.equal(s.position, 0, "the clock does not run during the silence");
    assert.equal(s.duration, 200, "the length shown is the next track's, not the silence's");
  });

  test("pausing in the silence stops there, and play starts the cued track", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.setDuration(200);
    el.finish();
    await flush();

    engine.pause();
    await env.clock.advance(1000);
    assert.equal(el.paused, true);
    assert.equal(engine.snapshot().playing, false);
    assert.equal(engine.snapshot().index, 1);

    await engine.play();
    assert.ok(isTrack(el, "b"));
    assert.equal(el.paused, false);
  });

  test("a fade-in starved of timers still arrives on the element's own clock", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    assert.ok(el.volume < 0.85, "starts below full");
    env.clock.jump(5000); // timers frozen, as in a throttled page
    el.fire("timeupdate");
    assert.equal(el.volume, 0.85);
  });

  test("the last track of a record stops instead of going into a silence", async () => {
    await engine.playTrack(2);
    const el = audible()!;
    el.setDuration(200);
    el.finish();
    await flush();
    assert.equal(engine.snapshot().playing, false);
    assert.equal(engine.snapshot().index, 2);
    assert.ok(isTrack(el, "c"));
  });

  test("repeat-one comes back round through the same silence", async () => {
    engine.cycleRepeat();
    engine.cycleRepeat();
    assert.equal(engine.snapshot().repeat, "one");
    await engine.playTrack(1);
    const track = sounding()!;
    track.setDuration(200);
    track.finish();
    await flush();
    assert.equal(engine.snapshot().index, 1);
    const gap = silent()!;
    gap.setDuration(3);
    gap.finish();
    await flush();
    assert.ok(isTrack(sounding(), "b"));
  });

  test("repeat-all wraps from the last track to the first", async () => {
    engine.cycleRepeat();
    await engine.playTrack(2);
    await crossSeam();
    assert.equal(engine.snapshot().index, 0);
    assert.ok(isTrack(sounding(), "a"));
  });
});

// ── F2 · an older play() must not overrule a newer one ─────────────────────

describe("superseded play requests", () => {
  test("A rejecting after B succeeded leaves B playing and nothing marked broken", async () => {
    FakeAudio.deferPlay = true;
    void engine.playTrack(0);
    void engine.playTrack(1);
    const el = FakeAudio.all.find((e) => e.plays.length === 2)!;

    el.plays[1].resolve();
    await flush();
    el.plays[0].reject("AbortError");
    await flush();

    const s = engine.snapshot();
    assert.equal(s.index, 1);
    assert.equal(s.playing, true);
    assert.equal(s.trouble, null);
  });

  test("a pause before play resolves wins", async () => {
    FakeAudio.deferPlay = true;
    void engine.playTrack(0);
    engine.pause();
    const el = FakeAudio.all.find((e) => e.plays.length === 1)!;
    el.plays[0].resolve();
    await env.clock.advance(1000);

    assert.equal(engine.snapshot().playing, false);
    assert.equal(el.paused, true, "the element was stopped, not left sounding");
    assert.equal(env.clock.pending, 0, "no clock left running");
  });

  test("a play resolving after destroy changes nothing", async () => {
    FakeAudio.deferPlay = true;
    const seen: boolean[] = [];
    engine.subscribe((s) => seen.push(s.playing));
    void engine.playTrack(0);
    const el = FakeAudio.all.find((e) => e.plays.length === 1)!;
    engine.destroy();
    el.plays[0].resolve();
    await env.clock.advance(1000);

    assert.ok(!seen.includes(true));
    assert.equal(el.paused, true);
    assert.equal(env.clock.pending, 0);
  });

  test("a genuine failure still says Won't load", async () => {
    FakeAudio.deferPlay = true;
    void engine.playTrack(0);
    const el = FakeAudio.all.find((e) => e.plays.length === 1)!;
    el.plays[0].reject("NotSupportedError");
    await flush();
    assert.equal(engine.snapshot().trouble, "unplayable");
    assert.equal(engine.snapshot().playing, false);
  });
});

// ── F3 · one crossfade at a time, and none after a stop ────────────────────

describe("crossfade", () => {
  async function nearTheEnd() {
    engine.setCrossfade(true);
    await engine.playTrack(0);
    const live = audible()!;
    live.setDuration(200);
    live.currentTime = 197;
    FakeAudio.deferPlay = true;
    return live;
  }

  test("a slow incoming track is asked for once, not once per tick", async () => {
    const live = await nearTheEnd();
    const incoming = FakeAudio.all.find((e) => e !== live)!;
    const before = incoming.playCalls;
    await env.clock.advance(1000);
    assert.equal(incoming.playCalls - before, 1);
    assert.equal(incoming.srcHistory.filter((src) => src.includes("/tracks/")).length, 1);
  });

  test("a pause while the incoming track is starting is not undone when it starts", async () => {
    const live = await nearTheEnd();
    await env.clock.advance(250);
    const incoming = FakeAudio.all.find((e) => e !== live)!;
    engine.pause();
    incoming.plays.at(-1)!.resolve();
    await env.clock.advance(5000);

    assert.equal(engine.snapshot().playing, false);
    assert.equal(engine.snapshot().index, 0);
    assert.equal(incoming.paused, true, "the incoming element is silent");
  });

  test("a refused incoming track falls back to a plain advance, once", async () => {
    const live = await nearTheEnd();
    const incoming = FakeAudio.all.find((e) => e !== live)!;
    const before = incoming.playCalls;
    await env.clock.advance(250);
    incoming.plays.at(-1)!.reject("NotAllowedError");
    await env.clock.advance(1000);
    assert.equal(incoming.playCalls - before, 1, "not retried every tick");

    FakeAudio.deferPlay = false;
    live.finish();
    await flush();
    assert.equal(engine.snapshot().index, 1);
    assert.ok(isTrack(live, "b"), "advanced on the element the listener started");
  });

  test("a completed crossfade hands over the record", async () => {
    const live = await nearTheEnd();
    FakeAudio.deferPlay = false;
    await env.clock.advance(5000);
    const incoming = FakeAudio.all.find((e) => e !== live)!;
    assert.equal(engine.snapshot().index, 1);
    assert.equal(incoming.paused, false);
    assert.equal(live.paused, true);
  });
});

// ── F4, F5 · the lock screen ───────────────────────────────────────────────

describe("media session", () => {
  test("previous and next register even when metadata throws", async () => {
    env.breakMetadata(true);
    await engine.playTrack(0);
    for (const a of ["play", "pause", "previoustrack", "nexttrack"]) {
      assert.equal(typeof env.session.handlers.get(a), "function", a);
    }
  });

  test("one unsupported action does not take the others with it", async () => {
    env.session.unsupported.add("previoustrack");
    env.session.unsupported.add("seekbackward");
    await engine.playTrack(0);
    for (const a of ["play", "pause", "nexttrack", "seekto"]) {
      assert.equal(typeof env.session.handlers.get(a), "function", a);
    }
  });

  test("ten-second skips are cleared, so the lock screen shows tracks", async () => {
    env.session.handlers.set("seekforward", () => {});
    await engine.playTrack(0);
    assert.equal(env.session.handlers.get("seekforward"), null);
    assert.equal(env.session.handlers.get("seekbackward"), null);
  });

  test("the lock screen's next button advances", async () => {
    await engine.playTrack(0);
    env.session.press("nexttrack");
    await flush();
    assert.equal(engine.snapshot().index, 1);
  });

  test("destroy hands the lock screen back", async () => {
    await engine.playTrack(0);
    engine.destroy();
    for (const a of ["play", "pause", "previoustrack", "nexttrack", "seekto"]) {
      assert.equal(env.session.handlers.get(a) ?? null, null, a);
    }
    assert.equal(env.session.metadata, null);
    assert.equal(env.session.playbackState, "none");
  });

  test("an old engine's teardown leaves a newer engine's controls alone", async () => {
    await engine.playTrack(0);
    const next = fresh();
    await next.playTrack(0);
    const handler = env.session.handlers.get("nexttrack");
    engine.destroy();
    assert.equal(env.session.handlers.get("nexttrack"), handler);
    next.destroy();
  });
});

// ── F6 · the transport says what the element is doing ──────────────────────

describe("pauses from outside", () => {
  test("an interruption that pauses the element reads as paused", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.pause(); // a phone call, a headset pulled
    await flush();
    assert.equal(engine.snapshot().playing, false);
    assert.equal(env.session.playbackState, "paused");
    assert.equal(env.clock.pending, 0, "no clock left running");
  });

  test("the pause a browser fires at a track's end is not an interruption", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.setDuration(200);
    el.finish();
    await flush();
    assert.equal(engine.snapshot().playing, true);
  });

  test("an error on the playing track says so and stops the clock", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    el.paused = true;
    el.fire("error");
    await flush();
    assert.equal(engine.snapshot().trouble, "unplayable");
    assert.equal(engine.snapshot().playing, false);
  });
});

// ── F8 · the queue is tracks, not positions ────────────────────────────────

describe("queue changes", () => {
  test("a reordered queue keeps the playing track current", async () => {
    await engine.playTrack(0);
    engine.load("shadow-harbor", [ALBUM[1], ALBUM[0], ALBUM[2]], "flac", META);
    assert.equal(engine.snapshot().index, 1, "still on track a, now second");
  });

  test("index 0 of a reordered queue is the new first track", async () => {
    await engine.playTrack(0);
    engine.load("shadow-harbor", [ALBUM[1], ALBUM[0], ALBUM[2]], "flac", META);
    await engine.playTrack(0);
    assert.ok(isTrack(audible(), "b"));
  });
});

// ── the rest of the transport, as it stands ────────────────────────────────

describe("transport semantics", () => {
  test("repeat cycles off, all, one, off", () => {
    const seen = [engine.snapshot().repeat];
    for (let i = 0; i < 3; i++) {
      engine.cycleRepeat();
      seen.push(engine.snapshot().repeat);
    }
    assert.deepEqual(seen, ["off", "all", "one", "off"]);
  });

  test("previous restarts a track more than three seconds in", async () => {
    await engine.playTrack(1);
    const el = audible()!;
    el.currentTime = 10;
    await env.clock.advance(250);
    await engine.previous();
    assert.equal(engine.snapshot().index, 1);
    assert.equal(el.currentTime, 0);
  });

  test("previous at the top of the first track wraps to the last", async () => {
    await engine.playTrack(0);
    await engine.previous();
    assert.equal(engine.snapshot().index, 2);
  });

  test("next on the last track with repeat off stops", async () => {
    await engine.playTrack(2);
    await engine.next();
    await env.clock.advance(1000);
    assert.equal(engine.snapshot().playing, false);
  });

  test("shuffle plays every track once, starting from the current one", async () => {
    const many = Array.from({ length: 8 }, (_, i) => track(String(i)));
    engine.load("shadow-harbor", many, "flac", META);
    await engine.playTrack(3);
    engine.setShuffle(true);
    const order = [engine.snapshot().index];
    for (let i = 0; i < 7; i++) {
      await engine.next();
      order.push(engine.snapshot().index);
    }
    assert.equal(order[0], 3);
    assert.deepEqual([...order].sort(), many.map((_, i) => i).sort());
  });

  test("the bar's length follows the file once the file reports one", async () => {
    await engine.playTrack(0);
    audible()!.setDuration(212.4);
    await env.clock.advance(250);
    assert.equal(engine.snapshot().duration, 212.4);
  });

  test("Up next names the following track, shuffle included", async () => {
    await engine.playTrack(0);
    assert.equal(engine.snapshot().upNext, 1);
    await engine.playTrack(2);
    assert.equal(engine.snapshot().upNext, -1);
    engine.cycleRepeat();
    assert.equal(engine.snapshot().upNext, 0);
  });
});

// ── decisions the owner made on 2026-10-27 ─────────────────────────────────

describe("skipping while paused", () => {
  test("next cues the following track and stays paused", async () => {
    await engine.playTrack(0);
    engine.pause();
    await env.clock.advance(1000);
    const el = FakeAudio.all.find((e) => e.playCalls > 0)!;
    const calls = el.playCalls;

    await engine.next();
    assert.equal(engine.snapshot().index, 1);
    assert.equal(engine.snapshot().playing, false);
    assert.equal(engine.snapshot().position, 0);
    assert.equal(el.playCalls, calls, "nothing was started");

    await engine.play();
    assert.ok(isTrack(el, "b"), "play starts the cued track");
  });

  test("the lock screen's previous behaves the same", async () => {
    await engine.playTrack(1);
    engine.pause();
    env.session.press("previoustrack");
    await flush();
    assert.equal(engine.snapshot().index, 0);
    assert.equal(engine.snapshot().playing, false);
  });

  test("a track row still plays when paused", async () => {
    await engine.playTrack(0);
    engine.pause();
    await engine.playTrack(2);
    assert.equal(engine.snapshot().playing, true);
  });
});

describe("a platform that owns the volume", () => {
  beforeEach(() => {
    engine.destroy();
    FakeAudio.volumeLocked = true;
    engine = fresh();
    engine.prepare();
  });

  test("says so, so the bar can drop the controls", () => {
    assert.equal(engine.snapshot().volumeControl, false);
  });

  test("ignores a saved crossfade and keeps the gap", async () => {
    engine.setCrossfade(true);
    await engine.playTrack(0);
    const el = audible()!;
    el.setDuration(200);
    el.currentTime = 197;
    await env.clock.advance(1000);
    assert.ok(!FakeAudio.all.some((e) => isTrack(e, "b")), "nothing started early to overlap");
    el.finish();
    await flush();
    assert.match(el.src, /^data:audio\/wav/);
  });

  test("pauses at once, with no fade nobody can hear", async () => {
    await engine.playTrack(0);
    const el = audible()!;
    engine.pause();
    assert.equal(el.paused, true);
  });
});

describe("a track taken out of the queue while it plays", () => {
  test("stops, rather than playing a song the bar no longer names", async () => {
    await engine.playTrack(1);
    const el = audible()!;
    engine.load("shadow-harbor", [ALBUM[0], ALBUM[2]], "flac", META);
    assert.equal(engine.snapshot().playing, false);
    assert.equal(el.paused, true);
    assert.equal(engine.snapshot().index, 1);
  });
});
