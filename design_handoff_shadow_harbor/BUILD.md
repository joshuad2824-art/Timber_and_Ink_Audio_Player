# Shadow Harbor — build plan

Companion to `README.md` (the design spec). This covers the parts the prototype fakes: a real
backend, real audio, real auth, and offline playback.

## Recommended stack

Nothing here is precious — if a stack is already in place, use it. Otherwise:

- **Next.js (App Router) + TypeScript** — the routes map cleanly onto the screens, and server
  components keep locked track data off the client.
- **Postgres + Prisma** for the catalog.
- **S3-compatible object storage** for audio and cover art, served through short-lived signed
  URLs. Audio must never sit at a guessable public path.
- **CSS modules or vanilla CSS** over the ported Timber & Ink tokens. This design is almost
  entirely bespoke layout; a utility framework would fight it.
- **A service worker** (Workbox) for offline playback, plus a web app manifest so
  add-to-home-screen behaves like the prototype's copy promises.

## Data model

```prisma
model Record {
  id         String   @id @default(cuid())
  slug       String   @unique        // "shadow-harbor" — used in URLs and storage prefixes
  artistName String
  albumTitle String
  year       Int
  intro      String   @db.Text
  phraseHash String?                 // null = nobody gets in
  published  Boolean  @default(false) // draft: unreachable even with the phrase
  listed     Boolean  @default(true)  // unlisted: direct link only, hidden from the catalog
  coverKey   String?
  position   Int                      // manual catalog order
  tracks     Track[]
}

model Track {
  id       String  @id @default(cuid())
  recordId String
  title    String
  seconds  Int
  hidden   Boolean @default(false)
  position Int
  audioKey String?                   // storage key; null = no file yet
  mimeType String?
  bytes    Int?
}

model SiteText {
  id      Int    @id @default(1)
  eyebrow String
  title   String
  intro   String @db.Text
  footer  String
}
```

`position` on both tables backs the reorder controls. Keep the ordering explicit; don't lean on
`createdAt`.

## Endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/catalog` | public | listed + published records only; no phrases, no track data |
| POST | `/api/records/:slug/unlock` | public | `{phrase}`; rate-limited; sets a per-record httpOnly cookie |
| GET | `/api/records/:slug` | record cookie | full record + tracks + signed audio URLs |
| GET | `/api/records/:slug/tracks/:id/audio` | record cookie | 302 to a signed URL, or range-stream |
| POST | `/api/records/:slug/like` | record cookie | idempotent per device |
| POST | `/api/admin/session` | public | password; rate-limited; httpOnly session cookie |
| GET/PUT | `/api/admin/records[/:id]` | admin | full CRUD including drafts, phrases, reorder |
| POST | `/api/admin/records/:id/tracks` | admin | direct-to-storage upload; returns the key |
| PUT | `/api/admin/site-text` | admin | debounced autosave, matching "Saved as you type." |

Phrase comparison: `trim → lowercase → collapse internal whitespace`, then verify against the
hash. Same normalization on write, so what the owner types in the desk is what the listener can
type at the gate.

## Milestones

**1 — Shell and tokens.** Port `tokens/*.css`. Build the background layer stack, the type scale,
and the decorative devices (key-cap chip, pressed-plate chip, tape strip, paired rule, paper
card, photo mat). Route skeletons. Verify on a phone: the page should already *feel* right with
no content.

**2 — Catalog and gate, for real.** Schema, seed, `/api/catalog`, the unlock endpoint with
hashing and rate limiting, the per-record cookie. Locked records return no track data to the
client at all. The catalog's state chips and the `N artists · <tail>` footer read from live data.

**3 — The player.** Audio storage and signed URLs. Two audio elements, the 250ms tick, seek by
drag, shuffle, the three repeat modes, volume with persistence, and crossfade with a linear ramp
over the configured window (cancel on seek/pause/manual change, skip for repeat-one). Media
Session API so lock-screen controls work. Drop the stand-in clock — or keep it behind a dev flag
for records with no audio yet.

**4 — The desk.** Admin auth, record CRUD, reorder, publish/listed flags, phrase editing,
direct-to-storage audio upload with duration probing, cover upload, and the site-text tab with
debounced autosave. Remove every on-screen key and phrase hint.

**5 — Offline.** Service worker, manifest, and a cache-per-track that the bookmark button
drives. `4 of 10 tracks are on this device.` must be true — read it from the Cache API, not from
`localStorage`. Decide the download-links question before building them.

**6 — Hardening.** Rate limits and audit logging on the admin routes. Keyboard pass across every
screen (both gates submit on Enter, rows activate on Enter/Space, the amber focus ring is
visible everywhere). Real cover art and audio. Lighthouse on a throttled phone.

## Things worth getting right

- **The bottom bar is fixed and the album screen reserves 168px for it.** Also honor
  `env(safe-area-inset-bottom)`; without it the controls sit under the iOS home indicator.
- **Seeking uses pointer capture**, so the drag keeps tracking after the pointer leaves the 4px
  track. Don't rebuild it as a click-only bar.
- **Row click plays, row click while playing pauses.** Keep that; it is how the prototype reads.
- **The active track marker is an inset box-shadow**, not a border — a border would shift the row.
- **Destructive actions arm in place** ("Remove this record" → "Remove it for good?" with a "Keep
  it" escape). No modals anywhere in this design.
- **Toasts are text in a reserved slot**, hand-lettered, 4.2s, never overlays. The slot keeps its
  height when empty so nothing reflows.
- **Durations are authored, not derived** — the owner can type `3:52` or `232`. Accept both; store
  seconds. Uploaded files probe their own duration and fill the field in.
