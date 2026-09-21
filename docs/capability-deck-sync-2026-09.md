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

Logged 2026-09-21. Deliberately **not** fixed in the sync or the priority deploy.

### 1. Selected Work "What you send / What comes back" is editable in the panel but never read back

Editing these fields saves and publishes without error, and changes **nothing** the public page
shows. There is one pair per tab (UGC edits, Motion graphics, Synthesia, AI Video, Digital Print &
Design); the panel holds them as `what-you-send-input[-N]` and `what-comes-back-output[-N]` on the
`selected-work` slide.

- **Cause.** `readDeckContentFromDatabase` (`src/infrastructure/capability-deck/getCapabilityDeckContent.ts`)
  overlays videos, website entries, print images and the Presentation fields onto each portfolio
  category, but never touches `category.process`, so the slide always renders `content.ts`'s copy.
  The same is true of "Tab label" and, for Digital Print & Design, "Tab intro".
- **Fix, when it is done.** Read each field by its own key, the way `WHO_WE_ARE_KEYS` does for Who We
  Are: the keys are positional (`what-you-send-input`, `-2`, `-3`, ... in category order, with
  Websites and Presentation having no pair), so add a keys table beside the reader and a test that
  builds the record and checks each key exists on it. Do not look them up by label; repeated labels
  are exactly what broke Who We Are.
- **Where it bites.** The Synthesia copy was rewritten during the September sync. The database
  holds the new text and so does `content.ts`, so nothing looks wrong today; the first time someone
  edits it in the panel, nothing will change and nothing will say why.

### 2. Mobile at 320px: pagination dots overflow, and category tabs are below the touch minimum

- **Video pagination dots** overflow the viewport by about 15px on the tabs with the most videos
  (Synthesia, 10 clips; Websites). At 320px the dot row is wider than the space beside the counter
  and arrows. It is the `Go to <title>` dot buttons that poke out, not the page: there is no
  document-level horizontal scroll.
- **Category tabs** (UGC edits, Motion graphics, ...) are **30px tall** on touch, below the 44px
  minimum used for every other control on mobile. Their widths are fine.
- Both were measured with the responsive sweep at 320x640 and 360x740 and are unchanged by the
  September sync. They were already present before it.

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
