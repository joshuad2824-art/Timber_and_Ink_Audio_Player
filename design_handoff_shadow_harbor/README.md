# Handoff: Shadow Harbor — private album player

## Overview

Shadow Harbor is a small, invitation-only listening site. A visitor lands on a catalog of
records; each record sits behind its own short access phrase. Enter the phrase you were sent
and that one record opens — its cover, its notes, its track list, and a fixed player bar at the
bottom of the screen. No accounts, no sign-up, nothing to remember. Behind a separate key
there is an admin area ("the desk") where the owner adds artists and records, uploads audio,
reorders tracks, sets phrases, edits the site's own copy, and publishes.

Three audiences, three surfaces:

| Surface | Who | What it does |
| --- | --- | --- |
| Catalog + Gate | anyone with a link | see what exists, unlock one record with a phrase |
| Album + Player | an invited listener | play, seek, shuffle, repeat, crossfade, keep tracks offline, download files, like |
| The desk | the owner only | CRUD the catalog, upload audio, publish/unpublish, edit site text |

## About the design files

**The files in `design/` are design references created in HTML — a working prototype of the
intended look and behavior, not production code to lift.** `Shadow Harbor.dc.html` runs on a
bespoke in-browser component runtime (`support.js`) that exists only in the design tool; it is
there so you can *open it in a browser and interact with every screen*, not so you can ship it.

The task is to **recreate these designs in a real codebase** using that project's established
framework, routing, state, and component patterns. If there is no codebase yet, pick the stack
(see `BUILD.md` for a recommended one) and implement the designs there. Match the visuals
closely; re-implement the behavior properly, with a real backend where the prototype fakes one.

Open `design/Shadow Harbor.dc.html` in a browser to see it. The admin key and each record's
phrase are printed on their own sign-in screens while the prototype is in this state:

- record phrases — `harbor light`, `paper lantern`, `kitchen radio`
- admin key — `lamplight`
- the admin desk is also reachable at `#admin`

## Fidelity

**High fidelity.** Final colors, type, spacing, copy, iconography, states, and interaction
behavior. Recreate the UI to match, using the target codebase's component library where one
exists. Two things are deliberately unfinished and are yours to build for real:

1. **Audio.** The prototype expects files at `audio/<artist-id>/<NN>-<track-slug>.mp3`. When
   none are present it falls back to a stand-in clock that advances the progress bar against
   each track's declared length, so the player can be demonstrated with no media. Real
   playback replaces that entirely.
2. **Persistence and auth.** Everything lives in `localStorage` in the prototype — the catalog,
   the unlocked records, the admin session. All three need a server.

## Design tokens

Colors are the Timber & Ink system's four brand colors plus a night-shifted set of neutrals.
Every value used in the design, verbatim:

### Surfaces
| Role | Hex | Where |
| --- | --- | --- |
| Behind the page | `#08100F` | `html, body` |
| The page | `#0B1819` | app root |
| Chrome (player bar, admin bar) | `#0A1617` | fixed bars |
| Card / well | `#0D1C1D` | admin artist cards, "listening offline" panel, volume popover |
| Paper insert | `#f6f3ec` | the two sign-in cards (`data-stock="paper"`) |
| Photo print | `#fffdf6` | the cover-art mat on the album screen |

### Ink
| Role | Hex |
| --- | --- |
| Headline cream | `#F4F0E6` |
| Strong label cream | `#F1EDE2` |
| Body cream | `#E8E3D7` |
| Secondary body (sage) | `#C3CBC6` |
| Metadata / muted (sage) | `#9DABA6` |
| Hand-lettered aside | `#D8D2C4` |
| Ink on paper | `#142A2B`, labels `#2c3f3e`, hint `#4A5B58` |
| Error on paper | `#9A4B2C` |

### Metal, flame, state
| Role | Hex | Notes |
| --- | --- | --- |
| Brass link | `#AE9546` | hover `#DAC891`; also the 2px rule on the player bar and active tab |
| Brass heading / active icon | `#C5AE67` | section eyebrows, engaged toggles, "saved" bookmark |
| Amber — the one lit thing | `#C6862F` | the play button only. Border `#8F5300`, hover `#DE9D4B`, glow `0 0 24px rgba(198,134,47,0.42)` |
| Draft / warning | `#DE9D4B` | draft badges, hidden track, destructive confirm |
| Hand-lettered toast | `#D9A354` |
| Disabled chevron | `#33504F` |

Rule opacities on the page: hairlines `rgba(232,227,215,0.10–0.14)`, solid borders `0.16–0.22`,
2px rules `#E8E3D7` (masthead) or `rgba(232,227,215,0.28)` (section break), hover wash
`rgba(232,227,215,0.04–0.07)`.

### Typography
Faces come from the design system's `tokens/fonts.css`; one addition, Grape Nuts, is loaded
from Google Fonts for hand-lettered asides.

| Variable | Family | Used for |
| --- | --- | --- |
| `--font-display` | Bevan | uppercase page titles ("RECORDINGS", "THE DESK", artist name on the gate) |
| `--font-editorial` | Playfair Display 700 | album titles, track titles, artist album lines |
| `--font-body` | Spectral | paragraph copy |
| `--font-ui` | Archivo 600/700 | button and control labels, badges, key-cap chips |
| `--font-signage` | Oswald 500 | routed signage: artist names, "The tracks", desk tabs. Uppercase, `letter-spacing: 0.16em` |
| `--font-mono` | Courier Prime | all metadata, timecodes, file rows, hints, footers. Uppercase + `0.06–0.14em` tracking |
| `--font-hand` | Grape Nuts | the first-person asides and toasts (21–27px) |

Sizes actually used — page title `clamp(34px,10vw,50px)/0.98`, album title
`clamp(30px,8.4vw,42px)/1.04`, hand asides `clamp(22px,6vw,27px)/1.32`, track title 18px,
now-playing 16px, signage 13–15px, UI labels 11–13px, metadata 10–11px.

### Spacing, radii, shadows, motion
- Page gutter `clamp(20px,4vw,34px)`; content widths 940px (catalog), 880px (album), 1080px
  (desk), 380–400px (sign-in cards).
- Album screen has `padding-bottom: 168px` to clear the fixed player.
- Radii: controls and chips 3px, cards 5px, badges 2px, photo mat 0.
- Shadows: card `0 18px 34px rgba(0,0,0,0.5)` on hover-lift (translateY(-2px)); paper card
  `0 26px 54px rgba(0,0,0,0.52)`; photo print `0 26px 52px rgba(0,0,0,0.5), 0 3px 0 rgba(0,0,0,0.3)`;
  player bar `0 -18px 40px rgba(0,0,0,0.6)`; tape `0 3px 8px rgba(0,0,0,0.42)`.
- Motion: `240ms var(--ease-out)` on transform/shadow. Nothing else animates.
- Hit targets: every control is ≥44px; the play button is 56px.

### The four background layers
Stacked, `position:absolute; inset:0; pointer-events:none`, in this order over `#0B1819`:

1. **Lamplight washes** (toggle) — three radial gradients:
   `radial-gradient(880px 1040px at 6% 220px, rgba(198,134,47,0.115), transparent 68%)`,
   `radial-gradient(70% 44% at 18% 88%, rgba(198,134,47,0.10), transparent 72%)`,
   `radial-gradient(46% 30% at 84% 4%, rgba(120,150,140,0.055), transparent 74%)`.
2. **Desk wear** (toggle) — `textures/desk-wear.png`, `background-size:100% 100%`, `opacity:0.62`.
3. **Grain** — `textures/desk-grain.png`, tiled at `256px 256px`, `opacity:0.3`.
4. **Vignette** — `radial-gradient(122% 88% at 50% 40%, transparent 38%, rgba(0,0,0,0.46) 100%)`.

Content sits at `z-index:3`, the admin bar at 12, the player bar at 20.

### Recurring decorative devices
- **Key-cap chip** (eyebrow labels): cream gradient `#e8e3d2 → #d6d0bc 55% → #cbc4ae`, 3px radius,
  `rotate(-1.1deg to -1.2deg)`, inset highlight top / inset shadow bottom / `0 3px 9px rgba(0,0,0,0.48)`,
  Archivo 700 11px `0.26em` uppercase in `#1d2a28`, white text-shadow.
- **Pressed plate chip** (status on dark): gradient `#31403d → #1e2a28 55% → #182220`, same
  construction inverted, Archivo 700 9px `0.22em`.
- **Tape strip** (toggle): two 1px repeating-linear-gradient crosshatches over a
  `linear-gradient(178deg, …)` fill, rotated −21°/−17°/−9°, 100–126px × 27–32px, absolutely
  positioned half off the corner of a paper card or photo print. Two fills: cream
  `rgba(226,219,198,0.94)` and olive `rgba(150,143,104,0.94)`.
- **Paired section rule**: 2px `#E8E3D7` with a 1px `rgba(232,227,215,0.34)` line 3px below it.

## Screens

### 1. Catalog (`view: "roster"`)
The landing page. Max-width 940px, `56px` top padding.

Key-cap eyebrow ("A small catalog") → Bevan h1 ("Recordings") → paired rule → a 30ch
hand-lettered intro paragraph. Then the record list: full-width rows, 20px vertical padding,
1px hairline between, hover wash. Each row is a `role="button"` with Enter/Space handling and
holds — Oswald artist name, Playfair album title 20px, mono meta (`2026 · 10 tracks · 42 min`),
a pressed-plate state chip, and a `chevron-right`.

State chip values: `Open` (unlocked, brass `#C5AE67`) · `Locked` (sage `#9DABA6`) ·
`Draft` / `Unlisted` (amber `#DE9D4B`, admin only).

Footer: mono line `3 artists · more when they're ready` (count is live, tail is editable copy).
Below it, centered, a `lock`-icon button to the admin sign-in.

Empty state: *"Nothing here yet. Plenty of time."*

### 2. Gate (`view: "gate"`)
Centered, 400px column, full viewport height.

Back link ("All recordings") → key-cap "By invitation" → the artist name in Bevan → paired rule
→ hand-lettered line: *"The phrase I sent you opens <album> and nothing else. Once you're
through, it stays open on this device."*

Then the paper card, rotated `-0.7deg`, with a cream tape strip over its top-left corner:
Archivo label "The phrase", a text input (placeholder `the phrase`), a 19px error slot, and a
full-width primary button "Come in". A dim mono hint line under it (`Try harbor light if you're
looking around`) is on a toggle for the live site.

Validation: trim, lowercase, collapse whitespace, compare. Empty → *"I'll need the phrase
first."* Wrong → *"That isn't it — try the phrase I sent you."* Right → the album, and the
record stays unlocked on the device.

### 3. Album + player (`view: "album"`)
Max-width 880px. Header: back link left, "Lock it back" right (relocks this record and returns
to the catalog).

- Oswald artist name.
- **Cover art** — a 420px-wide cream photo mat (`#fffdf6`, 15px/15px/20px padding) rotated
  `-1.3deg`, a 1:1 image inside, and below it the artist in Oswald teal plus a pressed-plate
  year chip. Two tape strips, top-left (olive, −21°) and bottom-right (cream, −9°).
- Playfair album title → mono meta line → a 44px heart toggle with a live like count →
  hand-lettered album note (34ch).
- A rule-bounded row: secondary button "Keep it on your device" (expands the offline panel) and
  a "Crossfade" switch on the right.
- Paired section rule → Oswald "The tracks" heading.
- **Track rows**, 60px min-height, hairline separated. Number in mono, Playfair title
  (ellipsized), duration in mono, and a 44px bookmark button to keep that track offline.
  The playing row gets `background: rgba(232,227,215,0.06)` and `box-shadow: inset 2px 0 0 #E8E3D7`
  as a left marker, with its number and title stepped up to full cream. Clicking the row plays
  it; clicking the playing row pauses.
- "Download the files" discloses an MP3/WAV format pair (segmented chips), a whole-album row
  with an estimated size, and one row per track with its size. Sizes are estimated from
  duration: MP3 `0.039 MB/s`, WAV `0.28 MB/s`.
- A hand-lettered toast slot (26px reserved, 4.2s timeout) for keep/download/like confirmations.
- Footer: mono `<artist> · <year>`.

**The player bar** — fixed to the bottom, `#0A1617`, 2px brass top rule, respects
`env(safe-area-inset-bottom)`:
- A 4px scrub track (`rgba(232,227,215,0.16)`) with a cream fill; pointer-down captures the
  pointer and drag-seeks.
- Now-playing title (Playfair 16px, ellipsized) and `0:42 / 3:52` in mono.
- Controls: shuffle · previous · **play/pause (56px, amber, glowing — the single lit element in
  the whole design)** · next · repeat · volume. Engaged shuffle/repeat turn brass; repeat cycles
  off → all → one and swaps to the `repeat-1` glyph. Volume opens a small popover above the bar
  with a range slider and a percentage.
- Previous restarts the track if more than 3 seconds in, otherwise steps back (wrapping).

### 4. Admin sign-in (`view: "adminLogin"`)
The gate's twin at 380px, rotated the other way (`0.8deg`) with an olive tape strip top-right.
Key-cap "Behind the counter", Playfair "Sign in", hand-lettered line, paper card labelled
"The key" with a password input. Wrong → *"That isn't the key."*

### 5. The desk (`view: "desk"`)
Max-width 1080px. Back link and "Sign out" in the header; key-cap "Behind the counter"; Bevan
"The desk"; paired rule; hand-lettered line. Two Oswald tabs — **The catalog** / **Site text** —
with a 2px brass underline on the active one.

**The catalog tab.** A count line (`3 artists · 0 in drafts`) and one card per artist
(`#0D1C1D`, 5px radius, hairline border, 2px hover lift). Each card: a stacked up/down reorder
pair, the artist in Oswald, a status badge (Draft / Published / Hidden), the album in Playfair,
mono meta, and an inline "Phrase" input. A hairline-separated footer row holds "Open it",
"Publish it" / "Move back to drafts", and a "Listed" switch. Below the list: "Add an artist",
which creates a draft and opens the editor.

**The site text tab.** 560px column of labelled fields — Eyebrow, Headline, Opening paragraph
(textarea), Footer line — with a live "Reads as:" preview of the composed footer, and the note
*"Saved as you type."*

A hand-lettered admin toast slot sits at the bottom of both tabs.

### 6. Record editor (`view: "editor"`)
Back-to-desk link and a status badge. Playfair album title with a 52px brass rule under it.

An auto-fit grid of four fields (Artist, Record title, Year, Access phrase — the last with the
note *"This is what opens the record. Leaving it empty keeps everyone out."*), then a textarea
"A word about it". A 2px rule, then a row with a 200px cover-art drop target and a "Where it
stands" column (publish toggle button, "Listed on the site" switch, and a sentence explaining
the current combination of the two flags).

Then "The tracks": per row, reorder pair, index, title input, a 74px length input
(accepts `m:ss` or raw seconds), a show/hide eye toggle, and a trash button. Uploaded tracks
show a mono `Audio · <filename>` line beneath. Under the list: a file-input styled as an
"Upload audio" button (`accept="audio/*" multiple`) and a ghost "Add a blank track".

Footer: "Remove this record", which arms into "Remove it for good?" alongside a "Keep it"
escape. No modal — the button is the confirmation.

### 7. Admin bar
When signed in, a bar above the public screens: `#0A1617`, 2px brass bottom rule, mono
"Signed in as admin", a context note (`2 in drafts`, or `Phrases don't stop you here` on an
album), and "The desk" / "Sign out" on the right. While signed in, phrases are bypassed and
drafts/unlisted records appear in the catalog with amber chips.

## Interactions & behavior

- **Navigation** is a single `view` value: `roster → gate → album`, `roster → adminLogin → desk → editor`.
  Every transition scrolls to top and pauses playback. In a real build these become routes
  (`/`, `/r/:artist`, `/admin`, `/admin/:artist`).
- **Unlock** is per record and persists on the device. "Lock it back" removes just that record.
- **Playback** — 250ms tick. Position comes from the audio element when audio is real, otherwise
  from `performance.now()` against the track's declared length.
- **Crossfade** uses two audio elements. When `duration − position ≤ crossfadeSeconds` the
  second element starts the next track at volume 0 and the two ramp linearly over the window;
  on completion the roles swap and position resets to the crossfade length. Disabled for
  repeat-one, and cancelled by any seek, pause, or manual track change.
- **Track end** — repeat-one restarts; shuffle picks a random other index; otherwise advance, and
  at the end of the record either wrap (repeat-all) or stop.
- **Offline** — the bookmark marks a track as kept; the "Keep it on your device" panel explains
  add-to-home-screen and reports `4 of 10 tracks are on this device.`
- **Uploads** create object URLs immediately, probe `loadedmetadata` for the true duration, and
  derive a title from the filename (strip extension, strip leading track numbers, unslug,
  sentence-case). Object URLs are revoked on removal.
- **Toasts** are hand-lettered text in a reserved slot, never overlays; 4.2s.
- **Responsive** — one fluid column throughout; `clamp()` type and gutters, wrapping control
  rows, `minmax(220px,1fr)` auto-fit grid in the editor. Mobile is the primary target.
- **Keyboard** — record rows and track rows are `role="button" tabIndex=0` with Enter/Space;
  Enter submits both sign-in forms; focus uses the design system's amber focus ring.

## State

Session/UI: `view`, `artistId`, `editId`, `adminTab`, `confirmId`, `volOpen`, `installOpen`,
`filesOpen`, `fileFormat`, `nudge`, `adminNudge`, `toast`, `adminToast`, `audioMissing`.

Player: `cur`, `playing`, `pos`, `shuffle`, `repeat` (`off|all|one`), `vol`, `crossfade`.

Data: `catalog` (array of records), `siteText` (`eyebrow`, `title`, `intro`, `footer`),
`unlocked` (`{artistId: true}`), `saved` (`{"artistId:trackId": true}`), `likes`, `isAdmin`.

Record shape:

```js
{ id, name, album, year, phrase, enabled, published, intro,
  tracks: [{ id, title, sec, durText?, hidden?, uploaded?, fileName? }] }
```

`published` is the draft flag (unreachable even with the phrase); `enabled` is the listed flag
(reachable by direct link, hidden from the catalog). Both must be true to appear publicly.

`BUILD.md` has the server-side model, the endpoints this implies, and what must change for a
real deployment.

## Assets

- `design/textures/desk-wear.png`, `desk-grain.png` — the worn-desk layer, carried over from the
  photography-site project in the same GitHub org.
- `design/_ds/timber-ink-design-system-…/` — the Timber & Ink design system: token CSS
  (`tokens/*.css`), `styles.css`, and the component bundle. **Read the tokens; take the values.**
- Icons are [Lucide](https://lucide.dev) at 1.5px stroke, via CDN in the prototype: `chevron-right`,
  `chevron-up`, `chevron-down`, `arrow-left`, `lock`, `heart`, `bookmark`, `bookmark-check`,
  `shuffle`, `skip-back`, `skip-forward`, `play`, `pause`, `repeat`, `repeat-1`, `volume-2`,
  `eye`, `eye-off`, `trash-2`, `upload`.
- **No cover art or audio was supplied.** Cover art is a drop target in the prototype; supply real
  images and real audio before launch.
- Fonts: Bevan, Playfair Display, Spectral, Archivo, Oswald, Courier Prime, Grape Nuts — all
  Google Fonts.

## Files

```
design_handoff_shadow_harbor/
├── README.md                      ← this document
├── BUILD.md                       ← recommended stack, data model, endpoints, milestones
├── CLAUDE.md                      ← move to the repo root; instructions for Claude Code
├── .gitignore
└── design/
    ├── Shadow Harbor.dc.html      ← the prototype: open this in a browser
    ├── support.js                 ← prototype runtime (design tool only — do not ship)
    ├── image-slot.js              ← drop-target placeholder used for cover art
    ├── textures/                  ← desk wear + grain
    └── _ds/timber-ink-…/          ← design system tokens, styles, component bundle
```
