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
  player/     audio engine, player bar, progress, volume
  offline/    the Cache API client, the keep panel, the bookmark button
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

Milestone 5 of six, complete apart from the download links. See
`design_handoff_shadow_harbor/BUILD.md` for the rest.

- [x] **1 — Shell and tokens.** Ported tokens, the four background layers, the
      decorative devices, the type scale, route skeletons.
- [x] **2 — Catalog and gate, for real.** Schema, seed, `/api/catalog`, the
      unlock endpoint with scrypt hashing and per-IP rate limiting, the
      per-record cookie, and the album screen behind it.
- [x] **3 — The player.** FLAC streaming behind the record cookie with byte
      ranges, two audio elements, drag-seek, shuffle, the three repeat modes,
      volume with persistence, spaced transitions or linear crossfade, Media
      Session.
- [x] **4 — The desk.** Auth, record CRUD, reorder, publish/listed flags,
      phrase editing, the record editor, site text with autosave, the admin bar,
      and WAV upload with in-browser FLAC/MP3 encoding.
- [x] **5 — Offline.** Service worker, manifest, home-screen icons, the
      "Keep it on your device" panel, a bookmark on every track row, and a
      count read from the real Cache API. Cover art upload too. Still to come:
      the "Download the files" rows.
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
  start of the next. The idle one is where a crossfade ramps up, and the two
  swap roles when it completes. A spaced transition has no overlap to arrange,
  so it stays on the element the listener started — iOS only lets an element
  play unprompted once that element has had a tap — and spends the silence
  buffering what comes next.
- **Nothing starts or stops at full volume.** With crossfade off, a track's tail
  ramps down inside its own last 2 seconds, three seconds of silence follow, and
  the next track ramps up over 1.6: a record puts a gap between songs and so
  does this. With crossfade on they overlap instead, on the 4-second linear
  ramp. A tap on play or pause gets four tenths of a second either way, which is
  the difference between a transport and a switch. The last track of a record is
  left alone — an ending that was mastered to end is not one to fade.
- **No ramp starts or stops at a constant rate either.** Every single-element
  fade follows a raised cosine, flat at both ends and steepest in the middle,
  because a straight line is the one fade you can hear begin: the level never
  jumps but the rate does, and the ear takes that corner as the event. Ramps run
  on their own 25ms timer read against the wall clock — 40 steps a second is a
  curve rather than a staircase, and a throttled background tab still has to
  arrive at the target rather than leave a track at half volume.

## Offline

A bookmark on a track row puts that track on the device; "Keep it on your
device" opens the panel that explains the other half — adding the site to the
home screen, where it opens without an address bar — and reports how many
tracks are really there.

- **The count is a measurement, not a note we kept.** `4 of 10 tracks are on
  this device.` is computed from `cache.keys()` every time it changes. A browser
  evicts caches when a device runs short of room and does not ask first, so a
  figure remembered in `localStorage` would go on promising music for a journey
  where there would be no way to get it.
- **Lossless where there is room for it.** A record is kept as FLAC unless
  `navigator.storage.estimate()` says the album will not fit inside two thirds
  of what is free, and a refused write falls back to the MP3 once rather than
  reporting failure. Whichever it gets, the whole album gets the same one — half
  an album in lossless is the one outcome nobody would choose on purpose.
- **The worker slices ranges itself.** `cache.match` ignores a Range header and
  returns the whole file, which an `<audio>` element reads as "no ranges here"
  and answers by refetching everything on every seek. Some browsers synthesise
  the 206 now; not all of them do. The slicing goes through `Blob.slice`, so
  seeking into a 40 MB track does not pull 40 MB into memory to hand back 64 KB.
- **Only what was asked for.** Listening to a track does not cache it; a track
  lands on the device because somebody chose to keep it. The catalog, the unlock
  endpoint and every admin route always go to the network — a stale answer to
  "is this record open on this device" would be a security bug wearing a
  performance feature's clothes.
- **"Lock it back" empties the device.** The cookie is what stops the server
  sending tracks again, but the kept audio would still play — the worker answers
  from the cache before it checks anything, and a file already here has no
  cookie left to check — and the last album page would still be served offline.
  Closing a record has to mean the device is empty of it.
- **The offline page carries its own assets.** Caching the fallback document
  alone fails in the worst way available: the HTML arrives, the framework
  starts, its route chunk is missing, and the error boundary replaces the one
  screen whose whole job is to be calm when nothing loads. The worker reads the
  page's markup at install and keeps whatever it asks for, so there is no build
  step to keep in step.

## Cover art

The owner taps the mount in the record editor and gets their phone's own
picker — Photo Library, Take Photo, Choose File. It is a `<label>` wrapping
`<input type="file" accept="image/*">`, which is what makes the whole 200px
square the tap target; a drop still works on a desktop, where a drop is the
natural gesture and a tap is not.

- **The picture is scaled in the browser, for the same reason the audio is.**
  A phone writes eight megabytes of 3024×4032 and a Netlify function's request
  body caps at a few, so the upload route would refuse the original outright.
  The desk re-encodes to fit a 1400px long edge — the mat shows 420px — which
  lands at a few hundred kilobytes and makes the upload a single PUT rather
  than the stitched-together affair the audio path has to be.
- **EXIF orientation is honoured, and then everything else is dropped.**
  `createImageBitmap(file, { imageOrientation: "from-image" })` rather than
  drawing raw pixels, because a phone held sideways writes landscape pixels and
  a tag saying "rotate this" — ignore it and the sleeve is on its side. What
  comes out the other end has no EXIF at all, which matters for a second
  reason: a camera writes the place and the minute into every photo, and a
  record sleeve is not where the owner should publish where they live.
- **A new storage key on every upload.** Blobs is eventually consistent, and
  replacing a cover is the commonest thing an owner does — writing to the same
  key would sometimes go on serving the picture they had just decided against.
  The row is repointed and the old blob swept after, never before.
- **The URL carries the upload time.** `/api/records/<slug>/cover?v=…`, cached
  hard and privately. A sleeve is looked at on every visit and re-sending it
  each time would be absurd; the version is what makes caching it safe.
- **Behind the same read check as the tracks.** The design puts cover art on
  the album screen only, never the catalog, so there is nothing to gain by
  making it public and a sleeve to give away by doing it. The gate carries no
  cover URL at all — whether art exists is not something a locked record should
  answer.
- **The declared type is checked against the bytes.** The route stores the
  content type and serves it straight back, so a JPEG uploaded as a PNG would
  have the site telling a browser something untrue about what it is handing
  over. Eight bytes of header settle it.

## Environment

| Variable | Where | What |
| --- | --- | --- |
| `SHADOW_HARBOR_SECRET` | Netlify | Signs unlock and desk cookies. 32+ chars. **Required** — without it no cookie can be signed, so the gate and the desk both stop working. |
| `NETLIFY_DATABASE_URL` | Netlify (automatic) | Provisioned by Netlify DB; nothing to configure. |
| `DATABASE_URL` | local only | Points at a local Postgres for testing. |
| `SHADOW_HARBOR_SETUP_TOKEN` | Netlify | Lets the owner claim the desk once, on a site that has never had one. Set it yourself; see below. |
| `SHADOW_HARBOR_LOCAL_AUDIO` | local only | A directory to use instead of Netlify Blobs, so the media path can be tested with real files. It holds one subdirectory per store — `shadow-harbor-audio/` and `shadow-harbor-covers/`. |

## If nothing will sign in

Every route that mints a cookie checks for a usable `SHADOW_HARBOR_SECRET`
before doing anything else, and says so plainly when it is missing. That check
exists because of a real failure: with the secret unset, the claim route wrote
the password and *then* threw on its way to signing the session — leaving a desk
claimed by a credential that could never sign in, and a sign-in screen reporting
"That isn't the key." for a key that was correct.

The client-side fallbacks were part of it too. A response with no `error` field
was treated as a rejection, so a 500 read as a wrong password or a wrong phrase.
Anything 5xx now says the fault is at this end.

If a desk is ever claimed with a password nobody has, `DELETE FROM
admin_credential;` reopens the claim route.

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
- **Real cover art and real music.** Both upload paths work now; nothing was
  supplied with the handoff, so there is still nothing to look at or listen to
  until the owner puts it there.
- **The download links.** `Download the files` — the MP3 format chip, the
  whole-album row and the per-track rows — is the last piece of milestone 5.
  The sizes are ready for it: `track_asset.bytes` is real, and
  `getAvailableFormats` now returns it.
- **Likes.** The `record_like` table exists and the decision is made — real
  counts, idempotent per device, never showing who — but the endpoint and the
  heart toggle are unbuilt.
- **Answers to the open questions** at the bottom of `CLAUDE.md` — whether
  phrases expire, whether download links ship, whether like counts are shared.
