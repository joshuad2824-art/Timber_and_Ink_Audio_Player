# Shadow Harbor — working notes for Claude Code

This is the standing brief; `design_handoff_shadow_harbor/README.md`
is the design spec and `design_handoff_shadow_harbor/BUILD.md` is the implementation plan. Read all three before writing code.

## What this is

An invitation-only album player. Each record is gated by a short access phrase the owner sends
out by hand. One owner, one admin area, no public sign-up. Mobile first.

## Ground rules

1. **`design/` is reference, not source.** `Shadow Harbor.dc.html` runs on a design-tool runtime
   that has no place in this repo. Open it to see intended behavior; re-implement in the real
   stack. Never import from it, never ship `support.js`.
2. **The design system is binding.** Colors, type, spacing, radii, shadows come from
   `design/_ds/timber-ink-design-system-…/tokens/*.css`. Port those tokens once, then reference
   them — no ad-hoc hex values, no new colors.
3. **Exactly one glowing element per view.** That is the amber play button. If something else
   glows, remove it.
4. **Voice is first person singular.** "I", never "we"; suggestion over command; sentence case on
   buttons and nav; no emoji, no exclamation marks, no "simply"/"just". Copy in the prototype is
   final — match it verbatim. New copy goes through the voice rules in the design-system guide.
5. **Every control is ≥44px.** Track rows are 60px. Type never below 10px, and 10–11px is
   reserved for tracked uppercase mono metadata.
6. **Don't add features.** No comments, no sharing, no recommendations, no analytics dashboard,
   no onboarding tour. The list in README is the whole product.

## Structure to aim for

```
src/
  routes/      catalog · record (gate + album) · admin (desk · editor · sign-in)
  player/      audio engine (two elements, crossfade), player bar, progress, volume
  data/        catalog client, types, phrase check
  offline/     Cache API client, keep panel, bookmark button
  ui/          tokens.css + the small set of primitives the design actually uses
  chrome/      admin bar, toast slot, background layers (washes · wear · grain · vignette)
```

The background layer stack and the decorative devices (key-cap chip, pressed-plate chip, tape
strip, paired rule, paper card, photo mat) are used on nearly every screen — build them once as
components; their exact recipes are in README's "Design tokens" section.

## Order of work

Follow the milestones in `BUILD.md`. Short version: shell and tokens → catalog and gate against
a real API → player with real audio → the desk → offline → hardening. Each milestone should be
demoable on a phone before the next one starts.

## Security, plainly

The prototype checks phrases in the browser and prints them on screen. In production:

- Phrase verification happens **server-side**. Track data and signed audio URLs are returned only
  after a phrase check succeeds. Never send a locked record's tracks or file URLs to the client.
- Phrases are stored hashed, compared case-insensitively on normalized whitespace, and
  rate-limited per IP. A successful check sets a scoped, httpOnly, per-record cookie.
- The admin key becomes a real password (hashed, rate-limited) or a single-user OAuth login.
  Every admin endpoint is authorized server-side. Remove the on-screen hints.
- Audio is served from private storage behind short-lived signed URLs, not a public path.

## Settled by the owner

- **Masters are WAV**, uploaded through the desk. The design spec's `0.28 MB/s`
  estimate is exactly 24-bit/48kHz stereo, so assume 24/48 unless told otherwise.
- **Streaming is lossless — FLAC**, not WAV. FLAC decodes bit-identically and
  costs 58% of the bytes, so raw WAV streaming is strictly worse for the same
  result. ~10 MB/minute; a 42-minute album is ~422 MB per full play, all of it
  through a function because Blobs has no signed URLs. That is a bandwidth bill,
  not an engineering limit — roughly 240 album plays per 100 GB.
- **Offline is FLAC, falling back to MP3.** A lossless album is ~422 MB and iOS
  Safari will usually refuse or evict that. Desktop and Android keep lossless;
  an iPhone quietly gets the MP3 rather than a bookmark that lies. The
  `N of M tracks are on this device.` line reads the real Cache API either way.
- **Downloads are MP3**, 320 kbps.
- **Transcoding happens in the owner's browser.** A dropped WAV is turned into
  FLAC and MP3 locally and only those upload, in 3 MB chunks. Netlify caps a
  function request body at a few megabytes and a 42-minute WAV is 727 MB, so the
  master never crosses the wire at all.

  Not ffmpeg.wasm, which this brief used to say: it is 64 MB unpacked for two
  codecs out of several hundred. libFLAC compiled to wasm (~240 KB) and a
  pure-JS MP3 encoder do the same job for about a hundredth of the download.
  The WAV is parsed directly rather than decoded through Web Audio, which can
  resample and returns floats — lossless has to mean the samples in the file.
- **Cover art is scaled in the owner's browser too**, to a 1400px long edge,
  and stored behind the same read check as the tracks — the design shows a
  sleeve on the album screen only, never the catalog. The re-encode also
  strips the EXIF a phone writes, which is where the location of the room the
  photo was taken in would otherwise be.
- **Like counts are real but not social.** Persisted server-side, idempotent per
  device. Nobody is shown who else liked anything.
- **Tracks are spaced, not butted together.** With the Crossfade switch off —
  which is the default — a track's tail ramps down inside its own last 2
  seconds, three seconds of silence follow, and the next one ramps up over 1.6.
  With it on they overlap on the linear ramp instead and there is no silence.
  Nothing starts or stops at full volume either way, a tap on the transport
  included; the last track of a record is the one exception, because an ending
  that was mastered to end is not one to fade. Repeat-one loops through the same
  silence rather than snapping back to zero.
- **Every ramp is eased, not linear.** A raised cosine, flat at both ends: a
  straight line changes volume at a constant rate, so it starts and stops moving
  abruptly even though the level never jumps, and that corner is the part a
  listener hears as the fade beginning. The crossfade is the exception and stays
  linear, because the design spec asks for linear there.
- **The repeat button has three states, in this order**: off, the whole album,
  this song, off again. The bar swaps to the `repeat-1` glyph on the second
  press, which is what distinguishes the last two.
- **Shuffle and repeat are gold when on, cream when off.** They are the only two
  controls that hold a state, so they are the only two that change colour, and
  the rest of the transport sits at the same cream as their off state. Brass
  gold, never amber — a toggle that glowed would be a second lit thing. The
  engaged glyph also carries a heavier stroke, so the state does not rest on
  hue alone.

## Open questions for the owner

Ask before guessing:

- Should a phrase ever expire, or be revocable per person rather than per record?
- One owner forever, or will there be a second person at the desk?
