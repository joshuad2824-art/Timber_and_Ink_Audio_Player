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

Milestone 4 of six, complete. See `design_handoff_shadow_harbor/BUILD.md` for the rest.

- [x] **1 — Shell and tokens.** Ported tokens, the four background layers, the
      decorative devices, the type scale, route skeletons.
- [x] **2 — Catalog and gate, for real.** Schema, seed, `/api/catalog`, the
      unlock endpoint with scrypt hashing and per-IP rate limiting, the
      per-record cookie, and the album screen behind it.
- [x] **3 — The player.** FLAC streaming behind the record cookie with byte
      ranges, two audio elements, drag-seek, shuffle, the three repeat modes,
      volume with persistence, linear crossfade, Media Session.
- [x] **4 — The desk.** Auth, record CRUD, reorder, publish/listed flags,
      phrase editing, the record editor, site text with autosave, the admin bar,
      and WAV upload with in-browser FLAC/MP3 encoding.
- [ ] **5 — Offline.** Service worker, manifest, cache-per-track.
- [ ] **6 — Hardening.** Rate limits, audit logging, a keyboard pass, Lighthouse
      on a throttled phone.

## How the gate holds

The whole security model is one branch in `src/app/r/[slug]/page.tsx`: a locked
record never loads its tracks, so there is no payload to strip and nothing to
leak. Supporting that:

- **`getUnlockedRecord` is the only function that returns tracks**, and it
  verifies the unlock cookie itself rather than trusting a caller to have done
  it. There is no way to call it unauthorized and no caller who can forget to.
- **`phrase_hash` is never selected** by anything in `src/data/catalog.ts`. It
  leaves the database only inside `verifyPhrase`, on the unlock path.
- **Phrases are scrypt-hashed** with a per-phrase salt, compared with
  `timingSafeEqual` on the normalized form (trim, lowercase, collapse
  whitespace) — the same normalization the desk will write with, so what the
  owner types is what the listener can type.
- **A null `phrase_hash` always fails.** The desk allows an empty phrase and the
  design says so ("Leaving it empty keeps everyone out"), so this must never be
  the case that lets someone in.
- **Unlock cookies are HMAC-signed** over `slug.expiry`, so a cookie for one
  record cannot be edited into a key for another, and nobody can extend their
  own access. `SHADOW_HARBOR_SECRET` (32+ chars) signs them; without it the app
  throws in production rather than falling back to something guessable.
- **Rate limiting is per IP**, in Postgres rather than a cache, because counting
  attempts has to be atomic — a last-write-wins store would undercount under
  exactly the concurrency an attacker creates. Failures only; one correct phrase
  clears the count.
- **Drafts are invisible**, including to a 404. A missing record, a draft, a
  record with no phrase, and a wrong phrase all answer identically, so the gate
  is not an oracle for what exists.

## Audio

The owner uploads WAV masters. The desk derives FLAC and MP3 from them **in the
browser** and uploads only those — a Netlify function caps a request body at a
few megabytes and a 42-minute WAV is 727 MB, so the master never crosses the
wire at all.

The encoders are libFLAC compiled to wasm (about 240 KB) and a pure-JS MP3
encoder, not ffmpeg.wasm — which is 64 MB unpacked for two codecs out of
several hundred. The WAV is parsed directly rather than decoded through Web
Audio, which can resample and hands back floats; lossless has to mean the
samples in the file, not a round trip through a format it was never in.

Verified end to end against the reference `flac` CLI: a 24-bit/48kHz master
comes back bit-identical after encoding in Chromium, chunking at 3 MB,
uploading, reassembling, storing and decoding.

- **Streaming is FLAC.** Lossless, and it decodes bit-identically to the master
  at roughly half the bytes, so streaming raw WAV would cost 1.7x for the same
  audio. The route refuses `format=wav` outright; the master is archival.
- **Every byte goes through a function** that checks the record's unlock cookie.
  Blobs has no signed URLs, so there is no CDN handoff — about 10 MB a minute,
  or 240 album plays per 100 GB. That is the standing cost of the design.
- **Range requests are load-bearing**, not an optimisation. Browsers ask for a
  byte range when you drag the scrub bar; answering 200-with-everything would
  make every seek refetch the whole track.
- **Two audio elements**, because one cannot overlap the end of a track with the
  start of the next. They swap roles on each advance; the idle one is where the
  next track preloads and where a crossfade ramps up.

## Environment

| Variable | Where | What |
| --- | --- | --- |
| `SHADOW_HARBOR_SECRET` | Netlify (set) | Signs unlock cookies. 32+ chars. Required in production. |
| `NETLIFY_DATABASE_URL` | Netlify (automatic) | Provisioned by Netlify DB; nothing to configure. |
| `DATABASE_URL` | local only | Points at a local Postgres for testing. |
| `SHADOW_HARBOR_SETUP_TOKEN` | Netlify | Lets the owner claim the desk once, on a site that has never had one. Set it yourself; see below. |
| `SHADOW_HARBOR_LOCAL_AUDIO` | local only | A directory to use instead of Netlify Blobs, so the audio path can be tested with real files. |

## Claiming the desk

No admin password is seeded anywhere — there is no default to forget to change,
and until someone claims the desk, sign-in cannot succeed at all.

The trade is that an unclaimed desk would otherwise be claimable by whoever
found it first, so claiming also demands a setup token that exists only in the
project's environment variables:

1. In Netlify, add `SHADOW_HARBOR_SETUP_TOKEN` with a long random value.
2. Open `/admin`. It offers "Claim the desk" rather than a sign-in.
3. Paste the token, choose a key of 12 characters or more.

The claim route closes permanently once used. Changing the password afterwards
happens from inside the desk, where the request is already authorized — and
doing so invalidates every session signed before the change, so a password
change really does sign everyone else out.

To run the database locally:

```
initdb -D <dir> -U postgres --auth=trust
pg_ctl -D <dir> -o '-p 5433' start
createdb -h localhost -p 5433 -U postgres shadow_harbor
psql -h localhost -p 5433 -U postgres -d shadow_harbor \
  -f netlify/database/migrations/001_create-catalog/migration.sql
psql -h localhost -p 5433 -U postgres -d shadow_harbor \
  -f netlify/database/migrations/002_seed-catalog/migration.sql

DATABASE_URL=postgresql://postgres@localhost:5433/shadow_harbor \
SHADOW_HARBOR_SECRET=any-32-plus-character-string-for-dev npm run dev
```

## Still needed

- **The seeded phrases are public.** `002_seed-catalog` hashes the three demo
  phrases from the design handoff, which are printed in
  `design_handoff_shadow_harbor/README.md` in this public repository. Hashing a
  published phrase protects nothing. Treat the three seeded records as open to
  anyone who reads the repo, and reset every phrase from the desk (milestone 4)
  before real music goes behind one.
- **Cover art and audio.** None was supplied with the handoff. The desk will
  have upload paths for both, but there is nothing to listen to until real media
  exists.
- **Answers to the open questions** at the bottom of `CLAUDE.md` — whether
  phrases expire, whether download links ship, whether like counts are shared.
