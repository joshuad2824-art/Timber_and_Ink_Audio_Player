# Timber & Ink — Design System

Timber & Ink is a **blog and podcast by Joshua Davis** — Tulsa, Oklahoma; hospital IT by day, student minister by heart — written on the conviction that **ordinary life deserves extraordinary attention**. It is one person's work, not a masthead, and the design system exists to keep it sounding that way.

The brand reads like printed matter found in a quiet room at dusk: a brass engraving, warm paper set into the dark, and one lamp lit. **The system is dark by default.** Deep teal `#142A2B` is the page; warm cream `#f6f3ec` is the paper you set *into* it, scoped with `data-stock="paper"`. Light is scarce and warm.

The mood is warm, grounded, reflective. Nothing glossy, nothing rounded, nothing bright — and never more than one lit thing in a view.

## Sources given

| Source | What it contained |
| --- | --- |
| `uploads/14.png` | Primary wordmark, ink cut — distressed condensed wood-type slab, ink letterforms, brass ampersand. Copied to `assets/logo-wordmark.png`. |
| `uploads/13.png` | Primary wordmark, **reverse cut** — cream letterforms, sage ampersand, drawn for dark surfaces. Copied to `assets/logo-wordmark-reverse.png`. |
| `uploads/9.png` | Standalone brass ampersand mark. Copied to `assets/mark-ampersand.png`. |
| `uploads/10.png` / `uploads/11.png` | Brass line-engravings of the moose and the puffin, each usable alone. Copied to `assets/engraving-moose.png`, `assets/engraving-puffin.png`. |
| `uploads/12.png` | The moose-and-puffin lockup engraving. Copied to `assets/engraving-moose-puffin.png`. |
| `uploads/17.png`–`uploads/22.png` | Illustrated mascots: the Moose in a navy peacoat and the Puffin in a green tartan overcoat — each facing left and right, plus two paired compositions. Copied to `assets/mascots/`. |
| `uploads/Timber&Ink_HJ.png` | Full masthead lockup: wordmark + "Hobby Journal" in didone small caps + the engraving. Copied to `assets/logo-hobby-journal.png`. |
| `uploads/IMG_6774.JPG` | Mood board — overcast light, wet slate, working water, hand-lettered signage, a typewriter and journal by a rain-lit window. |
| `uploads/IMG_6775.JPG` | Mood board — old-growth forest at dusk: near-black conifers, an amber candle jar, pressed ferns on kraft paper, rain on a still lake, an oil lantern. |
| `timber-ink-color-tokens.md` (v2.1) | The color system of record. Supersedes every earlier palette. |
| `readme-content-fundamentals-v2.md` | The voice section of record, written against the Brand Bible v1.2 and the Writing Companion. |
| `tokens/*.css` (v2.0) | Fonts, type, color, spacing, surfaces and base, supplied directly. |

The two mood boards set the *mood*, not the subject. An earlier read of them cast Timber & Ink as a coastal-Maine quarterly written by an editorial collective in British English; that was drift, and it is retired throughout.

## Color, in one line each

Four brand colors. Everything else derives from them.

| Token | Value | What it is |
| --- | --- | --- |
| `--teal-800` | `#142A2B` | **The page.** Also the type on paper |
| `--cream-100` | `#f6f3ec` | **The paper.** Also the headings on the page |
| `--brass-700` | `#7a6201` | **The metal** — the ampersand, the engraving, rules and links |
| `--amber-500` | `#C6862F` | **The flame** — the single lit CTA, the focus ring, the lamplight |

**The one constraint.** `#7a6201` measures **2.56:1** on `#142A2B` — it fails as text on the night page. Brass has a side: on cream it is a text color (5.30:1); on teal it is decoration — engravings, marks, filled button backgrounds. Anything on the night page that must be *read* steps up to `--brass-500` (5.15) or `--brass-400` (6.90). Amber is the exception that proves it: `#C6862F` measures **4.91:1** on the page, which is why the lit CTA is amber and not brass.

**Brass and amber are not the same warmth.** Brass is metal; amber is flame. **Never more than one amber element in a view.** If two things glow, neither does.

**Two families kept alongside the four.** **Spruce** (`--spruce-950`…`400`) is old-growth ground — full-bleed forest washes and green surfaces, but not the page; the page is still `--teal-800`. **Driftwood** (`--driftwood-800`…`300`) is texture only: plank fills, wood grain, disabled wells, never body text on the night page.

Retired: fog, lichen, ink, lobster, burgundy, and the old `#002224` teal. `tokens/colors.css` carries the full ramps and both stocks; `guidelines/color-*.html` shows them.

---

## CONTENT FUNDAMENTALS

### Who is speaking

**One person. Joshua Davis.** Not an editorial board, not a shed, not a print run. **The first person singular is the default, and it is load-bearing** — a `we` in the interface chrome makes the whole thing sound like a company, which undoes the single most valuable thing the brand has.

The reader is "you," but sparingly, and never as an assumption about their inner life. Never "users," never "our community," never "subscribers" as a form of address.

### Voice

Timber & Ink sounds like **a thoughtful friend who noticed something beautiful and wanted to tell you about it over coffee.** Five words that always apply: **warm, grounded, reflective, curious, sincere.**

The voice **assumes interest, not expertise.** The reader is a thinking adult who may be brand new to the thing; terms get defined naturally, in passing, without condescension.

**Suggestion over command.** This is the most distinctive marker of the voice and it reaches all the way into the interface. Reach for *maybe, I'd encourage, it'd probably be best, I personally, sometimes* over *don't, never, always.*

**One voice, different altitudes.** Ground Level — conversational warmth — is where essentially all interface copy lives. Ridge and Summit belong to editorial content. **Design system chrome never goes to Summit.** A button is not the place for a lyrical sentence.

**The failure mode to watch:** tipping too reverent, too hushed. The remedy is more air — a lighter aside, a sunnier verb, the willingness to sound glad. If a screen's copy reads solemn, it has drifted.

### Casing

- **Headlines and titles:** sentence case in Cormorant Garamond — *"The slow joy of loose-leaf tea"*, not Title Case.
- **Eyebrows, metadata labels, section markers:** uppercase Archivo, tracked. This is typographic texture and it is welcome.
- **Buttons and nav: sentence case, not uppercase.** All-caps `SUBSCRIBE` is a command shouted at the reader; the voice does not do that. Where a noun phrase will carry it, prefer one — *"More slow stories."*
- **Metadata:** uppercase mono is fine — `EPISODE 12 · MARCH 2026 · 22 MIN`.
- **Body copy:** sentence case, Oxford commas, **American spelling and usage.**

### Separators, numbers, units

The middle dot with spaces ( · ) joins metadata. **Em dashes are native to this voice, not a rationed exception** — the aside, the turn, the second thought. En dashes for ranges (*2011–2025*). Numbers and units are American: inches and feet where the trade uses them, °F, `$`. Prices as `$48 a year`.

### Microcopy

| Slot | On voice |
| --- | --- |
| Empty state | *"Nothing here yet. Plenty of time."* |
| Toast | *"Saved. It'll be waiting under Saved."* |
| Error | *"I'll need an email address to send it to."* |
| Placeholder | *"joshua@example.com"* |
| Newsletter | *"One letter a month. Sometimes two, if something's worth it."* |
| Subscription | *"Unsubscribe any time — one click, no hard feelings."* |

Note the pattern: **"I," not "we."** Note also that the newsletter line hedges rather than promises absolutely — the softened claim is the register, not a weakness in the copy.

### What the interface never says

Exclamation marks outside quoted reader letters. Emoji anywhere. Marketing intensifiers — *revolutionary, seamless, game-changing.* "Click here," "learn more," "unlock," "supercharge." Startup plural nouns — *Insights, Solutions.* ALL-CAPS body copy.

From the Brand Bible avoid list: *hack, optimize, crush it, level up* (unless plainly tongue-in-cheek), *grind, hustle, content creator, personal brand, aesthetic* (as a noun), *curate* (sparingly), *journey* (unless earned), *authentic* (show it, don't claim it), *life-changing, must-read, ultimate guide, "in today's fast-paced world."*

From the Writing Companion's banned constructions — these matter in UI copy more than people expect:

| Cut on sight | Instead |
| --- | --- |
| *There is / there are* as an opener | Name the subject, give it a verb |
| *It's important to note that…* | Say the thing |
| *You are deeply X / truly Y* | Soften to *may*, or cut and let the prose work |
| **very, really, just, simply, basically, deeply, truly** | Delete unless it earns its place |

That last row quietly ruins interface copy. *"Simply enter your email"* fails on two counts at once.

### Length discipline

Deks are one sentence. Card copy is at most two lines. A section never carries both a subtitle and a dek. **If a screen needs three paragraphs of explanation, the design is wrong.** Prose is allowed to breathe in editorial contexts, though — the discipline governs chrome, not the reading column. Posts run 800–2,500 words with 1,000–1,500 as the center of gravity, and the measure stays at 64ch for a reason.

### Faith

Faith is the root system, not the billboard. It shows up as stewardship, gratitude, wonder, hope and quiet courage — never as a sermon, and essentially never in interface chrome. The litmus test: a reader who isn't a Christian should feel welcome and respected; a reader who is should feel sharpened. For a design system this means one thing — **don't decorate the UI with faith.** No verse in the footer, no cross in the iconography, no scriptural pull quote as a loading state.

### The sign-off

> *"Now go and make something of your spare moments."*

The brand's benediction, and **podcast-exclusive.** It is not a footer tagline, not a button, not an email sign-off. **Open question for Joshua:** the Code Location Map records this line in the site-wide Squarespace footer, where it renders on every page — that contradicts the podcast-exclusive rule, and a benediction that appears on every page stops being a benediction. This system does not ship it in any template until that is decided.

### Quick reference

**Reach for:** wonder, craft, margin, heirloom, slow, deliberate, storied, worn-in, handed-down, lamplight, campfire, pine, vellum, woodsmoke, quiet, steady, earned, sacred, ordinary, intentional.

**Three tests before copy ships:** read it aloud — does it sound like Joshua talking to a friend, or like a template? Is it "I" or "we"? Is it commanding or offering?

---

## VISUAL FOUNDATIONS

**The idea.** Printed matter, not software chrome. Weight and rules do the work that shadows and gradients do elsewhere. Where a screen feels flat, add a hairline rule or a 2px rule — not a gradient.

**Color use.** `--teal-800` is the page — everything is built on it. Cream is *type*, and paper only inside a `data-stock="paper"` insert. **Primary actions are a bone-cream block with deep-teal lettering** — a routed sign board. **Amber is the single accent**: one lit CTA per view, and the focus ring. Brass is the metal that runs through everything else: rules, links, eyebrows, the ampersand, the engraving. Maximum **two** surface colors per view beyond the page, and **exactly one glowing element**. Status colors stay earthy and are paired per stock — `--status-*` resolves automatically inside `data-stock="paper"`.

**Type.** Six voices, no more:

- **Bevan** — wood-type display. Uppercase, tracking −0.01em. Posters, covers and hero headlines only; never inside a reading column.
- **Playfair Display** — editorial headings, 700 for every h1–h3, italic 400 for deks and pull quotes. Sentence case, always.
- **Spectral** — long-form body at 17/1.62, measure 64ch.
- **Archivo** — interface labels and controls, and **h4/h5 as small caps** rather than shrunken editorial serif at label size.
- **Oswald** — routed signage (`--type-signpost-*`): place and section names, tab bars on dark chrome, dividers. Uppercase, tracked 0.16em, never below 14px.
- **Courier Prime** — bylines, dates, captions, field-note metadata.

Never set body copy in Archivo; never set a button in Spectral; never mix the signage face and the wood-type display face in one lockup.

**Spacing + layout.** 4px base scale. Controls 10/18px, cards 24px, sections 80px, page gutter 32px. Page container 1180px, reading column 720px. Plain 12-column grid with 24px gutters; asymmetric editorial splits (1.35fr / 1fr) are preferred over equal thirds for the featured row. The masthead sticks to the top; the app tab bar is fixed to the bottom; nothing else floats.

**Backgrounds + imagery.** Full-bleed washes behind heroes and footers: forest (`--wash-forest`), overcast (`--wash-overcast`), lamplight (`--wash-lantern`). The engraving sits large, low and half-cropped out of the frame at 45–55% opacity, knocked back to cream. **Every full-bleed image carries `--vignette`.** Optional 7% grain; `--rain-streaks` at most once per view. Photography is dim, warm and slightly desaturated (`--image-treatment`) — never golden-hour, never high-key. **None was supplied**, so the UI kits use `MediaPlate`: a teal or cream wash under a fog veil with a mono caption where the photograph belongs.

**Gradients — permitted only as atmosphere.** `--fog-veil` / `--fog-veil-dark`, `--protection-scrim`, `--vignette`, `--wash-forest`, `--wash-overcast`, `--wash-lantern`. No bluish-purple gradients, ever.

**Corner radii.** 2 / 3 / 5 / 8px. Controls 3px, cards 5px, media 0 (full-bleed) or 3px inset. The only round shape in the system is the `stamp` badge and the radio dot.

**Cards.** `--surface-card` (`--teal-900`), 1px cream hairline at 10%, 5px radius, deep near-black shadow. Interactive cards lift 2px with `--shadow-lift`. The signature variant is `tone="plate"`: a 2px border with a hard 3px offset block (`--shadow-plate`) — a letterpress plate, no blur. Cards never nest.

**Shadows.** Three levels (raise / card / lift), near-black and deep because the page absorbs light, plus the two hard letterpress plates. Inner shadow only as the pressed state of a button and the inset of a form well. **One glow token pair only** — `--glow-lamplight` for the single lit element and `--glow-soft` for lamplight bleeding onto a surface. Nothing else glows.

**Borders + rules.** Hairline (10%) inside cards and between list rows; solid (20%) on form wells; 2px rule under the masthead and above section headings; 3px double rule for section breaks; 2px brass rule for pull-quotes and the active nav marker.

**Hover states.** Buttons lift up-left 1px and gain a hard 3px offset plate; the fill also lightens one step. Cards translate up 2px and deepen their shadow. Text links shift `--brass-500` → `--brass-300`. Icon buttons take a 7% cream wash. Nothing changes size, nothing changes opacity.

**Press states.** The plate stamps back down: transform returns to 0, the offset shadow is replaced by `--shadow-press`. No scale-down, no bounce.

**Focus.** `--focus-ring-shadow` — a 2px page-colored gap then a 2px amber ring. Never a browser-blue outline.

**Motion.** Slow and weighted. `--ease-standard` for state changes, `--ease-out` for entrances. 90ms for transform, 150ms for color, 240ms for surfaces, 420ms for screen-level changes, 900ms for a fog veil settling. Fades and short vertical translates only — no bounce, no spring, no parallax, no looping ambient animation. Tab underlines move instantly.

**Transparency + blur.** Rare and purposeful: the modal scrim, the fog veils, and the sticky masthead if it must overlap imagery (`--blur-glass`). No frosted cards, no glass panels.

**Density.** Editorial screens breathe (80px sections, 64ch measure); app and settings screens are compact but never cramped (12–18px row padding, 38–46px hit targets, minimum 44px for primary mobile actions).

---

## ICONOGRAPHY

- **Nothing icon-like was supplied with the brand assets** — no icon font, no SVG sprite, no PNG glyphs. The only illustration is the brass line-engraving.
- **Substitution (flagged):** the system uses **Lucide** (`https://unpkg.com/lucide@0.451.0/dist/umd/lucide.min.js`) at **1.5px stroke**, the closest CDN match to the fine hatched line of the engraving. Every icon comes through the `Icon` component, so replacing the set is a one-file change.
- **Weight and size.** 1.5px stroke, 15–20px in dense UI, 24px maximum. At 28px+ drop to 1.25. Icons inherit `currentColor` and are never brass unless they sit beside brass type.
- **Glyph vocabulary in use:** `compass`, `book-open`, `library`, `bookmark` / `bookmark-check`, `pencil-line`, `search`, `filter`, `share-2`, `printer`, `mail`, `package`, `rss`, `settings`, `user`, `check`, `triangle-alert`, `arrow-left`, `arrow-right`, `chevron-right`, `type`.
- **Unicode as icons.** Two only: the mono `▾` select marker and the mono `×` close glyph, both in Courier Prime so they read as typewriter marks.
- **Illustration over iconography.** Where a screen needs visual interest, use the engraving (large, cropped, single instance) rather than a cluster of icons.
- **Mascots — a separate register.** `assets/mascots/` holds the Moose and the Puffin as full-color illustrated characters. They need no treatment: no vignette, no knock-out, no desaturation. Use them where the brand speaks in the first person — empty states, error pages, onboarding, a thank-you. **Never in the same view as an engraving**: the engravings are the archive voice, the mascots are the human one.
- **Emoji: never.**
- **The mark itself — two cuts, never a filter.** `assets/logo-wordmark-reverse.png` is the default, because the system is dark; `assets/logo-wordmark.png` is for `data-stock="paper"`. **Swap the file; never recolor the wordmark with a CSS filter.** Clear space equals the cap height of the T.
- **Engravings.** They ship in brass on transparency: on night surfaces knock them out with `--engraving-filter` at 45–55% opacity, half-cropped out of the frame; on paper they print as-is. One engraving per view, never rotated, never drop-shadowed.

---

## Fonts

`tokens/fonts.css` loads the four named families from Google Fonts:

| Role | Substitute | What it stands in for |
| --- | --- | --- |
| Display | **Bevan** | The distressed condensed wood-type of the wordmark |
| Editorial | **Playfair Display** | The high-contrast didone small caps of the masthead line |
| Body | **Spectral** | Long-form text (no source specimen) |
| Interface | **Archivo** | UI labels (no source specimen) |
| Signage | **Oswald** | Routed signpost lettering from the mood board |
| Mono | **Courier Prime** | Typewriter metadata (no source specimen) |

No font binaries came with the brand assets, so these are the nearest Google Fonts matches. **Send the real licensed families** (or name them) and `tokens/fonts.css` is the only change needed.

## Intentional additions

Nothing in the sources defined a component inventory, so a standard set was authored. Beyond the usual primitives, three additions:

- **`Icon`** — a wrapper over the substituted Lucide set, so the swap to a licensed set is a one-file change.
- **`Field`** — label/hint/error furniture, so every form control shares one label treatment.
- **`Masthead`** — the site header. Really a kit component, but every surface needs it, so it lives with the primitives.

## Index

Root
- `styles.css` — the single entry point consumers link. `@import` lines only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `surfaces.css`, `base.css`.
- `assets/` — the wordmark in both cuts, the masthead lockup, the ampersand mark, three engravings, and `mascots/`.
- `guidelines/` — specimen cards (Colors, Type, Spacing, Surfaces, Brand) rendered in the Design System tab.
- `thumbnail.html` — the system's tile.
- `SKILL.md` — Agent-Skills wrapper so this folder works inside Claude Code.

Components (`window.TimberInkDesignSystem_53a136`)
- `components/core/` — **Button**, **IconButton**, **Icon**, **Card**, **Badge**, **Tag**
- `components/forms/` — **Field**, **Input**, **Textarea**, **Select**, **Checkbox**, **Radio**, **Switch**
- `components/feedback/` — **Dialog**, **Toast**, **Tooltip**
- `components/navigation/` — **Masthead**, **Tabs**

Each directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one `@dsCard` card HTML showing the variants.

UI kits
- `ui_kits/journal_web/` — the public site: home, post, archive, subscribe. Click-through.
- `ui_kits/field_notes_app/` — Field Notes, the mobile companion: shelf, reader, notes, account. Click-through.

## Still open

- **Squarespace reconciliation.** Master Stylesheet v2.3 in Custom CSS still carries `#002224`; it needs the same swap.
- **The benediction in the site footer** — see *The sign-off* above.
- **Real licensed font files**, if the four Google families are stand-ins rather than the shipping choice.
