# Capability Deck: sync with Imran's repo, September 2026

The deck was ported from `imranifraz/famysys-web-dec` at `d8ec7b7` (see
`capability-deck-port.md`). His `main` has since gained two commits, `635e398` (17 Sep) and
`95bf696` (18 Sep). This file records what was brought in, what was deliberately not, and why.

(The hashes `e2b146c`, `57c111d` and `2d43446` from the brief are not in his repo. `e2b146c` is
*this* repo's own port commit, `feat: port capability deck to /capability-deck`.)

## What changed upstream, and what happened to it

| # | His change | Kind | Here |
|---|---|---|---|
| 1 | UGC videos reordered (Ice Cream, GFT first; Imported, Burger Cafe last) | content | `data/content.ts` |
| 2 | Synthesia videos reordered (CPARS Million Dollar Wake Up first) | content | `data/content.ts` |
| 3 | Synthesia "input" / "output" copy rewritten (avatar-based presenter video) | content | `data/content.ts` |
| 4 | `VideoGallery`: `modalOpen` keeps the card player unmounted until the expand modal's exit animation finishes (stops double audio) | behaviour | ported to `VideoGallery.tsx` |
| 5 | `PresentationEmbed`: cover-scaled 1920x1080 stage replaced by a fluid, interactive 16:9 iframe with an "Open full deck" link | behaviour + layout | ported, minus the URL rewriting (below) |
| 6 | `SelectedWorkSlide` Presentation tab: 16:9 frame that never crops, wider gap, summary and "Open the full deck" link in the side panel | layout | ported, with two fixes (below) |
| 7 | `vite.config.js`: dev/preview proxy that strips `X-Frame-Options` from famysys.com | tooling | not applicable, not ported |

## Deliberate deviations from his code

**`resolveEmbedSrc` is not ported.** It reads `import.meta.env.DEV`, which does not exist under
Next, sends dev traffic to a `/corporate-embed/` Vite proxy that does not exist here, and rewrites
any `*.famysys.com` host (including `studio.famysys.com`, where this site lives) to a relative
`/corporate/`, which is a 404 on this host. `src` is the CMS's "Embed URL", used as given.

**Open question: the live embed is blank off famysys.com.** `https://famysys.com/corporate/` sends
`X-Frame-Options: SAMEORIGIN`, so no other origin can frame it, before or after this sync. His
proxy hid that in development; his hostname rewrite only helps if the deck is served from
famysys.com itself. Fixing it is a change on the corporate site (allow this origin in
`frame-ancestors`), or a same-origin reverse proxy here. Neither was done.

**Mobile frame is 16:9.** His mobile frame inherits `flex: 1 1 auto` and stretches down the column,
so at 390px wide his iframe measures 356x568 (portrait), contradicting his own comment. Here the
mobile frame is `flex: 0 0 auto` and is 16:9.

**Short landscape phones fit by height.** At 844x390 a full-width 16:9 frame is taller than the
stage and was cropped to its top ~115px. `SelectedWorkSlide` now applies the height-fitted rule
when `(orientation: landscape) and (max-height: 500px)`.

**Tap target.** The "Open full deck" pill is 44px tall on touch (was 36px).

## CMS

- Copy changes (1-3) live in `content.ts`, which is the *seed and fallback* when
  `CONTENT_SOURCE=database`. **The database was not touched.** To publish them, either edit the
  fields in the panel or run `npm run db:seed -- --force` (check `--dry` first; `--force` resets
  every value).
- Video order comes from `deck_items.sort_order` in database mode, so reordering `content.ts`
  changes nothing live until the panel's reorder is used or the seed is forced.
- The Presentation "Summary" and "Full-deck link" fields already existed in the panel but the
  database reader ignored them. His panel now renders both, so `getCapabilityDeckContent.ts`
  reads them.

## Follow-ups, not done

1. **Selected Work "What you send / What comes back" copy is editable in the panel but never read
   back.** `readDeckContentFromDatabase` overlays videos, websites, print images and the
   presentation fields only; `process` always comes from `content.ts`. Existing gap, not from
   this sync. It means the panel cannot edit the Synthesia copy that was just rewritten.
2. Video pagination dots overflow a 320px viewport by ~15px on the 10-video tabs (Synthesia,
   Websites). Existing, unchanged by this sync.
3. Category tab buttons are 30px tall on touch. Existing, unchanged.

## Six-slide deck (later the same week)

Confirmed with the manager: **How We Work is out of the deck**, 7 slides down to 6.

- `DECK_SLIDE_CATALOG` gained `inDefaultDeck`. How We Work is `false`: the slide type stays in
  code and stays offered by "Add a slide", but a fresh deck (the seed, the file-backed
  fallback) does not place it. Slide numbers and the progress dots derive from the slide count,
  so they read 1-6 with no other change; nothing else hardcodes a position.
- `scripts/db-seed.ts` now writes `deck_slides` rows only for default-deck slides (How We Work
  keeps its strings, so adding it back later works).
- **The live database still places How We Work.** Take it out with the panel's "Remove slide"
  (Capability Deck, How We Work). Re-running the seed does not remove it.
- Who We Are: the first highlight now reads **"30+ Years of Founder Experience"** (was "30+
  Years of Experience"), so it cannot be read as the company's age next to "Est. 2022". The
  line beneath it already said "Founder experience spanning ...". Live DB: edit `title` on
  Who We Are in the panel.
- Cover, Services, Ways to Work, Let's Talk: unchanged. The live database already holds his
  cover and services values.
