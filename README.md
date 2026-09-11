# Shadow Harbor

An invitation-only album player. A visitor lands on a catalog of records; each
record sits behind its own short access phrase, sent out by hand. Enter the
phrase and that one record opens — its cover, its notes, its tracks, and a fixed
player at the bottom of the screen. No accounts, nothing to remember. Behind a
separate key there is an admin area — the desk — where the owner adds records,
uploads audio, sets phrases, and publishes.

One owner. Mobile first.

## Running it

```
npm install
npm run dev
```

`npm run build` for a production build, `npm run typecheck` to check types
without emitting.

## The stack

- **Next.js (App Router) + TypeScript.** The routes map onto the screens, and
  server components are how a locked record's track list and file URLs stay off
  the client without anyone having to remember to strip them.
- **Netlify DB** for the catalog. `@netlify/database` provisions Postgres on
  first deploy; migrations live in `netlify/database/migrations/`. Each deploy
  preview gets its own database branch.
- **Netlify Blobs** for audio and cover art.
- **Plain CSS modules** over the ported Timber & Ink tokens. This design is
  almost entirely bespoke layout; a utility framework would fight it.

One deliberate departure from `design_handoff_shadow_harbor/BUILD.md`: it plans
on S3 signed URLs, and Netlify Blobs has no signed-URL feature. Audio instead
streams through a function that checks the per-record cookie and handles Range
requests itself. That verifies authorization on every byte range rather than
once at handoff, at the cost of not being able to hand playback off to the CDN.

## Layout

```
src/
  app/        the routes — catalog · record (gate + album) · admin (desk · editor · sign-in)
  ui/         tokens.css, the type scale, and the decorative devices
  chrome/     background layers, admin bar, toast slot
  data/       types, phrase normalization, the catalog client
  player/     audio engine, player bar, progress, volume   (milestone 3)
netlify/
  database/migrations/
design_handoff_shadow_harbor/
  README.md   the design spec
  BUILD.md    data model, endpoints, milestones
  design/     the prototype — reference only, never imported, never shipped
```

`CLAUDE.md` at the root is the standing brief. Read it, the design spec, and the
build plan before writing code.

## Where this is

Milestone 1 of six. See `design_handoff_shadow_harbor/BUILD.md` for the rest.

- [x] **1 — Shell and tokens.** Ported tokens, the four background layers, the
      decorative devices, the type scale, route skeletons.
- [ ] **2 — Catalog and gate, for real.** Schema, seed, the unlock endpoint with
      hashing and rate limiting, the per-record cookie.
- [ ] **3 — The player.** Audio storage, two elements, seek, shuffle, repeat,
      volume, crossfade, Media Session.
- [ ] **4 — The desk.** Admin auth, record CRUD, reorder, upload, site text.
- [ ] **5 — Offline.** Service worker, manifest, cache-per-track.
- [ ] **6 — Hardening.** Rate limits, audit logging, a keyboard pass, Lighthouse
      on a throttled phone.

`src/data/seed.ts` is scaffolding for milestone 1 and gets deleted in milestone
2. It carries no phrases — the prototype kept those in the browser, and the way
to not carry that forward is to never let one into the client bundle.

## Still needed

- **Cover art and audio.** None was supplied with the handoff. The desk will
  have upload paths for both, but there is nothing to listen to until real media
  exists.
- **Answers to the open questions** at the bottom of `CLAUDE.md` — whether
  phrases expire, whether download links ship, whether like counts are shared.
