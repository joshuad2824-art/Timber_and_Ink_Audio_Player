# Shadow Harbor — working notes for Claude Code

Move this file to the repository root. It is the standing brief; `design_handoff_shadow_harbor/README.md`
is the design spec and `BUILD.md` is the implementation plan. Read all three before writing code.

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

## Open questions for the owner

Ask before guessing:

- Where do audio files live, and how big are they? Does the owner upload through the desk, or
  drop files somewhere and have the desk pick them up?
- Should a phrase ever expire, or be revocable per person rather than per record?
- Are download links meant to ship, or were they only for the prototype? If they ship, MP3, WAV,
  or both — and do they need to be gated separately from listening?
- Are like counts real, and shared across listeners, or a private per-device gesture?
- One owner forever, or will there be a second person at the desk?
